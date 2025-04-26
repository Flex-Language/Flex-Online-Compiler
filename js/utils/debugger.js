/**
 * Flex Debugger Utility
 * Provides step-by-step execution, breakpoints, and variable inspection
 */
class FlexDebugger {
  constructor(interpreter, editor, terminal) {
    this.interpreter = interpreter;
    this.editor = editor;
    this.terminal = terminal;
    this.isDebugging = false;
    this.isPaused = false;
    this.currentLine = 0;
    this.breakpoints = new Set();
    this.callStack = [];
    this.stepMode = null; // null, 'into', 'over', 'out'
    this.executionPointer = 0;
    this.ast = null;
    this.statements = [];
  }
  
  /**
   * Start debugging a program
   * @param {string} code - The Flex code to debug
   */
  async debug(code) {
    try {
      // Reset state
      this.isDebugging = true;
      this.isPaused = false;
      this.currentLine = 0;
      this.callStack = [];
      this.stepMode = null;
      this.executionPointer = 0;
      
      // Parse and prepare code
      this.terminal.writeLine("Preparing for debug...", "info");
      const tokens = this.interpreter.lexer.tokenize(code);
      this.ast = this.interpreter.parser.parse(tokens);
      
      if (!this.ast || !this.ast.statements) {
        this.terminal.writeLine("Failed to parse program for debugging.", "error");
        this.isDebugging = false;
        return;
      }
      
      this.statements = this.ast.statements;
      
      // Initialize debugger UI components
      this.initDebugUI();
      
      // Start at the first statement
      this.terminal.writeLine("Starting debug session...", "info");
      this.terminal.writeLine("Use the debug controls to step through execution.", "info");
      
      // Highlight the first statement
      this.highlightCurrentStatement();
      
      // Wait for user to take control
      this.isPaused = true;
      
    } catch (error) {
      this.terminal.writeError(`Debug initialization error: ${error.message}`);
      this.isDebugging = false;
    }
  }
  
  /**
   * Initialize debug UI elements
   */
  initDebugUI() {
    // Create debug control panel if it doesn't exist
    let debugPanel = document.getElementById('debug-panel');
    
    if (!debugPanel) {
      debugPanel = document.createElement('div');
      debugPanel.id = 'debug-panel';
      debugPanel.className = 'debug-panel';
      
      // Add debug controls
      debugPanel.innerHTML = `
        <div class="debug-controls">
          <button id="step-into" class="debug-button" title="Step Into (F11)">
            <span class="icon">↓</span> Step Into
          </button>
          <button id="step-over" class="debug-button" title="Step Over (F10)">
            <span class="icon">→</span> Step Over
          </button>
          <button id="step-out" class="debug-button" title="Step Out (Shift+F11)">
            <span class="icon">↑</span> Step Out
          </button>
          <button id="continue" class="debug-button" title="Continue (F5)">
            <span class="icon">▶</span> Continue
          </button>
          <button id="stop-debug" class="debug-button danger" title="Stop Debugging (Shift+F5)">
            <span class="icon">■</span> Stop
          </button>
        </div>
        <div class="debug-info">
          <div class="debug-section">
            <h3>Variables</h3>
            <div id="variables-list" class="debug-list"></div>
          </div>
          <div class="debug-section">
            <h3>Call Stack</h3>
            <div id="call-stack" class="debug-list"></div>
          </div>
        </div>
      `;
      
      // Add to DOM
      document.querySelector('.terminal-panel').appendChild(debugPanel);
      
      // Set up event listeners
      document.getElementById('step-into').addEventListener('click', () => this.stepInto());
      document.getElementById('step-over').addEventListener('click', () => this.stepOver());
      document.getElementById('step-out').addEventListener('click', () => this.stepOut());
      document.getElementById('continue').addEventListener('click', () => this.continue());
      document.getElementById('stop-debug').addEventListener('click', () => this.stopDebugging());
    }
    
    // Show debug panel
    debugPanel.style.display = 'flex';
    
    // Set up breakpoint toggling in the editor
    this.setupBreakpointToggling();
  }
  
  /**
   * Set up breakpoint toggling in the editor
   */
  setupBreakpointToggling() {
    // CodeMirror specific implementation
    const cm = this.editor.editor;
    
    // Clear existing gutters
    cm.clearGutter('breakpoints');
    
    // Add the gutter
    cm.setOption('gutters', ['CodeMirror-linenumbers', 'breakpoints']);
    
    // Set up click handler for the gutter
    cm.on('gutterClick', (cm, line, gutter) => {
      if (gutter === 'breakpoints') {
        this.toggleBreakpoint(line);
      }
    });
  }
  
  /**
   * Toggle a breakpoint at the specified line
   * @param {number} line - Line number (0-based)
   */
  toggleBreakpoint(line) {
    const cm = this.editor.editor;
    
    if (this.breakpoints.has(line)) {
      // Remove breakpoint
      this.breakpoints.delete(line);
      cm.setGutterMarker(line, 'breakpoints', null);
    } else {
      // Add breakpoint
      this.breakpoints.add(line);
      const marker = document.createElement('div');
      marker.className = 'breakpoint-marker';
      marker.innerHTML = '●';
      cm.setGutterMarker(line, 'breakpoints', marker);
    }
  }
  
  /**
   * Highlight the current statement in the editor
   */
  highlightCurrentStatement() {
    if (!this.statements[this.executionPointer]) {
      return;
    }
    
    const stmt = this.statements[this.executionPointer];
    const line = stmt.line ? stmt.line - 1 : 0;
    
    // Clear previous highlighting
    this.editor.editor.getAllMarks().forEach(mark => mark.clear());
    
    // Highlight current line
    const lineHandle = this.editor.editor.getLineHandle(line);
    if (lineHandle) {
      this.editor.editor.addLineClass(line, 'background', 'debug-current-line');
      this.editor.editor.scrollIntoView({line: line, ch: 0}, 100);
    }
    
    // Update current line tracking
    this.currentLine = line;
    
    // Update variables display
    this.updateVariablesDisplay();
    
    // Update call stack display
    this.updateCallStackDisplay();
  }
  
  /**
   * Update the variables display with current values
   */
  updateVariablesDisplay() {
    const variablesList = document.getElementById('variables-list');
    variablesList.innerHTML = '';
    
    if (this.interpreter && this.interpreter.environment) {
      const environment = this.interpreter.environment;
      const variables = environment.values;
      
      if (Object.keys(variables).length === 0) {
        variablesList.innerHTML = '<div class="debug-item">No variables defined</div>';
        return;
      }
      
      for (const name in variables) {
        const value = variables[name];
        const valueStr = this.formatValue(value);
        
        const varItem = document.createElement('div');
        varItem.className = 'debug-item';
        varItem.innerHTML = `<span class="var-name">${name}</span>: <span class="var-value">${valueStr}</span>`;
        
        variablesList.appendChild(varItem);
      }
    }
  }
  
  /**
   * Format a value for display
   * @param {*} value - The value to format
   * @returns {string} Formatted value string
   */
  formatValue(value) {
    if (value === null) {
      return '<span class="value-null">null</span>';
    }
    
    if (value === undefined) {
      return '<span class="value-undefined">undefined</span>';
    }
    
    if (typeof value === 'number') {
      return `<span class="value-number">${value}</span>`;
    }
    
    if (typeof value === 'string') {
      return `<span class="value-string">"${value}"</span>`;
    }
    
    if (typeof value === 'boolean') {
      return `<span class="value-boolean">${value}</span>`;
    }
    
    if (Array.isArray(value)) {
      const items = value.map(item => this.formatValue(item)).join(', ');
      return `<span class="value-array">[${items}]</span>`;
    }
    
    if (typeof value === 'object') {
      if (value.call && value.arity) {
        return '<span class="value-function">&lt;function&gt;</span>';
      }
      
      return '<span class="value-object">&lt;object&gt;</span>';
    }
    
    return String(value);
  }
  
  /**
   * Update the call stack display
   */
  updateCallStackDisplay() {
    const callStackElem = document.getElementById('call-stack');
    callStackElem.innerHTML = '';
    
    if (this.callStack.length === 0) {
      callStackElem.innerHTML = '<div class="debug-item">Main Program</div>';
      return;
    }
    
    // Add current execution context
    this.callStack.forEach((frame, index) => {
      const frameElem = document.createElement('div');
      frameElem.className = 'debug-item';
      
      if (index === 0) {
        frameElem.classList.add('current-frame');
      }
      
      frameElem.textContent = `${frame.name} (line ${frame.line})`;
      callStackElem.appendChild(frameElem);
    });
  }
  
  /**
   * Execute the next statement
   */
  async executeNextStatement() {
    if (!this.isDebugging || !this.statements[this.executionPointer]) {
      return;
    }
    
    try {
      // Get current statement
      const stmt = this.statements[this.executionPointer];
      
      // Execute it
      await this.interpreter.executeStatement(stmt);
      
      // Move to next statement
      this.executionPointer++;
      
      // Check if we've reached the end
      if (this.executionPointer >= this.statements.length) {
        this.terminal.writeLine("Debug session completed.", "success");
        this.isDebugging = false;
        this.cleanupDebugUI();
        return;
      }
      
      // Highlight next statement
      this.highlightCurrentStatement();
      
      // Check if we should pause at this point
      const nextStmt = this.statements[this.executionPointer];
      const nextLine = nextStmt.line ? nextStmt.line - 1 : 0;
      
      // Pause if this is a breakpoint or based on step mode
      if (this.breakpoints.has(nextLine) || this.shouldPauseBasedOnStepMode()) {
        this.isPaused = true;
        this.terminal.writeLine(`Paused at line ${nextLine + 1}`, "info");
      } else {
        // Continue execution based on step mode
        await this.continueExecution();
      }
    } catch (error) {
      this.terminal.writeError(`Debug execution error: ${error.message}`);
      this.isDebugging = false;
      this.cleanupDebugUI();
    }
  }
  
  /**
   * Check if we should pause based on step mode
   * @returns {boolean} Whether to pause
   */
  shouldPauseBasedOnStepMode() {
    // If step mode is null, we're in continue mode
    if (this.stepMode === null) {
      return false;
    }
    
    // If step mode is 'into', always pause
    if (this.stepMode === 'into') {
      return true;
    }
    
    // TODO: Implement 'over' and 'out' logic
    // This requires tracking function call depth
    
    return true;
  }
  
  /**
   * Continue execution until next breakpoint or end
   */
  async continueExecution() {
    if (!this.isDebugging || this.isPaused) {
      return;
    }
    
    await this.executeNextStatement();
  }
  
  /**
   * Step into the next statement
   */
  async stepInto() {
    if (!this.isDebugging || !this.isPaused) {
      return;
    }
    
    this.stepMode = 'into';
    this.isPaused = false;
    await this.executeNextStatement();
  }
  
  /**
   * Step over the next statement
   */
  async stepOver() {
    if (!this.isDebugging || !this.isPaused) {
      return;
    }
    
    this.stepMode = 'over';
    this.isPaused = false;
    await this.executeNextStatement();
  }
  
  /**
   * Step out of the current function
   */
  async stepOut() {
    if (!this.isDebugging || !this.isPaused) {
      return;
    }
    
    this.stepMode = 'out';
    this.isPaused = false;
    await this.executeNextStatement();
  }
  
  /**
   * Continue execution until next breakpoint
   */
  async continue() {
    if (!this.isDebugging || !this.isPaused) {
      return;
    }
    
    this.stepMode = null;
    this.isPaused = false;
    await this.executeNextStatement();
  }
  
  /**
   * Stop debugging session
   */
  stopDebugging() {
    if (!this.isDebugging) {
      return;
    }
    
    this.isDebugging = false;
    this.isPaused = false;
    this.terminal.writeLine("Debug session stopped.", "info");
    this.cleanupDebugUI();
  }
  
  /**
   * Clean up debug UI elements
   */
  cleanupDebugUI() {
    // Hide debug panel
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
      debugPanel.style.display = 'none';
    }
    
    // Clear current line highlighting
    this.editor.editor.getAllMarks().forEach(mark => mark.clear());
    
    // Remove line class
    if (this.editor.editor.getLineHandle(this.currentLine)) {
      this.editor.editor.removeLineClass(this.currentLine, 'background', 'debug-current-line');
    }
  }
}
