/**
 * Standard Library for Flex Web Interpreter
 * Provides built-in functions and utilities
 */
class StandardLibrary {
  constructor(interpreter) {
    this.interpreter = interpreter;
    
    // Core functions
    this.functions = {
      // I/O functions
      'print': this.print.bind(this),
      'etb3': this.print.bind(this), // Arabic variant for print
      'scan': this.scan.bind(this),
      'da5l': this.scan.bind(this), // Arabic variant for scan
      'd5l': this.scan.bind(this), // Alternative Arabic variant
      
      // Math functions
      'abs': Math.abs,
      'sqrt': Math.sqrt,
      'pow': Math.pow,
      'random': Math.random,
      'floor': Math.floor,
      'ceil': Math.ceil,
      'min': Math.min,
      'max': Math.max,
      'round': Math.round,
      
      // Type conversion
      'parseInt': parseInt,
      'parseFloat': parseFloat,
      'toString': (val) => String(val),
      
      // String functions
      'length': (str) => str.length,
      'substring': (str, start, end) => str.substring(start, end),
      'indexOf': (str, search) => str.indexOf(search),
      'toUpperCase': (str) => str.toUpperCase(),
      'toLowerCase': (str) => str.toLowerCase(),
      
      // Array functions
      'arrayNew': (size = 0) => new Array(size).fill(null),
      'arrayLength': (arr) => arr?.length || 0,
      'arrayPush': (arr, item) => { if (arr) arr.push(item); return arr; },
      'arrayPop': (arr) => arr?.pop(),
      
      // Utility functions
      'sleep': this.sleep.bind(this),
      'typeof': (val) => typeof val
    };
  }
  
  /**
   * Register all standard library functions in the interpreter's environment
   * @param {Environment} environment - The environment to register functions in
   */
  register(environment) {
    for (const [name, func] of Object.entries(this.functions)) {
      environment.define(name, func);
    }
  }
  
  /**
   * Print function - sends output to the terminal
   * @param {...any} args - Values to print
   * @returns {string} The formatted output
   */
  print(...args) {
    // Convert all arguments to strings and join with space
    const output = args.map(arg => this.stringify(arg)).join(' ');
    
    // Send to terminal
    this.interpreter.terminal.write(output);
    
    return output;
  }
  
  /**
   * Convert any value to a string representation
   * @param {any} value - Value to stringify
   * @returns {string} String representation
   */
  stringify(value) {
    if (value === null || value === undefined) {
      return 'null';
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        // Format arrays
        return '[' + value.map(v => this.stringify(v)).join(', ') + ']';
      }
      
      // Handle other objects
      try {
        return JSON.stringify(value);
      } catch (e) {
        return '[Object]';
      }
    }
    
    // Return primitive values as strings
    return String(value);
  }
  
  /**
   * Scan function - requests input from the user
   * @param {string} [prompt=""] - Optional prompt to display
   * @returns {Promise<string>} User input
   */
  async scan(prompt = "") {
    // Show prompt
    if (prompt) {
      this.interpreter.terminal.write(prompt);
    }
    
    // Request input
    return await this.interpreter.requestInput();
  }
  
  /**
   * Sleep function - pauses execution for a specified duration
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>} Resolves after the specified duration
   */
  async sleep(ms) {
    if (typeof ms !== 'number' || ms < 0) {
      ms = 0;
    }
    
    // Limit to a maximum of 10 seconds to prevent abuse
    const maxMs = 10000;
    ms = Math.min(ms, maxMs);
    
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
