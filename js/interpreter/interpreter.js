/**
 * Flex Interpreter
 * Executes the Abstract Syntax Tree (AST) produced by the parser
 */
class FlexInterpreter {
  constructor(terminal) {
    this.lexer = new FlexLexer();
    this.parser = new FlexParser(this.lexer);
    this.environment = new Environment();
    this.globals = this.environment;
    this.terminal = terminal;
    this.isRunning = false;
    this.isStopped = false;
    this.waitingForInput = false;
    this.inputResolveCallback = null;
    this.locals = new Map();
    
    // Initialize with standard library
    this.initializeStandardLibrary();
  }
  
  /**
   * Execute Flex code
   * @param {string} code - The Flex source code to execute
   * @returns {Promise<void>} Resolves when execution is complete
   */
  async execute(code) {
    try {
      // Reset state
      this.isRunning = true;
      this.isStopped = false;
      
      // Tokenize and parse
      this.terminal.writeLine("Tokenizing...", "info");
      const tokens = this.lexer.tokenize(code);
      
      this.terminal.writeLine("Parsing...", "info");
      const ast = this.parser.parse(tokens);
      
      if (!ast || !ast.statements) {
        this.terminal.writeLine("Failed to parse program.", "error");
        this.isRunning = false;
        return;
      }
      
      this.terminal.writeLine("Executing...", "info");
      
      // Time execution
      const startTime = performance.now();
      
      // Execute each statement in program
      for (let i = 0; i < ast.statements.length; i++) {
        if (this.isStopped) {
          this.terminal.writeLine("Execution stopped by user.", "warning");
          break;
        }
        
        await this.executeStatement(ast.statements[i]);
      }
      
      const endTime = performance.now();
      const executionTime = ((endTime - startTime) / 1000).toFixed(3);
      
      if (!this.isStopped) {
        this.terminal.writeLine(`Program completed in ${executionTime}s.`, "success");
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isRunning = false;
    }
  }
  
  /**
   * Stop code execution
   */
  stop() {
    if (this.isRunning) {
      this.isStopped = true;
      
      // If waiting for input, resolve with null
      if (this.waitingForInput && this.inputResolveCallback) {
        this.inputResolveCallback(null);
        this.waitingForInput = false;
        this.inputResolveCallback = null;
      }
    }
  }
  
  /**
   * Provide input to a running program
   * @param {string} input - User input
   */
  provideInput(input) {
    if (this.waitingForInput && this.inputResolveCallback) {
      this.inputResolveCallback(input);
      this.waitingForInput = false;
      this.inputResolveCallback = null;
    }
  }
  
  /**
   * Execute a statement
   * @param {Object} stmt - Statement AST node
   * @returns {Promise<*>} Result of statement execution
   */
  async executeStatement(stmt) {
    if (this.isStopped) return;
    
    try {
      switch (stmt.type) {
        case 'ExpressionStatement':
          return await this.evaluateExpression(stmt.expression);
          
        case 'PrintStatement':
          return await this.executePrintStatement(stmt);
          
        case 'InputStatement':
          return await this.executeInputStatement(stmt);
          
        case 'VariableDeclaration':
          return this.executeVariableDeclaration(stmt);
          
        case 'Assignment':
          return this.executeAssignment(stmt);
          
        case 'Block':
          return await this.executeBlock(stmt.statements, new Environment(this.environment));
          
        case 'IfStatement':
          return await this.executeIfStatement(stmt);
          
        case 'WhileStatement':
          return await this.executeWhileStatement(stmt);
          
        case 'FunctionDeclaration':
          return this.executeFunctionDeclaration(stmt);
          
        case 'ReturnStatement':
          return this.executeReturnStatement(stmt);
          
        default:
          throw new Error(`Unknown statement type: ${stmt.type}`);
      }
    } catch (error) {
      if (error instanceof ReturnValue) {
        // Return values are used internally for function returns
        throw error;
      }
      this.handleError(error);
    }
  }
  
  /**
   * Execute a print statement
   * @param {Object} stmt - Print statement AST node
   */
  async executePrintStatement(stmt) {
    const value = await this.evaluateExpression(stmt.expression);
    const output = this.stringify(value);
    
    if (stmt.isLine) {
      this.terminal.writeLine(output);
    } else {
      this.terminal.write(output);
    }
  }
  
  /**
   * Execute an input statement
   * @param {Object} stmt - Input statement AST node
   * @returns {Promise<string>} User input
   */
  async executeInputStatement(stmt) {
    let prompt = "Input: ";
    
    if (stmt.prompt) {
      const promptValue = await this.evaluateExpression(stmt.prompt);
      prompt = this.stringify(promptValue);
    }
    
    this.waitingForInput = true;
    
    const input = await new Promise(resolve => {
      this.inputResolveCallback = resolve;
      this.terminal.requestInput(prompt);
    });
    
    if (input === null) {
      throw new Error("Input cancelled");
    }
    
    return input;
  }
  
  /**
   * Execute a variable declaration
   * @param {Object} stmt - Variable declaration AST node
   */
  executeVariableDeclaration(stmt) {
    let value = null;
    
    if (stmt.initializer !== null) {
      value = this.evaluateExpression(stmt.initializer);
    }
    
    this.environment.define(stmt.name, value);
  }
  
  /**
   * Execute an assignment
   * @param {Object} stmt - Assignment AST node
   * @returns {*} The assigned value
   */
  executeAssignment(stmt) {
    const value = this.evaluateExpression(stmt.value);
    
    if (this.locals.has(stmt)) {
      const distance = this.locals.get(stmt);
      this.environment.assignAt(distance, stmt.name, value);
    } else {
      this.globals.assign(stmt.name, value);
    }
    
    return value;
  }
  
  /**
   * Execute a block of statements
   * @param {Array} statements - Array of statement AST nodes
   * @param {Environment} environment - The environment to use
   */
  async executeBlock(statements, environment) {
    const previousEnvironment = this.environment;
    
    try {
      this.environment = environment;
      
      for (const statement of statements) {
        if (this.isStopped) break;
        await this.executeStatement(statement);
      }
    } finally {
      this.environment = previousEnvironment;
    }
  }
  
  /**
   * Execute an if statement
   * @param {Object} stmt - If statement AST node
   */
  async executeIfStatement(stmt) {
    const condition = await this.evaluateExpression(stmt.condition);
    
    if (this.isTruthy(condition)) {
      await this.executeStatement(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      await this.executeStatement(stmt.elseBranch);
    }
  }
  
  /**
   * Execute a while statement
   * @param {Object} stmt - While statement AST node
   */
  async executeWhileStatement(stmt) {
    while (this.isTruthy(await this.evaluateExpression(stmt.condition)) && !this.isStopped) {
      await this.executeStatement(stmt.body);
      
      // Yield to the event loop occasionally to keep the UI responsive
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  /**
   * Execute a function declaration
   * @param {Object} stmt - Function declaration AST node
   */
  executeFunctionDeclaration(stmt) {
    const func = new FlexFunction(stmt, this.environment);
    this.environment.define(stmt.name, func);
  }
  
  /**
   * Execute a return statement
   * @param {Object} stmt - Return statement AST node
   */
  executeReturnStatement(stmt) {
    let value = null;
    
    if (stmt.value !== null) {
      value = this.evaluateExpression(stmt.value);
    }
    
    throw new ReturnValue(value);
  }
  
  /**
   * Evaluate an expression
   * @param {Object} expr - Expression AST node
   * @returns {*} Result of the expression
   */
  async evaluateExpression(expr) {
    switch (expr.type) {
      case 'Literal':
        return expr.value;
        
      case 'Variable':
        return this.lookupVariable(expr.name, expr);
        
      case 'Assignment':
        return this.executeAssignment(expr);
        
      case 'Binary':
        return this.evaluateBinaryExpression(expr);
        
      case 'Logical':
        return this.evaluateLogicalExpression(expr);
        
      case 'Unary':
        return this.evaluateUnaryExpression(expr);
        
      case 'Call':
        return await this.evaluateCallExpression(expr);
        
      case 'Grouping':
        return this.evaluateExpression(expr.expression);
        
      case 'ArrayLiteral':
        return this.evaluateArrayLiteral(expr);
        
      case 'Get':
        return this.evaluateGetExpression(expr);
        
      case 'Set':
        return this.evaluateSetExpression(expr);
        
      default:
        throw new Error(`Unknown expression type: ${expr.type}`);
    }
  }
  
  /**
   * Evaluate a binary expression
   * @param {Object} expr - Binary expression AST node
   * @returns {*} Result of the binary operation
   */
  evaluateBinaryExpression(expr) {
    const left = this.evaluateExpression(expr.left);
    const right = this.evaluateExpression(expr.right);
    
    switch (expr.operator.type) {
      // Arithmetic operations
      case this.lexer.TOKEN_TYPES.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return left - right;
        
      case this.lexer.TOKEN_TYPES.PLUS:
        if (typeof left === 'number' && typeof right === 'number') {
          return left + right;
        }
        
        if (typeof left === 'string' || typeof right === 'string') {
          return this.stringify(left) + this.stringify(right);
        }
        
        throw new Error("Operands must be numbers or strings.");
        
      case this.lexer.TOKEN_TYPES.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        if (right === 0) throw new Error("Division by zero.");
        return left / right;
        
      case this.lexer.TOKEN_TYPES.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return left * right;
        
      // Comparison operations
      case this.lexer.TOKEN_TYPES.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return left > right;
        
      case this.lexer.TOKEN_TYPES.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left >= right;
        
      case this.lexer.TOKEN_TYPES.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return left < right;
        
      case this.lexer.TOKEN_TYPES.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left <= right;
        
      // Equality operations
      case this.lexer.TOKEN_TYPES.EQUAL_EQUAL:
        return this.isEqual(left, right);
        
      case this.lexer.TOKEN_TYPES.BANG_EQUAL:
        return !this.isEqual(left, right);
    }
    
    return null;
  }
  
  /**
   * Evaluate a logical expression (AND, OR)
   * @param {Object} expr - Logical expression AST node
   * @returns {*} Result of the logical operation
   */
  evaluateLogicalExpression(expr) {
    const left = this.evaluateExpression(expr.left);
    
    if (expr.operator.type === this.lexer.TOKEN_TYPES.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }
    
    return this.evaluateExpression(expr.right);
  }
  
  /**
   * Evaluate a unary expression
   * @param {Object} expr - Unary expression AST node
   * @returns {*} Result of the unary operation
   */
  evaluateUnaryExpression(expr) {
    const right = this.evaluateExpression(expr.right);
    
    switch (expr.operator.type) {
      case this.lexer.TOKEN_TYPES.BANG:
        return !this.isTruthy(right);
        
      case this.lexer.TOKEN_TYPES.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
    }
    
    return null;
  }
  
  /**
   * Evaluate a function call
   * @param {Object} expr - Call expression AST node
   * @returns {Promise<*>} Result of the function call
   */
  async evaluateCallExpression(expr) {
    const callee = await this.evaluateExpression(expr.callee);
    
    if (typeof callee !== 'object' || !callee.call) {
      throw new Error("Can only call functions.");
    }
    
    const args = [];
    for (const arg of expr.arguments) {
      args.push(await this.evaluateExpression(arg));
    }
    
    if (args.length !== callee.arity() && callee.arity() !== -1) {
      throw new Error(`Expected ${callee.arity()} arguments but got ${args.length}.`);
    }
    
    return await callee.call(this, args);
  }
  
  /**
   * Evaluate an array literal
   * @param {Object} expr - Array literal AST node
   * @returns {Array} The array
   */
  evaluateArrayLiteral(expr) {
    const elements = [];
    
    for (const element of expr.elements) {
      elements.push(this.evaluateExpression(element));
    }
    
    return elements;
  }
  
  /**
   * Evaluate a property get expression
   * @param {Object} expr - Get expression AST node
   * @returns {*} The property value
   */
  evaluateGetExpression(expr) {
    const object = this.evaluateExpression(expr.object);
    
    if (object === null) {
      throw new Error("Cannot read property of null.");
    }
    
    if (Array.isArray(object)) {
      // Handle array indexing
      if (expr.name.type === this.lexer.TOKEN_TYPES.NUMBER) {
        const index = expr.name.literal;
        if (index < 0 || index >= object.length) {
          throw new Error(`Array index out of bounds: ${index}`);
        }
        return object[index];
      }
      
      // Handle array properties like length
      if (expr.name.lexeme === 'length') {
        return object.length;
      }
    }
    
    if (typeof object === 'object' && expr.name.lexeme in object) {
      return object[expr.name.lexeme];
    }
    
    throw new Error(`Undefined property: ${expr.name.lexeme}`);
  }
  
  /**
   * Evaluate a property set expression
   * @param {Object} expr - Set expression AST node
   * @returns {*} The assigned value
   */
  evaluateSetExpression(expr) {
    const object = this.evaluateExpression(expr.object);
    
    if (object === null) {
      throw new Error("Cannot set property of null.");
    }
    
    const value = this.evaluateExpression(expr.value);
    
    if (Array.isArray(object)) {
      // Handle array indexing
      if (expr.name.type === this.lexer.TOKEN_TYPES.NUMBER) {
        const index = expr.name.literal;
        if (index < 0) {
          throw new Error(`Array index out of bounds: ${index}`);
        }
        
        // Allow expanding the array
        object[index] = value;
        return value;
      }
    }
    
    if (typeof object === 'object') {
      object[expr.name.lexeme] = value;
      return value;
    }
    
    throw new Error(`Cannot set property on value of type ${typeof object}`);
  }
  
  /**
   * Look up a variable in the environment
   * @param {string} name - Variable name
   * @param {Object} expr - The expression AST node
   * @returns {*} Variable value
   */
  lookupVariable(name, expr) {
    if (this.locals.has(expr)) {
      const distance = this.locals.get(expr);
      return this.environment.getAt(distance, name);
    } else {
      return this.globals.get(name);
    }
  }
  
  /**
   * Check if a value is truthy according to Flex rules
   * @param {*} value - Value to check
   * @returns {boolean} Whether the value is truthy
   */
  isTruthy(value) {
    if (value === null) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }
  
  /**
   * Check if two values are equal
   * @param {*} a - First value
   * @param {*} b - Second value
   * @returns {boolean} Whether the values are equal
   */
  isEqual(a, b) {
    if (a === null && b === null) return true;
    if (a === null) return false;
    
    return a === b;
  }
  
  /**
   * Check if an operand is a number
   * @param {Object} operator - Operator token
   * @param {*} operand - Operand to check
   */
  checkNumberOperand(operator, operand) {
    if (typeof operand === 'number') return;
    throw new Error("Operand must be a number.");
  }
  
  /**
   * Check if operands are numbers
   * @param {Object} operator - Operator token
   * @param {*} left - Left operand
   * @param {*} right - Right operand
   */
  checkNumberOperands(operator, left, right) {
    if (typeof left === 'number' && typeof right === 'number') return;
    throw new Error("Operands must be numbers.");
  }
  
  /**
   * Convert a value to a string
   * @param {*} value - Value to stringify
   * @returns {string} String representation
   */
  stringify(value) {
    if (value === null) return "null";
    
    if (Array.isArray(value)) {
      return '[' + value.map(item => this.stringify(item)).join(', ') + ']';
    }
    
    return String(value);
  }
  
  /**
   * Initialize the standard library functions
   */
  initializeStandardLibrary() {
    // Import and register standard library
    // This will be implemented in separate modules
    if (window.FlexStdLib) {
      window.FlexStdLib.registerAll(this.globals);
    }
  }
  
  /**
   * Handle a runtime error
   * @param {Error} error - The error to handle
   */
  handleError(error) {
    if (error instanceof ReturnValue) return;
    
    this.terminal.writeLine(`Runtime Error: ${error.message}`, "error");
    console.error("Runtime Error:", error);
    
    // Stop execution
    this.isRunning = false;
    this.isStopped = true;
  }
}

/**
 * Class for Flex functions
 */
class FlexFunction {
  constructor(declaration, closure) {
    this.declaration = declaration;
    this.closure = closure;
  }
  
  /**
   * Get the arity (number of parameters) of the function
   * @returns {number} The arity
   */
  arity() {
    return this.declaration.parameters.length;
  }
  
  /**
   * Call the function
   * @param {FlexInterpreter} interpreter - The interpreter
   * @param {Array} args - The arguments
   * @returns {Promise<*>} Function result
   */
  async call(interpreter, args) {
    const environment = new Environment(this.closure);
    
    for (let i = 0; i < this.declaration.parameters.length; i++) {
      environment.define(
        this.declaration.parameters[i],
        args[i]
      );
    }
    
    try {
      await interpreter.executeBlock(this.declaration.body, environment);
    } catch (error) {
      if (error instanceof ReturnValue) {
        return error.value;
      }
      
      throw error;
    }
    
    return null;
  }
  
  toString() {
    return `<function ${this.declaration.name}>`;
  }
}

/**
 * Class for handling function returns
 */
class ReturnValue {
  constructor(value) {
    this.value = value;
  }
}
