/**
 * Flex Standard Library - String Functions
 */
(function() {
  // Create the standard library namespace if it doesn't exist
  window.FlexStdLib = window.FlexStdLib || {};
  
  // String Functions
  const StringFunctions = {
    /**
     * Get the length of a string
     * @param {string} str - Input string
     * @returns {number} Length
     */
    length: function(interpreter, args) {
      if (args.length !== 1) throw new Error("length() requires exactly 1 argument");
      if (typeof args[0] !== 'string') throw new Error("length() argument must be a string");
      return args[0].length;
    },
    
    /**
     * Convert a value to uppercase
     * @param {string} str - Input string
     * @returns {string} Uppercase string
     */
    toUpper: function(interpreter, args) {
      if (args.length !== 1) throw new Error("toUpper() requires exactly 1 argument");
      return String(args[0]).toUpperCase();
    },
    
    /**
     * Convert a value to lowercase
     * @param {string} str - Input string
     * @returns {string} Lowercase string
     */
    toLower: function(interpreter, args) {
      if (args.length !== 1) throw new Error("toLower() requires exactly 1 argument");
      return String(args[0]).toLowerCase();
    },
    
    /**
     * Get a substring of a string
     * @param {string} str - Input string
     * @param {number} start - Start index
     * @param {number} end - End index (optional)
     * @returns {string} Substring
     */
    substring: function(interpreter, args) {
      if (args.length < 2 || args.length > 3) {
        throw new Error("substring() requires 2 or 3 arguments");
      }
      
      const str = String(args[0]);
      const start = args[1];
      const end = args.length === 3 ? args[2] : undefined;
      
      return str.substring(start, end);
    },
    
    /**
     * Replace occurrences of a substring
     * @param {string} str - Input string
     * @param {string} search - Substring to search for
     * @param {string} replace - Replacement string
     * @returns {string} Resulting string
     */
    replace: function(interpreter, args) {
      if (args.length !== 3) throw new Error("replace() requires exactly 3 arguments");
      
      const str = String(args[0]);
      const search = String(args[1]);
      const replace = String(args[2]);
      
      return str.replace(new RegExp(search, 'g'), replace);
    },
    
    /**
     * Split a string into an array
     * @param {string} str - Input string
     * @param {string} delimiter - Delimiter
     * @returns {Array} Array of substrings
     */
    split: function(interpreter, args) {
      if (args.length !== 2) throw new Error("split() requires exactly 2 arguments");
      
      const str = String(args[0]);
      const delimiter = String(args[1]);
      
      return str.split(delimiter);
    },
    
    /**
     * Trim whitespace from a string
     * @param {string} str - Input string
     * @returns {string} Trimmed string
     */
    trim: function(interpreter, args) {
      if (args.length !== 1) throw new Error("trim() requires exactly 1 argument");
      return String(args[0]).trim();
    },
    
    /**
     * Check if a string starts with a substring
     * @param {string} str - Input string
     * @param {string} substring - Substring to check
     * @returns {boolean} Whether the string starts with the substring
     */
    startsWith: function(interpreter, args) {
      if (args.length !== 2) throw new Error("startsWith() requires exactly 2 arguments");
      
      const str = String(args[0]);
      const substring = String(args[1]);
      
      return str.startsWith(substring);
    },
    
    /**
     * Check if a string ends with a substring
     * @param {string} str - Input string
     * @param {string} substring - Substring to check
     * @returns {boolean} Whether the string ends with the substring
     */
    endsWith: function(interpreter, args) {
      if (args.length !== 2) throw new Error("endsWith() requires exactly 2 arguments");
      
      const str = String(args[0]);
      const substring = String(args[1]);
      
      return str.endsWith(substring);
    },
    
    /**
     * Check if a string contains a substring
     * @param {string} str - Input string
     * @param {string} substring - Substring to check
     * @returns {boolean} Whether the string contains the substring
     */
    contains: function(interpreter, args) {
      if (args.length !== 2) throw new Error("contains() requires exactly 2 arguments");
      
      const str = String(args[0]);
      const substring = String(args[1]);
      
      return str.includes(substring);
    },
    
    /**
     * Find the index of a substring
     * @param {string} str - Input string
     * @param {string} substring - Substring to find
     * @returns {number} Index of the substring, or -1 if not found
     */
    indexOf: function(interpreter, args) {
      if (args.length !== 2) throw new Error("indexOf() requires exactly 2 arguments");
      
      const str = String(args[0]);
      const substring = String(args[1]);
      
      return str.indexOf(substring);
    },
    
    /**
     * Repeat a string multiple times
     * @param {string} str - Input string
     * @param {number} count - Number of times to repeat
     * @returns {string} Repeated string
     */
    repeat: function(interpreter, args) {
      if (args.length !== 2) throw new Error("repeat() requires exactly 2 arguments");
      
      const str = String(args[0]);
      const count = args[1];
      
      return str.repeat(count);
    },
    
    /**
     * Pad a string to a certain length
     * @param {string} str - Input string
     * @param {number} length - Target length
     * @param {string} padString - String to pad with (default: ' ')
     * @returns {string} Padded string
     */
    padLeft: function(interpreter, args) {
      if (args.length < 2 || args.length > 3) {
        throw new Error("padLeft() requires 2 or 3 arguments");
      }
      
      const str = String(args[0]);
      const length = args[1];
      const padString = args.length === 3 ? String(args[2]) : ' ';
      
      return str.padStart(length, padString);
    },
    
    /**
     * Pad a string to a certain length
     * @param {string} str - Input string
     * @param {number} length - Target length
     * @param {string} padString - String to pad with (default: ' ')
     * @returns {string} Padded string
     */
    padRight: function(interpreter, args) {
      if (args.length < 2 || args.length > 3) {
        throw new Error("padRight() requires 2 or 3 arguments");
      }
      
      const str = String(args[0]);
      const length = args[1];
      const padString = args.length === 3 ? String(args[2]) : ' ';
      
      return str.padEnd(length, padString);
    }
  };
  
  /**
   * Register all string functions to the environment
   * @param {Environment} env - Global environment to register functions in
   */
  function registerString(env) {
    // Add string functions
    env.define('length', {
      arity: () => 1,
      call: StringFunctions.length,
      toString: () => '<native fn: length>'
    });
    
    env.define('toUpper', {
      arity: () => 1,
      call: StringFunctions.toUpper,
      toString: () => '<native fn: toUpper>'
    });
    
    env.define('toLower', {
      arity: () => 1,
      call: StringFunctions.toLower,
      toString: () => '<native fn: toLower>'
    });
    
    env.define('substring', {
      arity: () => -1, // Variable arity (2 or 3)
      call: StringFunctions.substring,
      toString: () => '<native fn: substring>'
    });
    
    env.define('replace', {
      arity: () => 3,
      call: StringFunctions.replace,
      toString: () => '<native fn: replace>'
    });
    
    env.define('split', {
      arity: () => 2,
      call: StringFunctions.split,
      toString: () => '<native fn: split>'
    });
    
    env.define('trim', {
      arity: () => 1,
      call: StringFunctions.trim,
      toString: () => '<native fn: trim>'
    });
    
    env.define('startsWith', {
      arity: () => 2,
      call: StringFunctions.startsWith,
      toString: () => '<native fn: startsWith>'
    });
    
    env.define('endsWith', {
      arity: () => 2,
      call: StringFunctions.endsWith,
      toString: () => '<native fn: endsWith>'
    });
    
    env.define('contains', {
      arity: () => 2,
      call: StringFunctions.contains,
      toString: () => '<native fn: contains>'
    });
    
    env.define('indexOf', {
      arity: () => 2,
      call: StringFunctions.indexOf,
      toString: () => '<native fn: indexOf>'
    });
    
    env.define('repeat', {
      arity: () => 2,
      call: StringFunctions.repeat,
      toString: () => '<native fn: repeat>'
    });
    
    env.define('padLeft', {
      arity: () => -1, // Variable arity (2 or 3)
      call: StringFunctions.padLeft,
      toString: () => '<native fn: padLeft>'
    });
    
    env.define('padRight', {
      arity: () => -1, // Variable arity (2 or 3)
      call: StringFunctions.padRight,
      toString: () => '<native fn: padRight>'
    });
  }
  
  // Add to the standard library
  window.FlexStdLib.registerString = registerString;
  
  // Add to the global register function
  const prevRegisterAll = window.FlexStdLib.registerAll;
  window.FlexStdLib.registerAll = function(env) {
    if (prevRegisterAll) prevRegisterAll(env);
    registerString(env);
  };
})();
