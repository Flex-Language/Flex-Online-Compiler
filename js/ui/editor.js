/**
 * Editor UI component for Flex Web Interpreter
 * Uses CodeMirror with Flex language syntax highlighting
 */
class FlexEditor {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      throw new Error(`Editor element with ID "${elementId}" not found`);
    }
    
    // Define Flex mode for CodeMirror
    this.defineFlexMode();
    
    // Initialize CodeMirror
    this.editor = CodeMirror.fromTextArea(this.element, {
      mode: "flex",
      theme: "dracula",
      lineNumbers: true,
      indentUnit: 2,
      tabSize: 2,
      indentWithTabs: false,
      autoCloseBrackets: true,
      matchBrackets: true,
      smartIndent: true,
      lineWrapping: false,
      extraKeys: {
        "Ctrl-Enter": () => {
          // Trigger run action
          document.getElementById('run-button').click();
        },
        "Tab": (cm) => {
          if (cm.somethingSelected()) {
            cm.indentSelection("add");
          } else {
            cm.replaceSelection("  ");
          }
        }
      }
    });
    
    // Set initial content
    this.setDefaultContent();
  }
  
  /**
   * Define Flex language mode for CodeMirror
   */
  defineFlexMode() {
    CodeMirror.defineMode("flex", () => {
      return {
        startState: function() {
          return {
            inString: false,
            stringType: null,
            inComment: false
          };
        },
        
        token: function(stream, state) {
          // Handle comments
          if (stream.match("#")) {
            stream.skipToEnd();
            return "comment";
          }
          
          // Handle strings
          if (!state.inString && (stream.match('"') || stream.match("'"))) {
            state.inString = true;
            state.stringType = stream.current();
            return "string";
          }
          
          if (state.inString) {
            if (stream.match('\\\\')) return "string";
            if (stream.match('\\' + state.stringType)) return "string";
            
            if (stream.match(state.stringType)) {
              state.inString = false;
              state.stringType = null;
              return "string";
            }
            
            stream.next();
            return "string";
          }
          
          // Handle numbers
          if (stream.match(/^-?\d+\.?\d*/) || stream.match(/^-?\.\d+/)) {
            return "number";
          }
          
          // Handle keywords
          if (stream.match(/^(if|else|while|for|function|return|print|etb3|da5l|d5l|scan|true|false|null)\b/)) {
            return "keyword";
          }
          
          // Handle operators
          if (stream.match(/[+\-*\/=<>!&|^%?:]+/)) {
            return "operator";
          }
          
          // Handle identifiers
          if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
            return "variable";
          }
          
          // Advance by one character if no match
          stream.next();
          return null;
        }
      };
    });
  }
  
  /**
   * Get the current code from the editor
   * @returns {string} Code content
   */
  getCode() {
    return this.editor.getValue();
  }
  
  /**
   * Set code in the editor
   * @param {string} code - Code to set
   */
  setCode(code) {
    this.editor.setValue(code || '');
  }
  
  /**
   * Set default "Hello World" content in the editor
   */
  setDefaultContent() {
    const helloWorldExample = 
`# Flex Hello World Example
# This is a simple program that demonstrates basic Flex language features

# Print a welcome message
etb3("Welcome to Flex Web Interpreter!");

# Variable assignment
name = "User";

# Using input for interactive programming
etb3("What is your name?");
name = da5l();

# String concatenation
etb3("Hello, " + name + "!");

# Using a loop to count from 1 to 5
etb3("Counting from 1 to 5:");
for (i = 1; i <= 5; i = i + 1) {
  etb3("  " + i);
}

# Using conditionals
etb3("Is your name longer than 5 characters?");
if (name.length > 5) {
  etb3("Yes, your name is longer than 5 characters.");
} else {
  etb3("No, your name is 5 characters or shorter.");
}

etb3("Thank you for using Flex Web Interpreter!");
`;
    
    this.setCode(helloWorldExample);
  }
  
  /**
   * Focus the editor
   */
  focus() {
    this.editor.focus();
  }
  
  /**
   * Add a marker for an error at the specified line
   * @param {number} line - Line number (0-based)
   * @param {string} message - Error message
   */
  markError(line, message) {
    const lineHandle = this.editor.getLineHandle(line);
    
    if (lineHandle) {
      this.editor.addLineClass(lineHandle, 'background', 'error-line');
      
      // Add a marker with the error message
      const marker = document.createElement('div');
      marker.className = 'error-marker';
      marker.title = message;
      marker.innerHTML = '⚠️';
      
      this.editor.setGutterMarker(line, 'error-gutter', marker);
    }
  }
  
  /**
   * Clear all error markers
   */
  clearErrors() {
    const lineCount = this.editor.lineCount();
    
    for (let i = 0; i < lineCount; i++) {
      const lineHandle = this.editor.getLineHandle(i);
      if (lineHandle) {
        this.editor.removeLineClass(lineHandle, 'background', 'error-line');
        this.editor.setGutterMarker(i, 'error-gutter', null);
      }
    }
  }
  
  /**
   * Resize the editor when the window size changes
   */
  resize() {
    this.editor.refresh();
  }
}
