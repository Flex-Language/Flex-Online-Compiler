/**
 * Flex Standard Library - Math Functions
 */
(function() {
  // Create the standard library namespace if it doesn't exist
  window.FlexStdLib = window.FlexStdLib || {};
  
  // Math Functions
  const MathFunctions = {
    /**
     * Get the absolute value of a number
     * @param {number} value - Input number
     * @returns {number} Absolute value
     */
    abs: function(interpreter, args) {
      if (args.length !== 1) throw new Error("abs() requires exactly 1 argument");
      return Math.abs(args[0]);
    },
    
    /**
     * Round a number to the nearest integer
     * @param {number} value - Input number
     * @returns {number} Rounded value
     */
    round: function(interpreter, args) {
      if (args.length !== 1) throw new Error("round() requires exactly 1 argument");
      return Math.round(args[0]);
    },
    
    /**
     * Get the floor of a number
     * @param {number} value - Input number
     * @returns {number} Floor value
     */
    floor: function(interpreter, args) {
      if (args.length !== 1) throw new Error("floor() requires exactly 1 argument");
      return Math.floor(args[0]);
    },
    
    /**
     * Get the ceiling of a number
     * @param {number} value - Input number
     * @returns {number} Ceiling value
     */
    ceil: function(interpreter, args) {
      if (args.length !== 1) throw new Error("ceil() requires exactly 1 argument");
      return Math.ceil(args[0]);
    },
    
    /**
     * Calculate a number raised to a power
     * @param {number} base - Base number
     * @param {number} exp - Exponent
     * @returns {number} Result
     */
    pow: function(interpreter, args) {
      if (args.length !== 2) throw new Error("pow() requires exactly 2 arguments");
      return Math.pow(args[0], args[1]);
    },
    
    /**
     * Calculate the square root of a number
     * @param {number} value - Input number
     * @returns {number} Square root
     */
    sqrt: function(interpreter, args) {
      if (args.length !== 1) throw new Error("sqrt() requires exactly 1 argument");
      if (args[0] < 0) throw new Error("Cannot calculate square root of negative number");
      return Math.sqrt(args[0]);
    },
    
    /**
     * Get a random number between 0 and 1
     * @returns {number} Random number
     */
    random: function(interpreter, args) {
      if (args.length === 0) {
        return Math.random();
      } else if (args.length === 1) {
        // Random integer from 0 to max-1
        return Math.floor(Math.random() * args[0]);
      } else if (args.length === 2) {
        // Random integer from min to max-1
        const min = args[0];
        const max = args[1];
        return Math.floor(Math.random() * (max - min)) + min;
      } else {
        throw new Error("random() accepts 0, 1, or 2 arguments");
      }
    },
    
    /**
     * Calculate the sine of an angle
     * @param {number} angle - Angle in radians
     * @returns {number} Sine value
     */
    sin: function(interpreter, args) {
      if (args.length !== 1) throw new Error("sin() requires exactly 1 argument");
      return Math.sin(args[0]);
    },
    
    /**
     * Calculate the cosine of an angle
     * @param {number} angle - Angle in radians
     * @returns {number} Cosine value
     */
    cos: function(interpreter, args) {
      if (args.length !== 1) throw new Error("cos() requires exactly 1 argument");
      return Math.cos(args[0]);
    },
    
    /**
     * Calculate the tangent of an angle
     * @param {number} angle - Angle in radians
     * @returns {number} Tangent value
     */
    tan: function(interpreter, args) {
      if (args.length !== 1) throw new Error("tan() requires exactly 1 argument");
      return Math.tan(args[0]);
    },
    
    /**
     * Get the minimum of multiple values
     * @param {...number} values - Input numbers
     * @returns {number} Minimum value
     */
    min: function(interpreter, args) {
      if (args.length < 1) throw new Error("min() requires at least 1 argument");
      return Math.min(...args);
    },
    
    /**
     * Get the maximum of multiple values
     * @param {...number} values - Input numbers
     * @returns {number} Maximum value
     */
    max: function(interpreter, args) {
      if (args.length < 1) throw new Error("max() requires at least 1 argument");
      return Math.max(...args);
    }
  };
  
  /**
   * Register all math functions to the environment
   * @param {Environment} env - Global environment to register functions in
   */
  function registerMath(env) {
    // Register standard math functions
    env.define('abs', {
      arity: () => 1,
      call: MathFunctions.abs,
      toString: () => '<native fn: abs>'
    });
    
    env.define('round', {
      arity: () => 1,
      call: MathFunctions.round,
      toString: () => '<native fn: round>'
    });
    
    env.define('floor', {
      arity: () => 1,
      call: MathFunctions.floor,
      toString: () => '<native fn: floor>'
    });
    
    env.define('ceil', {
      arity: () => 1,
      call: MathFunctions.ceil,
      toString: () => '<native fn: ceil>'
    });
    
    env.define('pow', {
      arity: () => 2,
      call: MathFunctions.pow,
      toString: () => '<native fn: pow>'
    });
    
    env.define('sqrt', {
      arity: () => 1,
      call: MathFunctions.sqrt,
      toString: () => '<native fn: sqrt>'
    });
    
    env.define('random', {
      arity: () => -1, // Variable arity (0, 1, or 2)
      call: MathFunctions.random,
      toString: () => '<native fn: random>'
    });
    
    env.define('sin', {
      arity: () => 1,
      call: MathFunctions.sin,
      toString: () => '<native fn: sin>'
    });
    
    env.define('cos', {
      arity: () => 1,
      call: MathFunctions.cos,
      toString: () => '<native fn: cos>'
    });
    
    env.define('tan', {
      arity: () => 1,
      call: MathFunctions.tan,
      toString: () => '<native fn: tan>'
    });
    
    env.define('min', {
      arity: () => -1, // Variable arity
      call: MathFunctions.min,
      toString: () => '<native fn: min>'
    });
    
    env.define('max', {
      arity: () => -1, // Variable arity
      call: MathFunctions.max,
      toString: () => '<native fn: max>'
    });
    
    // Define constants
    env.define('PI', Math.PI);
    env.define('E', Math.E);
  }
  
  // Add to the standard library
  window.FlexStdLib.registerMath = registerMath;
  
  // Add to the global register function
  const prevRegisterAll = window.FlexStdLib.registerAll;
  window.FlexStdLib.registerAll = function(env) {
    if (prevRegisterAll) prevRegisterAll(env);
    registerMath(env);
  };
})();
