const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PythonShell } = require('python-shell');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set trust proxy for proper IP handling behind a reverse proxy
app.set('trust proxy', 1);

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "localhost:*", "127.0.0.1:*", "ws:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
    reportOnly: false
  }
})); // Set various HTTP headers for security
app.use(xss()); // Sanitize user input

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Middleware
// Example CORS configuration 
app.use(cors({
  origin: ['https://flex.mikawi.org', 'http://192.168.1.23:3000']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Create temp directory for user code files if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Store active executions
const activeExecutions = new Map();

// Store WebSocket clients
const clients = new Map();

// Handle WebSocket connection
wss.on('connection', (ws, req) => {
  // Generate a client ID
  const clientId = uuidv4();
  clients.set(clientId, ws);
  logger.info(`Client connected: ${clientId}`);

  // Set up ping-pong heartbeat to keep connection alive
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  // Setup heartbeat interval for this connection
  const heartbeatInterval = setInterval(() => {
    if (ws.isAlive === false) {
      logger.warn(`Terminating stale WebSocket connection for client ${clientId}`);
      clearInterval(heartbeatInterval);
      clients.delete(clientId);
      return ws.terminate();
    }
    
    // Mark as not alive until we get a pong back
    ws.isAlive = false;
    try {
      ws.ping();
    } catch (err) {
      logger.error(`Error pinging client ${clientId}: ${err.message}`);
    }
  }, 30000); // Check every 30 seconds

  // Send the client ID to the client
  ws.send(JSON.stringify({ type: 'connected', clientId }));
  
  // Handle WebSocket messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      // Reset heartbeat on any message 
      ws.isAlive = true;
      
      if (data.type === 'register_execution') {
        // Associate this client with an execution
        const executionId = data.executionId;
        
        if (executionId && activeExecutions.has(executionId)) {
          const execution = activeExecutions.get(executionId);
          execution.clientId = clientId;
          logger.info(`Registered client ${clientId} for execution ${executionId}`);
          
          // If the execution is already waiting for input, notify the client immediately
          if (execution.waitingForInput) {
            sendInputRequestToClient(ws, executionId, 0);
            logger.info(`Sent input_request to client ${clientId} (immediate notification)`);
          }
        } else {
          logger.warn(`Client ${clientId} tried to register for unknown execution ${executionId}`);
        }
      } else if (data.type === 'input') {
        // Handle input from client
        const executionId = data.executionId;
        const input = data.content;
        
        if (executionId && activeExecutions.has(executionId)) {
          const execution = activeExecutions.get(executionId);
          
          if (execution.waitingForInput && execution.pyProcess) {
            logger.info(`Received input for execution ${executionId}: "${input}"`);
            execution.waitingForInput = false;
            
            // Send the input to the Python process
            try {
              execution.pyProcess.stdin.write(input + '\n');
              logger.info(`Sent input to Python process for execution ${executionId}`);
              
              // Send immediate acknowledgment to client that input was processed
              ws.send(JSON.stringify({ 
                type: 'input_processed',
                executionId: executionId,
                timestamp: Date.now()
              }));
              
              // Resume the timeout
              if (typeof execution.startTimeout === 'function') {
                execution.startTimeout();
                logger.info(`Resumed timeout for execution ${executionId}`);
              }
            } catch (error) {
              logger.error(`Error sending input to Python process: ${error.message}`);
              ws.send(JSON.stringify({ 
                type: 'error', 
                content: `Failed to process input: ${error.message}` 
              }));
            }
          } else {
            logger.warn(`Received input for execution ${executionId} but it's not waiting for input`);
            // Notify client that execution is not waiting for input
            ws.send(JSON.stringify({ 
              type: 'error', 
              content: 'Execution is not waiting for input' 
            }));
          }
        } else {
          logger.warn(`Received input for unknown execution ${executionId}`);
        }
      } else if (data.type === 'stop_execution') {
        // Stop an execution
        const executionId = data.executionId;
        
        if (executionId && activeExecutions.has(executionId)) {
          logger.info(`Client ${clientId} requested to stop execution ${executionId}`);
          cleanupExecution(executionId);
        }
      } else if (data.type === 'ping') {
        // Respond to client pings
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch (err) {
      logger.error(`Error processing WebSocket message: ${err.message}`);
    }
  });
  
  // Handle WebSocket close
  ws.on('close', () => {
    logger.info(`Client disconnected: ${clientId}`);
    clients.delete(clientId);
    
    // Optional: You could clean up any executions associated with this client
    // This depends on your use case - whether you want to terminate executions when client disconnects
  });
});

// Function to handle Flex code execution with input support
async function executeFlexCode(code) {
  // Define timeout duration at the top
  const timeoutDuration = 30000; // 30 seconds
  
  // Generate a unique ID and filename for this execution
  const executionId = uuidv4();
  const filename = `code_${executionId}.lx`;
  const filepath = path.join(tempDir, filename);
  
  // Clean up any old temporary files
  try {
    const files = fs.readdirSync(tempDir);
    const currentTime = Date.now();
    files.forEach(file => {
      if (file.startsWith('code_') && file.endsWith('.lx')) {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        // Remove files older than 1 hour
        if (currentTime - stats.mtimeMs > 3600000) {
          try {
            fs.unlinkSync(filePath);
            logger.info(`Cleaned up old temporary file: ${file}`);
          } catch (err) {
            logger.error(`Error cleaning up temporary file ${file}: ${err.message}`);
          }
        }
      }
    });
  } catch (err) {
    logger.error(`Error cleaning up temporary files: ${err.message}`);
  }
  
  // Write the code to a temporary file
  fs.writeFileSync(filepath, code);
  
  logger.info(`Executing Flex code with executionId: ${executionId}`);
  
  return new Promise((resolve, reject) => {
    let output = [];
    let errors = [];
    let timedOut = false;
    
    // Create a child process to run the Python interpreter
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const scriptPath = path.join(__dirname, process.env.FLEX_SRC_PATH || '../..', 'main.py');
    
    logger.info(`Spawning Python process: ${pythonPath} -u ${scriptPath} ${filepath}`);
    
    const pyProcess = spawn(pythonPath, [
      '-u', // Force unbuffered output
      scriptPath,
      filepath
    ], {
      env: {
        ...process.env,
        USE_AI: process.env.USE_FLEX_AI || 'false'
      },
      stdio: ['pipe', 'pipe', 'pipe'] // Make stdin, stdout, stderr all pipes
    });
    
    // Create an execution record
    const execution = {
      executionId,
      pyProcess,
      filepath,
      waitingForInput: false,
      clientId: null,
      timeoutStartTime: Date.now(),
      pausedTimeRemaining: timeoutDuration
    };
    
    // Store in active executions
    activeExecutions.set(executionId, execution);
    
    // Timeout handling
    let timeoutId = null;
    
    // Function to start/resume timeout
    const startTimeout = () => {
      // Clear any existing timeout first
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Set new timeout
      timeoutId = setTimeout(() => {
      timedOut = true;
        if (pyProcess) {
          pyProcess.kill();
        }
        logger.warn(`Code execution timed out after ${timeoutDuration}ms`);
        cleanupExecution(executionId);
      reject({ error: 'Code execution timed out', stderr: ['Execution took too long and was terminated.'] });
      }, execution.pausedTimeRemaining);
      
      // Store the timeout start time for pause calculations
      execution.timeoutStartTime = Date.now();
    };
    
    // Function to pause timeout when waiting for input
    const pauseTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        
        // Calculate remaining time
        const elapsedTime = Date.now() - execution.timeoutStartTime;
        execution.pausedTimeRemaining = Math.max(execution.pausedTimeRemaining - elapsedTime, 1000); // Ensure at least 1 second
        logger.info(`Paused execution timeout with ${execution.pausedTimeRemaining}ms remaining`);
      }
    };
    
    // Store the timeout functions on the execution object
    execution.startTimeout = startTimeout;
    execution.pauseTimeout = pauseTimeout;
    
    // Initial timeout start
    startTimeout();
    
    // Handle stdout
    pyProcess.stdout.on('data', (data) => {
      const message = data.toString();
      logger.info(`Received stdout: "${message.trim()}"`);
      
      // Check for input request token - multiple detection methods for robustness
      const isInputRequest = 
        message.trim() === '__FLEX_INPUT_REQUEST__' || 
        message.includes('__FLEX_INPUT_REQUEST__') ||
        message.includes('Waiting for input'); // Additional fallback check
        
      if (isInputRequest) {
        execution.waitingForInput = true;
        logger.info(`Input request detected for execution ${executionId}`);
        
        // Add timestamp for debugging
        execution.inputRequestTime = Date.now();
        
        // Pause the timeout while waiting for input
        pauseTimeout();
        
        // Make sure any pending output has been added to the output buffer
        const pendingOutput = execution.pendingOutput || [];
        if (pendingOutput.length > 0) {
          output.push(...pendingOutput);
          
          // Send any pending output to the client before the input request
          if (execution.clientId && clients.has(execution.clientId)) {
            const ws = clients.get(execution.clientId);
            if (ws.readyState === WebSocket.OPEN) {
              pendingOutput.forEach(outputMsg => {
                ws.send(JSON.stringify({
                  type: 'output',
                  executionId: executionId,
                  data: outputMsg
                }));
              });
            }
          }
          
          // Clear pending output after sending
          execution.pendingOutput = [];
        }
        
        // Notify the client via WebSocket - ensure this message gets through
        if (execution.clientId && clients.has(execution.clientId)) {
          const ws = clients.get(execution.clientId);
          if (ws.readyState === WebSocket.OPEN) {
            // Send multiple times to ensure delivery with exponential backoff
            sendInputRequestToClient(ws, executionId, 0);
          } else {
            logger.error(`Client ${execution.clientId} WebSocket not open`);
            // Try to broadcast as fallback
            broadcastInputRequest(executionId);
          }
        } else {
          // Broadcast to all clients if specific client not found
          broadcastInputRequest(executionId);
        }
      } else {
        // For regular output, add to output buffer
        output.push(message);
        
        // Store pending output in case an input request follows
        if (!execution.pendingOutput) {
          execution.pendingOutput = [];
        }
        execution.pendingOutput.push(message);
        
        // If a client is connected, send the output in real-time
        if (execution.clientId && clients.has(execution.clientId)) {
          const ws = clients.get(execution.clientId);
          if (ws.readyState === WebSocket.OPEN) {
            // Sanitize message before sending to remove any input tokens
            const cleanMessage = !isInputRequest ? message : '';
            // Send the output to the client
            ws.send(JSON.stringify({
              type: 'output',
              executionId: executionId,
              data: cleanMessage
            }));
          }
        }
      }
    });
    
    // Handle stderr
    pyProcess.stderr.on('data', (data) => {
      const errorMsg = data.toString().trim();
      errors.push(errorMsg);
      
      // Send via WebSocket if connected
      if (execution.clientId && clients.has(execution.clientId)) {
        const ws = clients.get(execution.clientId);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'error', content: errorMsg }));
        }
      }
      
      logger.error(`Error in execution ${executionId}: ${errorMsg}`);
    });
    
    // Handle process completion
    pyProcess.on('close', (code) => {
      // Clear timeout to prevent it from firing after process ends
      if (timeoutId) {
      clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      logger.info(`Python process exited with code ${code} for execution ${executionId}`);
      
      // Notify client that execution is complete
      if (execution.clientId && clients.has(execution.clientId)) {
        const ws = clients.get(execution.clientId);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'execution_complete' }));
        }
      }
      
      // Don't resolve/reject if timed out as it's already been handled
      if (!timedOut) {
        cleanupExecution(executionId);
        
        if (code === 0) {
          // Success - Convert output array to string for frontend compatibility
          resolve({ 
            executionId, 
            output: output.join('\n'), 
            stderr: errors.length > 0 ? errors.join('\n') : null 
          });
        } else {
          // Error
          reject({ 
            error: 'Code execution failed', 
            stderr: errors.length > 0 ? errors : ['Execution failed with no specific error message'] 
          });
        }
      }
    });
    
    // Handle process errors
    pyProcess.on('error', (err) => {
      clearTimeout(timeoutId);
      logger.error(`Failed to start Python process for execution ${executionId}: ${err.message}`);
      cleanupExecution(executionId);
      reject({ error: 'Failed to start Python process', stderr: [err.message] });
    });
  });
}

// Helper function to clean up execution
function cleanupExecution(executionId) {
  if (activeExecutions.has(executionId)) {
    const execution = activeExecutions.get(executionId);
    
    // Kill the Python process if it's still running
    if (execution.pyProcess && !execution.pyProcess.killed) {
      try {
        execution.pyProcess.kill();
        logger.info(`Killed Python process for execution ${executionId}`);
      } catch (err) {
        logger.error(`Error killing process for execution ${executionId}: ${err.message}`);
      }
    }
    
    // Clean up the file
    if (execution.filepath) {
      cleanupFile(execution.filepath);
    }
    
    // Remove from active executions
    activeExecutions.delete(executionId);
    logger.info(`Cleaned up execution ${executionId}`);
  }
}

// Helper function to clean up temporary files
function cleanupFile(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (e) {
    logger.error(`Error deleting temp file: ${e.message}`);
  }
}

// Function to validate code for security concerns
function isValidCode(code) {
  // Check for potentially dangerous imports or system calls
  const dangerousPatterns = [
    /import\s+os/i,
    /import\s+sys/i,
    /import\s+subprocess/i,
    /import\s+shutil/i,
    /exec\(/i,
    /system\(/i,
    /popen\(/i,
    /eval\(/i,
    /os\.\w+\(/i,
    /subprocess\.\w+\(/i
  ];
  
  // Check for unsupported modules to provide better error messages
  const unsupportedModules = [
    { pattern: /import\s+requests/i, message: "The 'requests' module is not supported in this environment." }
  ];
  
  // Check for unsupported modules and provide specific warnings
  for (const module of unsupportedModules) {
    if (module.pattern.test(code)) {
      logger.warn(`Unsupported module in code: ${module.pattern}`);
      throw new Error(module.message);
    }
  }
  
  // Check if code contains any dangerous patterns
  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      logger.warn(`Potentially dangerous code detected: ${pattern}`);
      return false;
    }
  }
  
  // Check for maximum code length to prevent DoS
  const MAX_CODE_LENGTH = 10000; // 10KB
  if (code.length > MAX_CODE_LENGTH) {
    logger.warn(`Code exceeds maximum length: ${code.length} > ${MAX_CODE_LENGTH}`);
    return false;
  }
  
  return true;
}

// Handle execution request
app.post('/api/execute', async (req, res) => {
  try {
    const code = req.body.code;
    
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }
    
    // Prevent extremely large code submissions
    if (code.length > 50000) {
      return res.status(400).json({ error: 'Code size exceeds maximum limit (50KB)' });
    }
    
    // Execute the code
    logger.info('Executing Flex code');
    const result = await executeFlexCode(code);
    
    // Check if result contains a timed out flag
    if (result.timeout) {
      logger.warn('Code execution timed out');
      return res.status(504).json({ error: 'Code execution timed out' });
    }
    
    // Filter input request tokens from output if needed
    if (result.output && typeof result.output === 'string') {
      // Filter out any input request tokens from the output
      result.output = result.output
        .split('\n')
        .filter(line => line.trim() !== '__FLEX_INPUT_REQUEST__')
        .join('\n');
    }
    
    res.json(result);
  } catch (error) {
    logger.error(`Error executing code: ${error.message}`);
    res.status(500).json({ error: 'Failed to execute code', stderr: error.stderr || [error.message] });
  }
});

// API endpoint for sending input via HTTP
app.post('/api/input', async (req, res) => {
  try {
    const { executionId, input } = req.body;
    
    // Validate request
    if (!executionId) {
      logger.warn('Received input request without executionId');
      return res.status(400).json({ 
        status: 'error',
        error: 'Execution ID is required' 
      });
    }
    
    if (input === undefined || input === null) {
      logger.warn(`Received input request for execution ${executionId} without input`);
      return res.status(400).json({ 
        status: 'error',
        error: 'Input is required' 
      });
    }
    
    // Check if execution exists
    if (!activeExecutions.has(executionId)) {
      logger.warn(`Received input for unknown execution ${executionId}`);
      return res.status(404).json({ 
        status: 'error',
        error: 'Execution not found' 
      });
    }
    
    const execution = activeExecutions.get(executionId);
    
    // Check if execution is waiting for input
    if (!execution.waitingForInput) {
      logger.warn(`Received input for execution ${executionId} but it's not waiting for input`);
      return res.status(400).json({ 
        status: 'error',
        error: 'Execution is not waiting for input' 
      });
    }
    
    // Send the input to the Python process
    try {
      execution.pyProcess.stdin.write(input + '\n');
      execution.waitingForInput = false;
      
      // Resume the timeout
      if (typeof execution.startTimeout === 'function') {
        execution.startTimeout();
        logger.info(`Resumed timeout for execution ${executionId}`);
      }
      
      logger.info(`Input sent to execution ${executionId} via HTTP API`);
      
      return res.json({ 
        status: 'success',
        message: 'Input processed successfully'
      });
    } catch (processError) {
      logger.error(`Error sending input to process: ${processError.message}`);
      return res.status(500).json({ 
        status: 'error',
        error: `Failed to send input to execution: ${processError.message}` 
      });
    }
  } catch (error) {
    logger.error(`Error processing input request: ${error.message}`);
    return res.status(500).json({ 
      status: 'error',
      error: 'Server error processing input request' 
    });
  }
});

// Diagnostic route to test input handling
app.get('/api/test-input', (req, res) => {
  try {
    // Count active WebSocket connections
    let activeConnections = 0;
    wss.clients.forEach(() => {
      activeConnections++;
    });
    
    // Count active executions
    const activeExecutionCount = activeExecutions.size;
    
    // Prepare list of active executions
    const executionList = [];
    activeExecutions.forEach((execution, id) => {
      executionList.push({
        id,
        waitingForInput: execution.waitingForInput,
        hasClient: !!execution.clientId,
        clientId: execution.clientId || null
      });
    });
    
    // Return diagnostic info
    res.json({
      status: 'ok',
      websocket: {
        active: true,
        connections: activeConnections
      },
      executions: {
        count: activeExecutionCount,
        list: executionList
      },
      message: 'WebSocket diagnostics complete'
    });
  } catch (error) {
    logger.error(`Error in diagnostic route: ${error.message}`);
    res.status(500).json({ error: 'Diagnostic check failed', message: error.message });
  }
});

// API endpoint for examples
app.get('/api/examples', (req, res) => {
  try {
    const examplesDir = path.join(__dirname, '../frontend/examples');
    const examples = [];
    
    // Read the examples directory
    const files = fs.readdirSync(examplesDir);
    
    // Process each file
    files.forEach(file => {
      if (file.endsWith('.lx')) {
        const filePath = path.join(examplesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract first line as title or use filename
        const lines = content.split('\n');
        const title = lines[0].startsWith('//') 
          ? lines[0].substring(2).trim() 
          : file.replace('.lx', '');
        
        // Add to examples list
        examples.push({
          id: file.replace('.lx', ''),
          title: title,
          filename: file,
          content: content
        });
      }
      });
    
    res.json(examples);
  } catch (error) {
    logger.error(`Error fetching examples: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch examples' });
  }
});

// API endpoint for documentation
app.get('/api/docs/:doc', (req, res) => {
  try {
    const docName = req.params.doc;
    const docPath = path.join(__dirname, '../docs', `${docName}.md`);
    
    // Check if file exists
    if (!fs.existsSync(docPath)) {
      return res.status(404).json({ error: 'Documentation not found' });
    }
    
    // Read the documentation file
    const content = fs.readFileSync(docPath, 'utf8');
    res.json({ content });
  } catch (error) {
    logger.error(`Error fetching documentation: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch documentation' });
  }
});

// API endpoint for monitoring input status
app.get('/api/input-status', (req, res) => {
  try {
    const waitingExecutions = [];
    
    // Check all active executions
    activeExecutions.forEach((execution, id) => {
      if (execution.waitingForInput) {
        waitingExecutions.push({
          id,
          waitingSince: execution.inputRequestTime || Date.now(),
          hasClient: !!execution.clientId,
          clientId: execution.clientId || null
        });
      }
    });
    
    // Return status info
    res.json({
      status: 'ok',
      waitingExecutions,
      activeExecutionCount: activeExecutions.size,
      clientCount: clients.size
    });
  } catch (error) {
    logger.error(`Error checking input status: ${error.message}`);
    res.status(500).json({ error: 'Failed to check input status' });
  }
});

// Function to send input request to client with retries
function sendInputRequestToClient(ws, executionId, attempt) {
  try {
    // Send with a priority flag to ensure it's processed correctly
    ws.send(JSON.stringify({ 
      type: 'input_request',
      priority: true,
      executionId: executionId,
      timestamp: Date.now(),
      attempt: attempt
    }));
    
    logger.info(`Sent input_request to client for execution ${executionId} (attempt ${attempt})`);
    
    // Retry a few times with exponential backoff to ensure delivery
    if (attempt < 2) {
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          sendInputRequestToClient(ws, executionId, attempt + 1);
        }
      }, 1000 * Math.pow(2, attempt)); // 1s, 2s, 4s backoff
    }
  } catch (err) {
    logger.error(`Error sending input request: ${err.message}`);
  }
}

// Function to broadcast input request to all clients
function broadcastInputRequest(executionId) {
  logger.warn(`No client connected for execution ${executionId}, broadcasting input request`);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ 
        type: 'input_request',
        executionId: executionId,
        broadcast: true,
        timestamp: Date.now()
      }));
    }
  });
}

// Start the server
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});