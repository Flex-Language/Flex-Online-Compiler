// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize CodeMirror editor
    const editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
        mode: 'flex',
        theme: 'dracula',
        lineNumbers: true,
        indentUnit: 4,
        matchBrackets: true,
        autoCloseBrackets: true,
        tabSize: 4,
        indentWithTabs: false,
        extraKeys: {
            'Tab': function(cm) {
                cm.replaceSelection('    ', 'end');
            },
            'Ctrl-S': function(cm) {
                saveToLocalStorage('flex_code', cm.getValue());
                showToast('Code saved to browser storage');
            },
            'Ctrl-Enter': function(cm) {
                document.getElementById('run-button').click();
            }
        }
    });

    // Input handling variables - New Addition
    let inputQueue = [];
    let awaitingInput = false;
    let programRunning = false;
    let executionId = null;

    // Preload examples and documentation
    console.log('Preloading examples and documentation...');
    // Preload examples in background
    fetch('/api/examples')
        .then(response => response.json())
        .then(examples => {
            console.log('Successfully preloaded examples:', examples.length);
            window.preloadedExamples = examples;
        })
        .catch(error => {
            console.error('Error preloading examples:', error);
        });
    
    // Preload README documentation
    fetch('/api/docs/README')
        .then(response => response.json())
        .then(data => {
            console.log('Successfully preloaded README');
            window.preloadedDocs = window.preloadedDocs || {};
            window.preloadedDocs['README'] = data.content;
        })
        .catch(error => {
            console.error('Error preloading README:', error);
        });

    // Check for code in URL hash (shared code)
    if (window.location.hash) {
        try {
            const decodedCode = decodeURIComponent(window.location.hash.substring(1));
            if (decodedCode) {
                editor.setValue(decodedCode);
                showToast('Code loaded from shared URL');
            }
        } catch (e) {
            console.error('Error loading shared code:', e);
        }
    } else {
        // Load from local storage or use default
        const savedCode = localStorage.getItem('flex_code');
        if (savedCode) {
            editor.setValue(savedCode);
        } else {
            // Default code example
            const defaultCode = `// Welcome to Flex Online Compiler
// Try running this sample code:

rakm x = 10
y = 20
z = x + y

print("Sum of {x} and {y} is {z}")

for (i = 0; i < 5; i++) {
    print("Loop iteration: {i}")
}`;
            editor.setValue(defaultCode);
        }
    }

    // Add a toast container to the body
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    // Add a share button to the toolbar
    const toolbar = document.querySelector('.editor-card .card-header .btn-group');
    const shareButton = document.createElement('button');
    shareButton.id = 'share-button';
    shareButton.className = 'btn btn-info';
    shareButton.innerHTML = '<i class="bi bi-share"></i> Share';
    shareButton.addEventListener('click', function() {
        const code = editor.getValue();
        const url = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(code)}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(url).then(function() {
            showToast('Share link copied to clipboard!');
        }, function(err) {
            console.error('Could not copy URL: ', err);
            showToast('Error creating share link.', 'error');
        });
    });
    toolbar.appendChild(shareButton);

    // Set up navigation between pages
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the page to show from data attribute
            const pageToShow = this.getAttribute('data-page');
            
            // Remove active class from all links and add to clicked link
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all pages and show the selected page
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(`${pageToShow}-page`).classList.add('active');
            
            // If we're switching to examples page, load examples if not already loaded
            if (pageToShow === 'examples' && !document.querySelector('.example-card')) {
                loadExamples();
            }
            
            // If we're switching to documentation page, load README by default if not already loaded
            if (pageToShow === 'documentation' && !document.querySelector('#doc-content').innerHTML) {
                loadDocumentation('README');
            }
        });
    });

    // Initialize WebSocket for real-time communication - New Addition
    let socket = null;
    
    // Function to setup WebSocket connection
    function setupWebSocket() {
        // Use secure WebSocket if the page is served over HTTPS
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log(`Setting up WebSocket connection to ${wsUrl}`);
        
        // Close existing socket if it exists
        if (socket) {
            try {
                socket.close();
            } catch (e) {
                console.error('Error closing existing socket:', e);
            }
        }
        
        // Clear any existing ping interval
        if (window.pingInterval) {
            clearInterval(window.pingInterval);
        }
        
        socket = new WebSocket(wsUrl);
        
        socket.onopen = function() {
            console.log('WebSocket connection established');
            appendToOutput('<div class="system-message">WebSocket connected</div>');
            
            // Set up heartbeat ping
            window.pingInterval = setInterval(() => {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    try {
                        socket.send(JSON.stringify({ 
                            type: 'ping', 
                            timestamp: Date.now() 
                        }));
                        console.log('Ping sent to server');
                    } catch (e) {
                        console.error('Error sending ping:', e);
                    }
                }
            }, 25000); // Ping every 25 seconds (server checks every 30s)
            
            // If there's an active execution, register it
            if (executionId && programRunning) {
                console.log(`Re-registering execution ${executionId} with new WebSocket connection`);
                socket.send(JSON.stringify({ 
                    type: 'register_execution', 
                    executionId: executionId 
                }));
                
                // If we were waiting for input, re-check status
                if (awaitingInput) {
                    updateInputStatus(true);
                }
            }
        };
        
        socket.onmessage = function(event) {
            console.log('WebSocket message received:', event.data);
            
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'input_request') {
                    console.log('Input request received', data);
                    
                    // Set the current execution ID
                    executionId = data.executionId;
                    
                    // Register as client for this execution
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            type: 'register',
                            executionId: executionId
                        }));
                        console.log(`Registered as client for execution ${executionId}`);
                    }
                    
                    // Update the input status
                    awaitingInput = true;
                    updateInputStatus(true, data.prompt || 'Input required');
                    
                    // Add toast notification for input request
                    showToast('Input Required', 'The program is waiting for input', 'info');
                    
                    // Focus the input field after a small delay to ensure it's visible
                    setTimeout(() => {
                        const inputField = document.getElementById('input-field');
                        if (inputField) {
                            inputField.focus();
                        }
                    }, 10);
                } else if (data.type === 'input_processed') {
                    console.log('Input processed acknowledgment received', data);
                    
                    // Clear input waiting state
                    awaitingInput = false;
                    updateInputStatus(false);
                    
                    // Show processing notification
                    appendToOutput('<div class="system-message">Input processed, continuing execution...</div>');
                    
                    // Clear input field
                    document.getElementById('input-field').value = '';
                } else if (data.type === 'execution_complete') {
                    console.log('Execution complete notification received');
                    programRunning = false;
                    awaitingInput = false;
                    updateInputStatus(false);
                    
                    // Reset the run button text back to "Run"
                    document.getElementById('run-button').innerHTML = '<i class="bi bi-play-fill"></i> Run';
                    
                    // Remove highlight from input area
                    document.querySelector('.input-container').classList.remove('highlight');
                    
                    // Add completion message
                    appendToOutput('<div class="execution-complete">Execution completed</div>');
                } else if (data.type === 'output') {
                    // Check for both data and content fields
                    const outputContent = data.data || data.content;
                    if (outputContent) {
                        appendToOutput(outputContent);
                    }
                } else if (data.type === 'error') {
                    appendToOutput(`<span class="output-error">${data.content}</span>`);
                }
            } catch (e) {
                console.error('Error parsing WebSocket message:', e);
            }
        };
        
        socket.onclose = function() {
            console.log('WebSocket connection closed');
            
            // Clear ping interval
            if (window.pingInterval) {
                clearInterval(window.pingInterval);
                window.pingInterval = null;
            }
            
            // Try to reconnect after a delay
            setTimeout(setupWebSocket, 3000);
        };
        
        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
    }
    
    // Try to setup WebSocket initially
    setupWebSocket();

    // Run button functionality - Updated for input handling
    document.getElementById('run-button').addEventListener('click', function() {
        const code = editor.getValue();
        const outputArea = document.getElementById('output-area');
        
        // Stop execution if a program is already running
        if (programRunning) {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'stop_execution', executionId }));
            }
            
            programRunning = false;
            awaitingInput = false;
            updateInputStatus(false);
            outputArea.innerHTML += '<div class="output-error">Execution stopped</div>';
            return;
        }
        
        // Save code to local storage
        saveToLocalStorage('flex_code', code);
        
        // Clear previous output and reset state
        outputArea.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
        inputQueue = [];
        updateInputQueue();
        
        // Send code to the backend for execution
        fetch('/api/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `Server responded with status ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                outputArea.innerHTML = `<span class="output-error">${data.error}</span>`;
                if (data.stderr) {
                    outputArea.innerHTML += `<br><pre class="output-error">${data.stderr}</pre>`;
                }
            } else {
                // Always clear the spinner
                outputArea.innerHTML = '';
                
                if (data.output) {
                    // Format the output nicely
                    try {
                        // Ensure we have a string we can split
                        const outputStr = typeof data.output === 'string' ? 
                            data.output : 
                            (Array.isArray(data.output) ? data.output.join('\n') : String(data.output));
                            
                        const lines = outputStr.split('\n');
                        for (const line of lines) {
                            const lineElement = document.createElement('div');
                            lineElement.textContent = line;
                            outputArea.appendChild(lineElement);
                        }
                    } catch (error) {
                        console.error('Error processing output:', error);
                        outputArea.innerHTML = `<div class="output-error">Error processing output: ${error.message}</div>`;
                        if (data.output) {
                            outputArea.innerHTML += `<div class="mt-2">Raw output: ${JSON.stringify(data.output)}</div>`;
                        }
                    }
                } else {
                    outputArea.innerHTML = '<span class="text-muted">No output</span>';
                }
                
                if (data.stderr && data.stderr.trim()) {
                    const errorElement = document.createElement('div');
                    errorElement.className = 'output-error mt-3';
                    errorElement.innerHTML = `<strong>Errors:</strong><pre>${data.stderr}</pre>`;
                    outputArea.appendChild(errorElement);
                }
                
                // Start long-polling or use WebSocket for input handling if needed
                if (data.executionId) {
                    executionId = data.executionId;
                    programRunning = true;
                    console.log(`Execution started with ID: ${executionId}`);
                    
                    // Ensure the run button text changes to "Stop"
                    document.getElementById('run-button').innerHTML = '<i class="bi bi-stop-fill"></i> Stop';
                    
                    // If WebSocket is available, register this execution
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        console.log(`Registering execution ${executionId} with WebSocket`);
                        socket.send(JSON.stringify({ 
                            type: 'register_execution', 
                            executionId: data.executionId 
                        }));
                    } else {
                        console.error('WebSocket not connected, cannot register execution');
                        appendToOutput('<div class="output-error">WebSocket not connected. Input handling may not work properly.</div>');
                        // Try to reconnect
                        setupWebSocket();
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error connecting to server:', error);
            
            // Remove the spinner
            document.getElementById('output-area').innerHTML = '';
            
            // Show error message
            const errorMessage = `<div class="alert alert-danger">
                <strong>Error connecting to server:</strong> ${error.message || 'Unknown error'}
                <hr>
                <small>If this issue persists, please refresh the page or contact support.</small>
            </div>`;
            
            document.getElementById('output-area').innerHTML = errorMessage;
            
            // Re-enable run button
            document.getElementById('run-button').innerHTML = '<i class="bi bi-play-fill"></i> Run';
            programRunning = false;
            awaitingInput = false;
            updateInputStatus(false);
        });
        
        // If we're starting a new execution, reset input status checks
        if (!programRunning) {
            setupInputStatusCheck();
        }
    });

    // Input handling functions - New Addition
    document.getElementById('send-input-button').addEventListener('click', function() {
        const inputField = document.getElementById('input-field');
        const inputValue = inputField.value.trim();
        
        if (inputValue) {
            if (awaitingInput) {
                sendInputToServer(inputValue);
                awaitingInput = false;
                updateInputStatus(false);
            } else {
                // Add to queue
                inputQueue.push(inputValue);
                updateInputQueue();
            }
            
            // Clear the input field
            inputField.value = '';
        }
    });
    
    // Also handle Enter key in input field
    document.getElementById('input-field').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('send-input-button').click();
        }
    });
    
    // Function to send input to the server
    function sendInputToServer(input) {
        // Make sure we have an execution ID
        if (!executionId) {
            console.error('Cannot send input: No active execution ID');
            appendToOutput('<div class="output-error">Error: Cannot send input - no active execution</div>');
            return;
        }

        // Add the input to the output area so user can see what was entered
        appendToOutput(`<strong>></strong> ${input}`);
        
        // Show a temporary processing message
        const processingMsg = appendToOutput('<div class="system-message processing-message">Processing input...</div>');
        
        // Track if the input was acknowledged
        let inputAcknowledged = false;
        
        // Set a timeout to detect if the input isn't acknowledged
        const inputTimeout = setTimeout(() => {
            if (!inputAcknowledged) {
                console.error('Input acknowledgment timeout');
                document.querySelectorAll('.processing-message').forEach(el => el.remove());
                appendToOutput('<div class="output-error">Input processing timeout. The server may be busy or unresponsive.</div>');
                
                // Reset waiting status
                awaitingInput = false;
                updateInputStatus(false);
                
                // Attempt to reconnect WebSocket
                if (socket) {
                    try {
                        socket.close();
                    } catch (e) {
                        console.error('Error closing socket:', e);
                    }
                }
                setupWebSocket();
            }
        }, 10000); // 10 second timeout
        
        // Prepare listener for input_processed message
        const inputProcessedListener = function(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'input_processed') {
                    inputAcknowledged = true;
                    clearTimeout(inputTimeout);
                    document.querySelectorAll('.processing-message').forEach(el => el.remove());
                    
                    // Remove this listener after processing
                    if (socket) {
                        socket.removeEventListener('message', inputProcessedListener);
                    }
                }
            } catch (e) {
                console.error('Error in input processed listener:', e);
            }
        };
        
        // Add temp listener for input_processed event
        if (socket) {
            socket.addEventListener('message', inputProcessedListener);
        }
        
        // Send via WebSocket if available
        if (socket && socket.readyState === WebSocket.OPEN) {
            try {
                socket.send(JSON.stringify({
                    type: 'input',
                    executionId,
                    content: input
                }));
                console.log(`Input sent via WebSocket for execution ${executionId}`);
            } catch (error) {
                console.error('Error sending input via WebSocket:', error);
                // Fall back to AJAX
                sendInputViaHttp(input);
            }
        } else {
            console.log('WebSocket not available, falling back to HTTP');
            // Fallback to AJAX if WebSocket is not available
            sendInputViaHttp(input);
        }
        
        // Reset input field
        document.getElementById('input-field').value = '';
    }
    
    // Function to send input via HTTP fallback
    function sendInputViaHttp(input) {
        console.log(`Sending input via HTTP for execution ${executionId}`);
        
        fetch('/api/input', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                executionId,
                input 
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || `Server responded with status ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                console.log('Input processed successfully via HTTP');
                appendToOutput('<div class="system-message">Input sent successfully via HTTP</div>');
                
                // Clear waiting status
                awaitingInput = false;
                updateInputStatus(false);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        })
        .catch(error => {
            console.error('Error sending input via HTTP:', error);
            appendToOutput(`<div class="output-error">Failed to send input: ${error.message}</div>`);
        });
    }
    
    // Function to update the input queue display
    function updateInputQueue() {
        const queueElement = document.getElementById('input-queue');
        queueElement.innerHTML = '';
        
        if (inputQueue.length === 0) {
            return;
        }
        
        // Add each queued input to the display
        inputQueue.forEach((input, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'input-queue-item';
            itemElement.innerHTML = `
                <span>${index + 1}. ${input}</span>
                <button class="remove-input" data-index="${index}">×</button>
            `;
            queueElement.appendChild(itemElement);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-input').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                inputQueue.splice(index, 1);
                updateInputQueue();
            });
        });
    }
    
    // Function to update the input status display
    function updateInputStatus(waiting, prompt = '') {
        const statusElement = document.getElementById('input-status');
        const inputContainer = document.querySelector('.input-container');
        const inputField = document.getElementById('input-field');
        
        if (waiting) {
            statusElement.textContent = prompt;
            statusElement.classList.add('waiting');
            
            // Make input field more noticeable
            inputContainer.classList.add('highlight');
            
            // Focus the input field
            inputField.focus();
            
            // Scroll to input area
            inputContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add a visual indicator to the page title
            document.title = '⚠️ Input Needed - Flex Online Compiler';
        } else {
            statusElement.textContent = 'Not waiting for input';
            statusElement.classList.remove('waiting');
            
            // Reset input field appearance
            inputContainer.classList.remove('highlight');
            
            // Reset title
            document.title = 'Flex Online Compiler';
        }
    }
    
    // Function to append text to the output area
    function appendToOutput(text) {
        const outputArea = document.getElementById('output-area');
        const lineElement = document.createElement('div');
        lineElement.innerHTML = text;
        outputArea.appendChild(lineElement);
        
        // Scroll to the bottom
        outputArea.scrollTop = outputArea.scrollHeight;
    }

    // Clear button functionality
    document.getElementById('clear-button').addEventListener('click', function() {
        editor.setValue('');
    });

    // Clear output button functionality
    document.getElementById('clear-output-button').addEventListener('click', function() {
        document.getElementById('output-area').innerHTML = '';
    });

    // Save button functionality
    document.getElementById('save-button').addEventListener('click', function() {
        const code = editor.getValue();
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'flex_code.lx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Keyboard shortcuts panel functionality - New Implementation
    const shortcutsLink = document.getElementById('shortcuts-link');
    const shortcutsPanel = document.getElementById('shortcuts-panel');
    const shortcutsClose = document.getElementById('shortcuts-close');
    
    shortcutsLink.addEventListener('click', function(e) {
        e.preventDefault();
        shortcutsPanel.classList.toggle('show');
    });
    
    shortcutsClose.addEventListener('click', function() {
        shortcutsPanel.classList.remove('show');
    });
    
    // Close shortcuts panel when clicking outside of it
    document.addEventListener('click', function(event) {
        if (!shortcutsPanel.contains(event.target) && 
            !shortcutsLink.contains(event.target) && 
            shortcutsPanel.classList.contains('show')) {
            shortcutsPanel.classList.remove('show');
        }
    });

    // Function to load examples
    function loadExamples() {
        const examplesContainer = document.getElementById('examples-container');
        
        // Show loading indicator
        examplesContainer.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
        
        // Use preloaded examples if available
        if (window.preloadedExamples) {
            console.log('Using preloaded examples');
            displayExamples(window.preloadedExamples);
            return;
        }
        
        // Fetch examples from the server if not preloaded
        console.log('Fetching examples from server');
        fetch('/api/examples')
            .then(response => response.json())
            .then(examples => {
                displayExamples(examples);
            })
            .catch(error => {
                examplesContainer.innerHTML = `<div class="alert alert-danger">Error loading examples: ${error.message}</div>`;
            });
    }
    
    // Function to display examples
    function displayExamples(examples) {
        const examplesContainer = document.getElementById('examples-container');
        examplesContainer.innerHTML = '';
        
        // Create a card for each example
        examples.forEach(example => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            
            const card = document.createElement('div');
            card.className = 'card example-card';
            
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            
            const title = document.createElement('h5');
            title.className = 'card-title';
            title.textContent = example.name;
            
            const preview = document.createElement('div');
            preview.className = 'example-preview mb-3';
            preview.textContent = example.content;
            
            const button = document.createElement('button');
            button.className = 'btn btn-primary';
            button.textContent = 'Try it';
            button.addEventListener('click', function() {
                // Set the editor content to this example
                editor.setValue(example.content);
                
                // Switch to the compiler page
                document.querySelector('[data-page="compiler"]').click();
            });
            
            cardBody.appendChild(title);
            cardBody.appendChild(preview);
            cardBody.appendChild(button);
            card.appendChild(cardBody);
            col.appendChild(card);
            examplesContainer.appendChild(col);
        });
    }

    // Function to load documentation
    function loadDocumentation(docFile) {
        const docContent = document.getElementById('doc-content');
        const docTitle = document.getElementById('doc-title');
        
        // Set active doc link
        document.querySelectorAll('.doc-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-doc') === docFile) {
                link.classList.add('active');
            }
        });
        
        // Update title based on documentation type
        switch (docFile) {
            case 'README':
                docTitle.textContent = 'Getting Started';
                break;
            case 'QUICK_REFERENCE':
                docTitle.textContent = 'Quick Reference';
                break;
            case 'TUTORIAL':
                docTitle.textContent = 'Tutorial';
                break;
            case 'DOCUMENTATION':
                docTitle.textContent = 'Full Documentation';
                break;
            default:
                docTitle.textContent = docFile;
        }
        
        // Show loading indicator
        docContent.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
        
        // Use preloaded documentation if available
        if (window.preloadedDocs && window.preloadedDocs[docFile]) {
            console.log('Using preloaded documentation:', docFile);
            docContent.innerHTML = marked.parse(window.preloadedDocs[docFile]);
            return;
        }
        
        // Fetch documentation from the server if not preloaded
        console.log('Fetching documentation from server:', docFile);
        fetch(`/api/docs/${docFile}`)
            .then(response => response.json())
            .then(data => {
                // Store for future quick access
                window.preloadedDocs = window.preloadedDocs || {};
                window.preloadedDocs[docFile] = data.content;
                
                // Parse and display the markdown content
                docContent.innerHTML = marked.parse(data.content);
            })
            .catch(error => {
                docContent.innerHTML = `<div class="alert alert-danger">Error loading documentation: ${error.message}</div>`;
            });
    }

    // Set up documentation links
    const docLinks = document.querySelectorAll('.doc-link');
    docLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the doc file from data attribute
            const docFile = this.getAttribute('data-doc');
            
            // Remove active class from all links and add to clicked link
            docLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // Load the documentation
            loadDocumentation(docFile);
        });
    });

    // Function to save to local storage with error handling
    function saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    }

    // Function to show toast notifications
    function showToast(title, message, type = 'success') {
        const toastId = `toast-${Date.now()}`;
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'}" role="alert" aria-live="assertive" aria-atomic="true" id="${toastId}">
                <div class="d-flex">
                    <div class="toast-body">
                        <strong>${title}</strong><br>${message}
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        const container = document.getElementById('toast-container');
        container.insertAdjacentHTML('beforeend', toastHtml);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
        toast.show();
        
        // Remove toast from DOM after it's hidden
        toastElement.addEventListener('hidden.bs.toast', function() {
            toastElement.remove();
        });
    }

    // Load documentation and examples in the background when the page loads
    setTimeout(() => {
        // Preload examples
        if (!document.querySelector('.example-card')) {
            loadExamples();
        }
        
        // Preload documentation
        if (!document.querySelector('#doc-content').innerHTML) {
            loadDocumentation('README');
        }
    }, 1000);

    // Function to check for input status periodically
    function setupInputStatusCheck() {
        // Clear any existing interval
        if (window.inputStatusInterval) {
            clearInterval(window.inputStatusInterval);
        }
        
        // Set up interval to check if any execution is waiting for input
        window.inputStatusInterval = setInterval(() => {
            if (programRunning && executionId) {
                // Only check if we're not already waiting for input
                if (!awaitingInput) {
                    fetch('/api/input-status')
                        .then(response => response.json())
                        .then(data => {
                            if (data.waitingExecutions && data.waitingExecutions.length > 0) {
                                // Check if our execution is waiting for input
                                const ourExecution = data.waitingExecutions.find(
                                    exec => exec.id === executionId
                                );
                                
                                if (ourExecution) {
                                    console.log('Detected execution waiting for input via status check');
                                    
                                    // Update UI to show input is needed
                                    awaitingInput = true;
                                    updateInputStatus(true);
                                    
                                    // Force highlight
                                    document.querySelector('.input-container').classList.add('highlight');
                                    
                                    // Add notification
                                    appendToOutput('<div class="input-notification"><strong>⚠️ Input required (detected via status check)</strong> - please enter a value below</div>');
                                    
                                    // Register our client with this execution if needed
                                    if (socket && socket.readyState === WebSocket.OPEN) {
                                        socket.send(JSON.stringify({ 
                                            type: 'register_execution', 
                                            executionId: executionId 
                                        }));
                                    }
                                }
                            }
                        })
                        .catch(error => {
                            console.error('Error checking input status:', error);
                        });
                }
            }
        }, 5000); // Check every 5 seconds
    }

    // Call this function to start checking
    setupInputStatusCheck();
}); 