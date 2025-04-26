/**
 * Error handling utility for Flex Web Interpreter
 * Provides consistent error formatting and reporting
 */
class FlexErrorHandler {
  constructor(terminal, editor) {
    this.terminal = terminal;
    this.editor = editor;
  }
  
  /**
   * Report a lexer error
   * @param {Object} error - Error information
   * @param {string} error.message - Error message
   * @param {number} error.line - Line number where error occurred
   * @param {number} error.column - Column number where error occurred
   * @param {string} error.source - Source code snippet with error
   */
  reportLexerError(error) {
    const message = `Lexer Error (${error.line}:${error.column}): ${error.message}`;
    this.terminal.writeError(message);
    
    if (error.line !== undefined) {
      this.editor.markError(error.line - 1, message);
    }
    
    if (error.source) {
      this.terminal.writeLine(`Near: "${error.source}"`, 'error-context');
    }
    
    this.terminal.writeLine('Failed to tokenize code.', 'error');
    console.error('Lexer Error:', error);
  }
  
  /**
   * Report a parser error
   * @param {Object} error - Error information
   * @param {string} error.message - Error message
   * @param {number} error.line - Line number where error occurred
   * @param {number} error.column - Column number where error occurred
   * @param {string} error.source - Source code snippet with error
   * @param {Object} error.token - Token information
   */
  reportParserError(error) {
    const location = error.line !== undefined ? `(${error.line}:${error.column})` : '';
    const message = `Parser Error ${location}: ${error.message}`;
    this.terminal.writeError(message);
    
    if (error.line !== undefined) {
      this.editor.markError(error.line - 1, message);
    }
    
    if (error.token && error.token.lexeme) {
      this.terminal.writeLine(`At token: "${error.token.lexeme}"`, 'error-context');
    }
    
    if (error.source) {
      this.terminal.writeLine(`Near: "${error.source}"`, 'error-context');
    }
    
    this.terminal.writeLine('Failed to parse code.', 'error');
    console.error('Parser Error:', error);
  }
  
  /**
   * Report a runtime error
   * @param {Object} error - Error information
   * @param {string} error.message - Error message
   * @param {number} error.line - Line number where error occurred
   * @param {Object} error.token - Token information
   * @param {string} error.stackTrace - Stack trace information
   */
  reportRuntimeError(error) {
    const location = error.line !== undefined ? `(line ${error.line})` : '';
    const message = `Runtime Error ${location}: ${error.message}`;
    this.terminal.writeError(message);
    
    if (error.line !== undefined) {
      this.editor.markError(error.line - 1, message);
    }
    
    if (error.stackTrace) {
      this.terminal.writeLine('Stack trace:', 'error-context');
      error.stackTrace.forEach(frame => {
        this.terminal.writeLine(`  at ${frame.function} (line ${frame.line})`, 'error-context');
      });
    }
    
    this.terminal.writeLine('Execution stopped due to an error.', 'error');
    console.error('Runtime Error:', error);
  }
  
  /**
   * Format a helpful error message based on error type and context
   * @param {string} errorType - Type of error
   * @param {string} message - Raw error message
   * @param {Object} context - Additional context information
   * @returns {string} Formatted error message
   */
  formatErrorMessage(errorType, message, context = {}) {
    // Recognize common error patterns and provide helpful explanations
    
    // Undefined variable
    if (message.includes('Undefined variable') || message.includes('is not defined')) {
      const varName = message.match(/['"]([^'"]+)['"]/)?.[1];
      if (varName) {
        return `Variable "${varName}" is being used but hasn't been defined yet. Make sure you assign a value to "${varName}" before using it.`;
      }
    }
    
    // Type errors
    if (message.includes('Operands must be numbers')) {
      return 'This operation requires numbers, but was given something else. Check the types of your variables.';
    }
    
    if (message.includes('Cannot read property')) {
      return 'Trying to access a property of undefined or null. Check if your variable exists before accessing its properties.';
    }
    
    // Function errors
    if (message.includes('Expected') && message.includes('arguments but got')) {
      return `Wrong number of arguments provided to function. ${message}`;
    }
    
    if (message.includes('is not a function')) {
      const funcName = message.match(/([^'\s]+) is not a function/)?.[1];
      if (funcName) {
        return `"${funcName}" is not a function but is being called like one. Check your spelling or make sure "${funcName}" is defined as a function.`;
      }
    }
    
    // Syntax errors
    if (errorType === 'parser' && message.includes('Expected')) {
      return `Syntax error: ${message}. Check for missing brackets, parentheses, or semicolons.`;
    }
    
    // Return the original message if no specific format is available
    return message;
  }
  
  /**
   * Clear all error markers
   */
  clearErrors() {
    this.editor.clearErrors();
  }
}
