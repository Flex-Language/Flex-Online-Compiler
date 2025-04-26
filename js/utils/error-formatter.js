/**
 * Error formatting utility for Flex Web Interpreter
 * Provides user-friendly error messages for common issues
 */
class FlexErrorFormatter {
  /**
   * Format an error message into a user-friendly explanation
   * @param {string} errorType - Type of error (lexer, parser, runtime)
   * @param {string} message - Raw error message
   * @param {Object} context - Additional context (line number, column, etc.)
   * @returns {string} Formatted error message
   */
  static format(errorType, message, context = {}) {
    // Extract key information from the error
    const line = context.line ? `line ${context.line}` : '';
    const lineInfo = line ? ` at ${line}` : '';
    
    // Match common error patterns and provide helpful messages
    
    // Variable related errors
    if (message.includes('Undefined variable') || message.includes('not defined')) {
      const varMatch = message.match(/['"]([^'"]+)['"]/);
      const varName = varMatch ? varMatch[1] : 'variable';
      return `Variable "${varName}" doesn't exist${lineInfo}. Make sure you've defined it before using it.`;
    }
    
    // Type errors
    if (message.includes('must be a number') || message.includes('must be numbers')) {
      return `Type error${lineInfo}: This operation requires numbers, but received something else. Check your variable types.`;
    }
    
    if (message.includes('Cannot read property') || message.includes('Cannot access')) {
      return `Reference error${lineInfo}: Trying to access a property of undefined or null. Check if your variable exists.`;
    }
    
    // Function errors
    if (message.includes('is not a function')) {
      const funcMatch = message.match(/([^\s]+) is not a function/);
      const funcName = funcMatch ? funcMatch[1] : 'value';
      return `Function error${lineInfo}: "${funcName}" is not a function but is being called like one. Check your spelling.`;
    }
    
    if (message.includes('Expected') && message.includes('arguments')) {
      return `Function call error${lineInfo}: ${message}. Check your function call parameters.`;
    }
    
    // Syntax errors
    if (errorType === 'lexer') {
      return `Syntax error${lineInfo}: ${message}. Check for invalid characters or tokens.`;
    }
    
    if (errorType === 'parser') {
      if (message.includes('Expected')) {
        return `Syntax error${lineInfo}: ${message}. Check your code structure.`;
      }
      return `Syntax error${lineInfo}: ${message}. Check your code syntax.`;
    }
    
    // Loop errors
    if (message.includes('infinite loop') || message.includes('loop iteration limit')) {
      return `Loop error${lineInfo}: Your loop might be infinite. Check your loop condition.`;
    }
    
    // Arabic syntax specific errors
    if (message.includes('etb3') || message.includes('da5l') || message.includes('d5l')) {
      if (message.includes('Unexpected')) {
        return `Syntax error${lineInfo}: Issue with Arabic keyword usage. Make sure you're using it correctly in the statement.`;
      }
    }
    
    // Return the original message if no specific pattern is matched
    return `Error${lineInfo}: ${message}`;
  }
  
  /**
   * Format a syntax error from the lexer/parser
   * @param {Object} error - Error object
   * @returns {Object} Formatted error with line, column, and message
   */
  static formatSyntaxError(error) {
    // Extract line and column information if present
    let line = error.line || error.location?.start?.line;
    let column = error.column || error.location?.start?.column;
    
    // Format message
    const formattedMessage = this.format(
      error.name === 'LexicalError' ? 'lexer' : 'parser',
      error.message,
      { line, column }
    );
    
    return {
      line,
      column,
      message: formattedMessage
    };
  }
  
  /**
   * Format a runtime error
   * @param {Object} error - Error object
   * @param {Object} location - Location information (line, column)
   * @returns {Object} Formatted error with line, column, and message
   */
  static formatRuntimeError(error, location = {}) {
    const formattedMessage = this.format('runtime', error.message, location);
    
    return {
      line: location.line,
      column: location.column,
      message: formattedMessage
    };
  }
  
  /**
   * Get suggestions for fixing common errors
   * @param {string} errorMessage - The error message
   * @returns {Array<string>} Array of suggestions
   */
  static getSuggestions(errorMessage) {
    const suggestions = [];
    
    // Undefined variable suggestions
    if (errorMessage.includes('Variable') && errorMessage.includes('doesn\'t exist')) {
      suggestions.push("Make sure you've declared the variable with 'var' before using it.");
      suggestions.push("Check for spelling errors in your variable name.");
      suggestions.push("Variables are case-sensitive. Check the casing.");
    }
    
    // Type error suggestions
    if (errorMessage.includes('Type error')) {
      suggestions.push("Make sure you're using the right variable type for this operation.");
      suggestions.push("You might need to convert a string to a number using parseInt() or parseFloat().");
      suggestions.push("Check that all operands in your expression are the correct type.");
    }
    
    // Function error suggestions
    if (errorMessage.includes('Function error')) {
      suggestions.push("Check the spelling of your function name.");
      suggestions.push("Make sure the function is defined before you call it.");
      suggestions.push("Verify that you're calling a function and not trying to use a variable.");
    }
    
    // Syntax error suggestions
    if (errorMessage.includes('Syntax error')) {
      suggestions.push("Check for missing semicolons, parentheses, or braces.");
      suggestions.push("Make sure your code is properly indented for readability.");
      suggestions.push("Verify that you're using the correct syntax for Flex.");
    }
    
    // Loop error suggestions
    if (errorMessage.includes('Loop error')) {
      suggestions.push("Make sure your loop condition eventually becomes false.");
      suggestions.push("Check that your loop counter is being updated correctly.");
      suggestions.push("Consider adding an escape condition to prevent infinite loops.");
    }
    
    // Return default suggestions if none were added
    if (suggestions.length === 0) {
      suggestions.push("Check your syntax and logic.");
      suggestions.push("Review the variable and function names for typos.");
      suggestions.push("Make sure you're using the correct Flex language syntax.");
    }
    
    return suggestions;
  }
}
