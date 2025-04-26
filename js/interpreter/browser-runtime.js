/**
 * Browser-specific runtime for the Flex Language
 * Handles web integration for the Flex compiler/interpreter
 */
class FlexBrowserRuntime {
  constructor(editorId, terminalId) {
    // Core components
    this.terminal = null;
    this.editor = null;
    this.compiler = null;
    this.errorHandler = null;
    
    // UI element IDs
    this.editorId = editorId;
    this.terminalId = terminalId;
    
    // Execution state
    this.isExecuting = false;
    this.abortController = null;
    
    // Initialize
    this._initialize();
  }
  
  /**
   * Initialize the browser runtime
   * @private
   */
  _initialize() {
    // Create terminal UI if ID is provided
    if (this.terminalId) {
      this.terminal = new FlexTerminal(this.terminalId);
    }
    
    // Create editor if ID is provided
    if (this.editorId) {
      this.editor = new FlexEditor(this.editorId);
    }
    
    // Create compiler with terminal reference
    this.compiler = new FlexCompiler(this.terminal);
    
    // Create error handler
    this.errorHandler = new FlexErrorHandler(this.terminal, this.editor);
    this.compiler.setErrorHandler(this.errorHandler);
    
    // Log initialization
    console.log('Flex Browser Runtime initialized');
  }
  
  /**
   * Execute Flex code from the editor
   * @returns {Promise<Object>} Execution result
   */
  async executeFromEditor() {
    if (this.isExecuting) {
      this.terminal.writeError('Code is already running');
      return;
    }
    
    // Get code from editor
    const code = this.editor.getCode();
    
    if (!code || !code.trim()) {
      this.terminal.writeError('No code to execute');
      return;
    }
    
    // Start execution
    return await this.execute(code);
  }
  
  /**
   * Execute provided Flex code
   * @param {string} code - Flex code to execute
   * @returns {Promise<Object>} Execution result
   */
  async execute(code) {
    try {
      // Set execution state
      this.isExecuting = true;
      this.abortController = new AbortController();
      
      // Clear previous errors
      this.editor.clearErrors();
      this.errorHandler.clearErrors();
      
      // Show execution status
      this.terminal.writeLine('Starting execution...', 'info');
      
      // Track execution time
      const startTime = performance.now();
      
      // Execute with timeout check
      const executionPromise = this.compiler.compileAndExecute(code);
      
      // Create a timeout for long-running code (10 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Execution timed out (10s). Check for infinite loops.'));
        }, 10000);
      });
      
      // Race between execution and timeout
      const result = await Promise.race([
        executionPromise,
        timeoutPromise
      ]);
      
      // Calculate execution time
      const endTime = performance.now();
      const executionTime = ((endTime - startTime) / 1000).toFixed(3);
      
      // Show execution status
      if (result.success) {
        this.terminal.writeLine(`Execution completed in ${executionTime}s`, 'success');
      } else {
        this.terminal.writeError(`Execution failed: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      this.terminal.writeError(`Execution error: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      // Reset execution state
      this.isExecuting = false;
      this.abortController = null;
    }
  }
  
  /**
   * Stop currently executing code
   */
  stopExecution() {
    if (!this.isExecuting) {
      return;
    }
    
    // Signal abortion
    if (this.abortController) {
      this.abortController.abort();
    }
    
    // Stop the interpreter
    if (this.compiler && this.compiler.interpreter) {
      this.compiler.interpreter.stop();
    }
    
    // Update state
    this.isExecuting = false;
    this.terminal.writeLine('Execution stopped', 'warning');
  }
  
  /**
   * Support for loading and running example programs
   * @param {string} name - Name of the example
   * @returns {Promise<void>}
   */
  async loadExample(name) {
    try {
      const response = await fetch(`examples/${name}.lx`);
      
      if (!response.ok) {
        throw new Error(`Failed to load example: ${response.statusText}`);
      }
      
      const code = await response.text();
      this.editor.setCode(code);
      
      this.terminal.writeLine(`Example "${name}" loaded successfully`, 'info');
    } catch (error) {
      this.terminal.writeError(`Failed to load example: ${error.message}`);
    }
  }
  
  /**
   * Enable support for Arabic keywords in the Flex language
   * @param {boolean} enable - Whether to enable Arabic keywords
   */
  enableArabicKeywords(enable = true) {
    if (!this.compiler || !this.compiler.lexer) {
      return;
    }
    
    // Update lexer configuration
    this.compiler.lexer.useArabicKeywords = enable;
    
    // Log status
    this.terminal.writeLine(
      enable 
        ? 'Arabic keyword support enabled (etb3, da5l, d5l)' 
        : 'Arabic keyword support disabled',
      'info'
    );
  }
}
