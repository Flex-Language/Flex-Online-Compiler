/**
 * Flex Language Compiler/Interpreter Integration
 * This file serves as the main entry point for the Flex language processing
 */
class FlexCompiler {
  constructor(terminal) {
    this.lexer = new FlexLexer();
    this.parser = new FlexParser(this.lexer);
    this.interpreter = new FlexInterpreter(terminal);
    this.errorHandler = null;
    this.debugMode = false;
  }

  /**
   * Set the error handler for compiler errors
   * @param {Object} errorHandler - Error handler with formatError method
   */
  setErrorHandler(errorHandler) {
    this.errorHandler = errorHandler;
  }

  /**
   * Enable or disable debug mode
   * @param {boolean} enabled - Whether debug mode is enabled
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  /**
   * Compile and execute Flex code
   * @param {string} sourceCode - The Flex source code
   * @returns {Promise<Object>} - Result of execution
   */
  async compileAndExecute(sourceCode) {
    try {
      // Log compilation start if in debug mode
      if (this.debugMode) {
        console.log('Starting compilation process...');
        console.time('compilationTime');
      }

      // Step 1: Lexical Analysis (Tokenization)
      const tokens = this.lexer.tokenize(sourceCode);
      
      if (this.debugMode) {
        console.log('Tokenization complete:', tokens);
      }

      // Step 2: Parsing (Abstract Syntax Tree creation)
      const ast = this.parser.parse(tokens);
      
      if (this.debugMode) {
        console.log('Parsing complete:', ast);
      }

      // Step 3: Execution (Interpretation)
      const result = await this.interpreter.execute(sourceCode, ast);
      
      if (this.debugMode) {
        console.timeEnd('compilationTime');
      }

      return {
        success: true,
        result: result
      };
    } catch (error) {
      // Handle errors from any phase
      console.error('Compilation error:', error);
      
      if (this.errorHandler) {
        this.errorHandler.handleError(error);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate Flex code without executing it
   * @param {string} sourceCode - The Flex source code to validate
   * @returns {Object} - Validation result
   */
  validate(sourceCode) {
    try {
      // Lexical Analysis
      const tokens = this.lexer.tokenize(sourceCode);
      
      // Parsing
      const ast = this.parser.parse(tokens);
      
      return {
        valid: true,
        ast: ast
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
  
  /**
   * Add custom extensions to the language (experimental)
   * @param {Object} extension - A collection of extensions
   */
  extendLanguage(extension) {
    // This could add new built-in functions, operators, etc.
    if (extension.functions) {
      for (const [name, func] of Object.entries(extension.functions)) {
        this.interpreter.environment.define(name, func);
      }
    }
    
    // Could extend lexer/parser with new syntax in future versions
  }
}
