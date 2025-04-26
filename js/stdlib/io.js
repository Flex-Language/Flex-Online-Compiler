/**
 * Flex Standard Library - Input/Output Functions
 */
(function() {
  // Create the standard library namespace if it doesn't exist
  window.FlexStdLib = window.FlexStdLib || {};
  
  // IO Functions
  const IO = {
    /**
     * Print a value to the terminal
     * @param {*} value - Value to print
     */
    print: function(interpreter, args) {
      const value = args[0] || '';
      interpreter.terminal.write(String(value));
      return null;
    },
    
    /**
     * Print a value to the terminal with a newline
     * @param {*} value - Value to print
     */
    println: function(interpreter, args) {
      const value = args[0] || '';
      interpreter.terminal.writeLine(String(value));
      return null;
    },
    
    /**
     * Read a line of input from the user
     * @param {string} prompt - Optional prompt to display
     * @returns {Promise<string>} User input
     */
    input: async function(interpreter, args) {
      const prompt = args[0] || 'Input: ';
      return await interpreter.terminal.requestInput(String(prompt));
    },
    
    /**
     * Clear the terminal
     */
    clearScreen: function(interpreter, args) {
      interpreter.terminal.clear();
      return null;
    }
  };
  
  /**
   * Register all IO functions to the environment
   * @param {Environment} env - Global environment to register functions in
   */
  function registerIO(env) {
    // Register standard printing functions (multi-syntax support)
    env.define('print', {
      arity: () => 1,
      call: IO.print,
      toString: () => '<native fn: print>'
    });
    
    env.define('etb3', {
      arity: () => 1,
      call: IO.println,
      toString: () => '<native fn: etb3>'
    });
    
    env.define('printLine', {
      arity: () => 1,
      call: IO.println,
      toString: () => '<native fn: printLine>'
    });
    
    // Register input functions (multi-syntax support)
    env.define('input', {
      arity: () => -1, // -1 means variable arity (0 or 1)
      call: IO.input,
      toString: () => '<native fn: input>'
    });
    
    env.define('da5l', {
      arity: () => -1,
      call: IO.input,
      toString: () => '<native fn: da5l>'
    });
    
    env.define('d5l', {
      arity: () => -1,
      call: IO.input,
      toString: () => '<native fn: d5l>'
    });
    
    env.define('scan', {
      arity: () => -1,
      call: IO.input,
      toString: () => '<native fn: scan>'
    });
    
    // Register other IO functions
    env.define('clearScreen', {
      arity: () => 0,
      call: IO.clearScreen,
      toString: () => '<native fn: clearScreen>'
    });
  }
  
  // Add to the standard library
  window.FlexStdLib.registerIO = registerIO;
  
  // Add to the global register function
  const prevRegisterAll = window.FlexStdLib.registerAll;
  window.FlexStdLib.registerAll = function(env) {
    if (prevRegisterAll) prevRegisterAll(env);
    registerIO(env);
  };
})();
