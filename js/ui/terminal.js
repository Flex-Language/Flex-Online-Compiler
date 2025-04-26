/**
 * Terminal UI component for Flex Web Interpreter
 * Handles input/output operations with the user
 */
class FlexTerminal {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      throw new Error(`Terminal element with ID "${elementId}" not found`);
    }
    
    // Create output container
    this.outputElement = document.createElement('div');
    this.outputElement.className = 'terminal-output';
    
    // Create input container
    this.inputContainer = document.createElement('div');
    this.inputContainer.className = 'terminal-input-container';
    this.inputContainer.style.display = 'none';
    
    // Create prompt element
    this.inputPrompt = document.createElement('span');
    this.inputPrompt.className = 'terminal-prompt';
    
    // Create input element
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'text';
    this.inputElement.className = 'terminal-input';
    
    // Assemble terminal
    this.inputContainer.appendChild(this.inputPrompt);
    this.inputContainer.appendChild(this.inputElement);
    this.element.appendChild(this.outputElement);
    this.element.appendChild(this.inputContainer);
    
    // Input handler callback
    this.inputHandler = null;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initial welcome message
    this.writeLine('Flex Web Interpreter (v1.0.0)', 'info');
    this.writeLine('Type your code in the editor and click "Run" to execute.', 'info');
    this.writeLine('');
  }
  
  /**
   * Set up event listeners for the terminal
   */
  setupEventListeners() {
    // Handle input submission
    this.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const input = this.inputElement.value;
        this.inputElement.value = '';
        this.writeLine(`> ${input}`, 'input-echo');
        this.hideInput();
        
        if (this.inputHandler) {
          this.inputHandler(input);
          this.inputHandler = null;
        }
      }
    });
    
    // Handle click on terminal (focus input)
    this.element.addEventListener('click', () => {
      if (this.inputContainer.style.display !== 'none') {
        this.inputElement.focus();
      }
    });
  }
  
  /**
   * Write text to the terminal
   * @param {string} text - Text to write
   * @param {string} className - Optional CSS class for styling
   */
  write(text, className = '') {
    if (text === null || text === undefined) {
      text = '';
    }
    
    const span = document.createElement('span');
    if (className) span.className = className;
    
    // Handle escape sequences for colors
    text = String(text);
    span.textContent = text;
    
    // Find the last line or create a new one
    let lastLine = this.outputElement.lastElementChild;
    if (!lastLine || lastLine.tagName !== 'DIV' || lastLine.classList.contains('input-echo')) {
      lastLine = document.createElement('div');
      lastLine.className = 'terminal-line';
      this.outputElement.appendChild(lastLine);
    }
    
    lastLine.appendChild(span);
    this.scrollToBottom();
  }
  
  /**
   * Write a line of text to the terminal
   * @param {string} text - Text to write
   * @param {string} className - Optional CSS class for styling
   */
  writeLine(text, className = '') {
    if (text === null || text === undefined) {
      text = '';
    }
    
    const line = document.createElement('div');
    line.className = 'terminal-line';
    if (className) line.classList.add(className);
    
    line.textContent = text;
    this.outputElement.appendChild(line);
    this.scrollToBottom();
  }
  
  /**
   * Write an error message to the terminal
   * @param {string} text - Error message
   */
  writeError(text) {
    this.writeLine(text, 'error');
  }
  
  /**
   * Request input from the user
   * @param {string} prompt - Input prompt text
   * @returns {Promise<string>} Promise resolving to user input
   */
  requestInput(prompt) {
    this.inputPrompt.textContent = prompt || 'Input: ';
    this.showInput();
    this.inputElement.focus();
    
    return new Promise(resolve => {
      this.inputHandler = resolve;
    });
  }
  
  /**
   * Show the input field
   */
  showInput() {
    this.inputContainer.style.display = 'flex';
    this.inputElement.value = '';
    this.scrollToBottom();
  }
  
  /**
   * Hide the input field
   */
  hideInput() {
    this.inputContainer.style.display = 'none';
  }
  
  /**
   * Clear the terminal output
   */
  clear() {
    this.outputElement.innerHTML = '';
    this.writeLine('Terminal cleared.', 'info');
  }
  
  /**
   * Scroll to the bottom of the terminal
   */
  scrollToBottom() {
    this.element.scrollTop = this.element.scrollHeight;
  }
}
