/**
 * Flex Web Interpreter
 * Main application entry point that connects all components
 */
(() => {
  'use strict';
  
  // Global references to main components
  window.flexEditor = null;
  window.flexTerminal = null;
  window.flexInterpreter = null;
  window.flexStorage = null;
  window.flexModals = null;
  window.flexDebugger = null;
  window.flexErrorHandler = null;
  window.flexDocumentation = null;
  
  // DOM elements
  const runButton = document.getElementById('run-button');
  const debugButton = document.getElementById('debug-button');
  const stopButton = document.getElementById('stop-button');
  const clearButton = document.getElementById('clear-button');
  const settingsButton = document.getElementById('settings-button');
  const helpButton = document.getElementById('help-button');
  const documentationButton = document.getElementById('documentation-button');
  
  /**
   * Initialize the application
   */
  async function initialize() {
    try {
      // Initialize components
      window.flexTerminal = new FlexTerminal('terminal');
      window.flexEditor = new FlexEditor('code-editor');
      window.flexStorage = new FlexStorage();
      window.flexDocumentation = new FlexDocumentation();
      
      // Wait for storage initialization
      await window.flexStorage.initDatabase();
      
      window.flexInterpreter = new FlexInterpreter(window.flexTerminal);
      window.flexErrorHandler = new FlexErrorHandler(window.flexTerminal, window.flexEditor);
      window.flexDebugger = new FlexDebugger(window.flexInterpreter, window.flexEditor, window.flexTerminal);
      window.flexModals = new FlexModals();
      
      // Set up event listeners
      setupEventListeners();
      
      // Set initial UI state
      setUIState(false, false);
      
      // Handle window resize
      window.addEventListener('resize', handleResize);
      handleResize();
      
      // Show ready message
      window.flexTerminal.writeLine('Flex Web Interpreter is ready!', 'success');
    } catch (error) {
      console.error('Initialization error:', error);
      window.flexTerminal.writeError(`Failed to initialize: ${error.message}`);
    }
  }
  
  /**
   * Set up event listeners for UI interactions
   */
  function setupEventListeners() {
    // Run button
    runButton.addEventListener('click', runCode);
    
    // Debug button
    debugButton.addEventListener('click', debugCode);
    
    // Stop button
    stopButton.addEventListener('click', stopCode);
    
    // Clear button
    clearButton.addEventListener('click', clearTerminal);
    
    // Settings button
    settingsButton.addEventListener('click', showSettings);
    
    // Help button
    helpButton.addEventListener('click', showHelp);
    
    // Documentation button
    documentationButton.addEventListener('click', showDocumentation);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
  }
  
  /**
   * Run the code in the editor
   */
  async function runCode() {
    try {
      // Clear any previous errors
      window.flexEditor.clearErrors();
      window.flexErrorHandler.clearErrors();
      
      // Get code from editor
      const code = window.flexEditor.getCode();
      
      if (!code.trim()) {
        window.flexTerminal.writeError('No code to run.');
        return;
      }
      
      // Update UI state
      setUIState(true, false);
      
      // Clear terminal
      window.flexTerminal.clear();
      
      // Execute code
      await window.flexInterpreter.execute(code);
    } catch (error) {
      console.error('Execution error:', error);
      window.flexTerminal.writeError(`Execution error: ${error.message}`);
    } finally {
      // Reset UI state
      setUIState(false, false);
    }
  }
  
  /**
   * Debug the code in the editor
   */
  async function debugCode() {
    try {
      // Clear any previous errors
      window.flexEditor.clearErrors();
      window.flexErrorHandler.clearErrors();
      
      // Get code from editor
      const code = window.flexEditor.getCode();
      
      if (!code.trim()) {
        window.flexTerminal.writeError('No code to debug.');
        return;
      }
      
      // Update UI state
      setUIState(false, true);
      
      // Clear terminal
      window.flexTerminal.clear();
      
      // Start debugging
      await window.flexDebugger.debug(code);
    } catch (error) {
      console.error('Debug error:', error);
      window.flexTerminal.writeError(`Debug error: ${error.message}`);
    }
  }
  
  /**
   * Stop the currently running code or debugging session
   */
  function stopCode() {
    if (window.flexDebugger && window.flexDebugger.isDebugging) {
      window.flexDebugger.stopDebugging();
      setUIState(false, false);
    } else if (window.flexInterpreter) {
      window.flexInterpreter.stop();
      setUIState(false, false);
    }
  }
  
  /**
   * Clear the terminal
   */
  function clearTerminal() {
    if (window.flexTerminal) {
      window.flexTerminal.clear();
    }
  }
  
  /**
   * Show settings modal
   */
  function showSettings() {
    // Initialize settings if not already done
    if (!window.flexSettings) {
      initializeSettings();
    }
    
    // Show settings modal
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
      settingsModal.style.display = 'block';
    }
  }
  
  /**
   * Initialize settings UI and functionality
   */
  function initializeSettings() {
    // Create settings UI if it doesn't exist
    let settingsModal = document.getElementById('settings-modal');
    
    if (!settingsModal) {
      settingsModal = document.createElement('div');
      settingsModal.id = 'settings-modal';
      settingsModal.className = 'modal';
      
      settingsModal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2>Settings</h2>
            <span class="close">&times;</span>
          </div>
          <div class="modal-body">
            <div class="settings-section">
              <h3>Editor</h3>
              <div class="form-group">
                <label for="font-size">Font Size:</label>
                <select id="font-size">
                  <option value="12px">Small</option>
                  <option value="14px" selected>Medium</option>
                  <option value="16px">Large</option>
                  <option value="18px">Extra Large</option>
                </select>
              </div>
              <div class="form-group">
                <label for="tab-size">Tab Size:</label>
                <select id="tab-size">
                  <option value="2" selected>2 spaces</option>
                  <option value="4">4 spaces</option>
                </select>
              </div>
            </div>
            
            <div class="settings-section">
              <h3>Terminal</h3>
              <div class="form-group">
                <label for="terminal-font-size">Font Size:</label>
                <select id="terminal-font-size">
                  <option value="12px">Small</option>
                  <option value="14px" selected>Medium</option>
                  <option value="16px">Large</option>
                  <option value="18px">Extra Large</option>
                </select>
              </div>
            </div>
            
            <div class="settings-section">
              <h3>Execution</h3>
              <div class="form-group checkbox">
                <input type="checkbox" id="auto-clear" checked>
                <label for="auto-clear">Clear terminal before each run</label>
              </div>
              <div class="form-group checkbox">
                <input type="checkbox" id="show-exec-time" checked>
                <label for="show-exec-time">Show execution time</label>
              </div>
            </div>
            
            <div class="form-actions">
              <button id="save-settings" class="btn primary">Save</button>
              <button id="reset-settings" class="btn">Reset to Defaults</button>
            </div>
          </div>
        </div>
      `;
      
      // Add to DOM
      document.body.appendChild(settingsModal);
      
      // Set up event listeners
      const closeButton = settingsModal.querySelector('.close');
      closeButton.addEventListener('click', () => {
        settingsModal.style.display = 'none';
      });
      
      const saveButton = document.getElementById('save-settings');
      saveButton.addEventListener('click', saveSettings);
      
      const resetButton = document.getElementById('reset-settings');
      resetButton.addEventListener('click', resetSettings);
      
      // Load current settings
      loadSettings();
    }
  }
  
  /**
   * Save settings to localStorage
   */
  function saveSettings() {
    const settings = {
      editor: {
        fontSize: document.getElementById('font-size').value,
        tabSize: parseInt(document.getElementById('tab-size').value, 10)
      },
      terminal: {
        fontSize: document.getElementById('terminal-font-size').value
      },
      execution: {
        autoClear: document.getElementById('auto-clear').checked,
        showExecTime: document.getElementById('show-exec-time').checked
      }
    };
    
    // Save to localStorage
    localStorage.setItem('flexSettings', JSON.stringify(settings));
    
    // Apply settings
    applySettings(settings);
    
    // Close modal
    document.getElementById('settings-modal').style.display = 'none';
    
    // Show confirmation
    window.flexTerminal.writeLine('Settings saved.', 'success');
  }
  
  /**
   * Load settings from localStorage
   */
  function loadSettings() {
    // Default settings
    const defaultSettings = {
      editor: {
        fontSize: '14px',
        tabSize: 2
      },
      terminal: {
        fontSize: '14px'
      },
      execution: {
        autoClear: true,
        showExecTime: true
      }
    };
    
    // Try to load from localStorage
    let settings = defaultSettings;
    const savedSettings = localStorage.getItem('flexSettings');
    
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings);
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
    
    // Apply settings
    applySettings(settings);
    
    // Update UI
    document.getElementById('font-size').value = settings.editor.fontSize;
    document.getElementById('tab-size').value = settings.editor.tabSize;
    document.getElementById('terminal-font-size').value = settings.terminal.fontSize;
    document.getElementById('auto-clear').checked = settings.execution.autoClear;
    document.getElementById('show-exec-time').checked = settings.execution.showExecTime;
  }
  
  /**
   * Apply settings to the UI
   * @param {Object} settings - The settings to apply
   */
  function applySettings(settings) {
    // Apply editor settings
    if (window.flexEditor && window.flexEditor.editor) {
      window.flexEditor.editor.getWrapperElement().style.fontSize = settings.editor.fontSize;
      window.flexEditor.editor.setOption('tabSize', settings.editor.tabSize);
      window.flexEditor.editor.setOption('indentUnit', settings.editor.tabSize);
      window.flexEditor.editor.refresh();
    }
    
    // Apply terminal settings
    if (window.flexTerminal) {
      document.getElementById('terminal').style.fontSize = settings.terminal.fontSize;
    }
  }
  
  /**
   * Reset settings to defaults
   */
  function resetSettings() {
    // Remove from localStorage
    localStorage.removeItem('flexSettings');
    
    // Load defaults
    loadSettings();
    
    // Show confirmation
    window.flexTerminal.writeLine('Settings reset to defaults.', 'info');
  }
  
  /**
   * Show help information
   */
  function showHelp() {
    const helpContent = `
      <h2>Flex Web Interpreter Help</h2>
      
      <h3>Basic Usage</h3>
      <ul>
        <li><strong>Editor:</strong> Write your Flex code in the left panel</li>
        <li><strong>Run:</strong> Click the Run button (or press Ctrl+Enter) to execute your code</li>
        <li><strong>Debug:</strong> Click the Debug button to debug your code step by step</li>
        <li><strong>Stop:</strong> Click the Stop button to halt execution</li>
        <li><strong>Terminal:</strong> See output and interact with your program in the right panel</li>
      </ul>
      
      <h3>Debugging</h3>
      <ul>
        <li><strong>Breakpoints:</strong> Click in the left gutter to set/remove breakpoints</li>
        <li><strong>Step Into:</strong> Execute the current line, stepping into function calls</li>
        <li><strong>Step Over:</strong> Execute the current line without stepping into functions</li>
        <li><strong>Step Out:</strong> Execute until the end of the current function</li>
        <li><strong>Continue:</strong> Run until the next breakpoint or end</li>
        <li><strong>Variables:</strong> View current variable values in the Variables panel</li>
        <li><strong>Call Stack:</strong> View the current call stack in the Call Stack panel</li>
      </ul>
      
      <h3>Flex Language Basics</h3>
      <ul>
        <li><strong>Printing:</strong> Use <code>etb3("Hello")</code> or <code>print("Hello")</code> to display text</li>
        <li><strong>Input:</strong> Use <code>da5l()</code>, <code>d5l()</code>, or <code>scan()</code> to get user input</li>
        <li><strong>Variables:</strong> Assign with <code>name = "John"</code> (no declaration needed)</li>
        <li><strong>Comments:</strong> Use <code>#</code> for single-line comments</li>
        <li><strong>Conditionals:</strong> <code>if (condition) { ... } else { ... }</code></li>
        <li><strong>Loops:</strong> <code>while (condition) { ... }</code> or <code>for (init; condition; step) { ... }</code></li>
        <li><strong>Functions:</strong> <code>function name(parameters) { ... return value; }</code></li>
      </ul>
      
      <h3>Examples</h3>
      <p>Click the "Examples" button to see and load example programs.</p>
      
      <h3>Saving Your Work</h3>
      <p>Use the "Save" and "Open" buttons to save and retrieve your programs.</p>
      
      <h3>Keyboard Shortcuts</h3>
      <ul>
        <li><strong>Ctrl+Enter:</strong> Run code</li>
        <li><strong>Ctrl+Shift+Enter:</strong> Debug code</li>
        <li><strong>Ctrl+.:</strong> Stop execution</li>
        <li><strong>F1:</strong> Show help</li>
        <li><strong>F11:</strong> Step into (during debugging)</li>
        <li><strong>F10:</strong> Step over (during debugging)</li>
        <li><strong>Shift+F11:</strong> Step out (during debugging)</li>
        <li><strong>F5:</strong> Continue (during debugging)</li>
        <li><strong>Shift+F5:</strong> Stop debugging</li>
      </ul>
    `;
    
    const helpModal = document.getElementById('help-modal');
    const helpContentElement = document.getElementById('help-content');
    
    if (helpModal && helpContentElement) {
      helpContentElement.innerHTML = helpContent;
      helpModal.style.display = 'block';
    }
  }
  
  /**
   * Show documentation
   */
  function showDocumentation() {
    window.flexDocumentation.showDocumentation();
  }
  
  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeyboardShortcuts(event) {
    // Run code: Ctrl+Enter
    if (event.ctrlKey && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      runCode();
    }
    
    // Debug code: Ctrl+Shift+Enter
    if (event.ctrlKey && event.shiftKey && event.key === 'Enter') {
      event.preventDefault();
      debugCode();
    }
    
    // Stop code: Ctrl+.
    if (event.ctrlKey && event.key === '.') {
      event.preventDefault();
      stopCode();
    }
    
    // Help: F1
    if (event.key === 'F1') {
      event.preventDefault();
      showHelp();
    }
    
    // Debugging shortcuts (only when debugging is active)
    if (window.flexDebugger && window.flexDebugger.isDebugging) {
      // Step into: F11
      if (event.key === 'F11' && !event.shiftKey) {
        event.preventDefault();
        window.flexDebugger.stepInto();
      }
      
      // Step over: F10
      if (event.key === 'F10') {
        event.preventDefault();
        window.flexDebugger.stepOver();
      }
      
      // Step out: Shift+F11
      if (event.shiftKey && event.key === 'F11') {
        event.preventDefault();
        window.flexDebugger.stepOut();
      }
      
      // Continue: F5
      if (event.key === 'F5' && !event.shiftKey) {
        event.preventDefault();
        window.flexDebugger.continue();
      }
      
      // Stop debugging: Shift+F5
      if (event.shiftKey && event.key === 'F5') {
        event.preventDefault();
        window.flexDebugger.stopDebugging();
        setUIState(false, false);
      }
    }
  }
  
  /**
   * Set UI state based on whether code is running or debugging
   * @param {boolean} isRunning - Whether code is currently running
   * @param {boolean} isDebugging - Whether code is currently being debugged
   */
  function setUIState(isRunning, isDebugging) {
    // Run button
    runButton.disabled = isRunning || isDebugging;
    runButton.classList.toggle('disabled', isRunning || isDebugging);
    
    // Debug button
    debugButton.disabled = isRunning || isDebugging;
    debugButton.classList.toggle('disabled', isRunning || isDebugging);
    
    // Stop button
    stopButton.disabled = !isRunning && !isDebugging;
    stopButton.classList.toggle('disabled', !isRunning && !isDebugging);
  }
  
  /**
   * Handle window resize events
   */
  function handleResize() {
    if (window.flexEditor) {
      window.flexEditor.resize();
    }
  }
  
  // Initialize when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', initialize);
})();
