/**
 * Flex Language Parser
 * Converts tokens into an Abstract Syntax Tree (AST)
 */
class FlexParser {
  constructor(lexer) {
    this.lexer = lexer;
    this.tokens = [];
    this.current = 0;
  }
  
  /**
   * Parse the provided tokens into an AST
   * @param {Array} tokens - Array of tokens from the lexer
   * @returns {Object} The AST root node
   */
  parse(tokens) {
    this.tokens = tokens;
    this.current = 0;
    
    const statements = [];
    
    try {
      while (!this.isAtEnd()) {
        const statement = this.declaration();
        if (statement) {
          statements.push(statement);
        }
      }
      
      return { type: 'Program', statements };
    } catch (error) {
      console.error('Parse error:', error);
      return { type: 'Program', statements: [] };
    }
  }
  
  /**
   * Parse a declaration (variables, functions, etc.)
   * @returns {Object} AST node for the declaration
   */
  declaration() {
    try {
      if (this.match(this.lexer.TOKEN_TYPES.FUNCTION)) {
        return this.functionDeclaration();
      }
      
      // In Flex, variables are declared without a specific keyword
      // They're just assignments

      return this.statement();
    } catch (error) {
      this.synchronize();
      return null;
    }
  }
  
  /**
   * Parse a function declaration
   * @returns {Object} AST node for the function
   */
  functionDeclaration() {
    const name = this.consume(this.lexer.TOKEN_TYPES.IDENTIFIER, "Expect function name.");
    
    this.consume(this.lexer.TOKEN_TYPES.LEFT_PAREN, "Expect '(' after function name.");
    const parameters = [];
    
    if (!this.check(this.lexer.TOKEN_TYPES.RIGHT_PAREN)) {
      do {
        if (parameters.length >= 255) {
          this.error("Cannot have more than 255 parameters.");
        }
        
        parameters.push(this.consume(this.lexer.TOKEN_TYPES.IDENTIFIER, "Expect parameter name."));
      } while (this.match(this.lexer.TOKEN_TYPES.COMMA));
    }
    
    this.consume(this.lexer.TOKEN_TYPES.RIGHT_PAREN, "Expect ')' after parameters.");
    
    this.consume(this.lexer.TOKEN_TYPES.LEFT_BRACE, "Expect '{' before function body.");
    const body = this.block();
    
    return {
      type: 'FunctionDeclaration',
      name: name.lexeme,
      parameters: parameters.map(param => param.lexeme),
      body
    };
  }
  
  /**
   * Parse a statement
   * @returns {Object} AST node for the statement
   */
  statement() {
    if (this.match(this.lexer.TOKEN_TYPES.IF)) return this.ifStatement();
    if (this.match(this.lexer.TOKEN_TYPES.WHILE)) return this.whileStatement();
    if (this.match(this.lexer.TOKEN_TYPES.FOR)) return this.forStatement();
    if (this.match(this.lexer.TOKEN_TYPES.RETURN)) return this.returnStatement();
    if (this.match(this.lexer.TOKEN_TYPES.PRINT, this.lexer.TOKEN_TYPES.PRINT_LINE)) return this.printStatement();
    if (this.match(this.lexer.TOKEN_TYPES.INPUT)) return this.inputStatement();
    if (this.match(this.lexer.TOKEN_TYPES.LEFT_BRACE)) return { type: 'Block', statements: this.block() };
    
    return this.expressionStatement();
  }
  
  /**
   * Parse an if statement
   * @returns {Object} AST node for the if statement
   */
  ifStatement() {
    this.consume(this.lexer.TOKEN_TYPES.LEFT_PAREN, "Expect '(' after 'if'.");
    const condition = this.expression();
    this.consume(this.lexer.TOKEN_TYPES.RIGHT_PAREN, "Expect ')' after if condition.");
    
    const thenBranch = this.statement();
    let elseBranch = null;
    
    if (this.match(this.lexer.TOKEN_TYPES.ELSE)) {
      elseBranch = this.statement();
    }
    
    return {
      type: 'IfStatement',
      condition,
      thenBranch,
      elseBranch
    };
  }
  
  /**
   * Parse a while statement
   * @returns {Object} AST node for the while statement
   */
  whileStatement() {
    this.consume(this.lexer.TOKEN_TYPES.LEFT_PAREN, "Expect '(' after 'while'.");
    const condition = this.expression();
    this.consume(this.lexer.TOKEN_TYPES.RIGHT_PAREN, "Expect ')' after while condition.");
    
    const body = this.statement();
    
    return {
      type: 'WhileStatement',
      condition,
      body
    };
  }
  
  /**
   * Parse a for statement
   * @returns {Object} AST node for the for statement
   */
  forStatement() {
    this.consume(this.lexer.TOKEN_TYPES.LEFT_PAREN, "Expect '(' after 'for'.");
    
    // Initializer
    let initializer;
    if (this.match(this.lexer.TOKEN_TYPES.SEMICOLON)) {
      initializer = null;
    } else {
      initializer = this.expressionStatement();
    }
    
    // Condition
    let condition = null;
    if (!this.check(this.lexer.TOKEN_TYPES.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(this.lexer.TOKEN_TYPES.SEMICOLON, "Expect ';' after loop condition.");
    
    // Increment
    let increment = null;
    if (!this.check(this.lexer.TOKEN_TYPES.RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(this.lexer.TOKEN_TYPES.RIGHT_PAREN, "Expect ')' after for clauses.");
    
    // Body
    let body = this.statement();
    
    // Desugar for loop into while loop
    if (increment !== null) {
      body = {
        type: 'Block',
        statements: [
          body,
          { type: 'ExpressionStatement', expression: increment }
        ]
      };
    }
    
    if (condition === null) {
      condition = { type: 'Literal', value: true };
    }
    
    body = {
      type: 'WhileStatement',
      condition,
      body
    };
    
    if (initializer !== null) {
      body = {
        type: 'Block',
        statements: [initializer, body]
      };
    }
    
    return body;
  }
  
  /**
   * Parse a return statement
   * @returns {Object} AST node for the return statement
   */
  returnStatement() {
    const keyword = this.previous();
    let value = null;
    
    if (!this.check(this.lexer.TOKEN_TYPES.SEMICOLON)) {
      value = this.expression();
    }
    
    this.consume(this.lexer.TOKEN_TYPES.SEMICOLON, "Expect ';' after return value.");
    
    return {
      type: 'ReturnStatement',
      keyword,
      value
    };
  }
  
  /**
   * Parse a print statement
   * @returns {Object} AST node for the print statement
   */
  printStatement() {
    const isLine = this.previous().type === this.lexer.TOKEN_TYPES.PRINT_LINE;
    
    this.consume(this.lexer.TOKEN_TYPES.LEFT_PAREN, "Expect '(' after 'print'.");
    const expression = this.expression();
    this.consume(this.lexer.TOKEN_TYPES.RIGHT_PAREN, "Expect ')' after print value.");
    
    this.consume(this.lexer.TOKEN_TYPES.SEMICOLON, "Expect ';' after print statement.");
    
    return {
      type: 'PrintStatement',
      expression,
      isLine
    };
  }
  
  /**
   * Parse an input statement
   * @returns {Object} AST node for the input statement
   */
  inputStatement() {
    const inputType = this.previous().lexeme; // da5l, d5l, or scan
    
    this.consume(this.lexer.TOKEN_TYPES.LEFT_PAREN, `Expect '(' after '${inputType}'.`);
    
    let prompt = null;
    if (!this.check(this.lexer.TOKEN_TYPES.RIGHT_PAREN)) {
      prompt = this.expression();
    }
    
    this.consume(this.lexer.TOKEN_TYPES.RIGHT_PAREN, `Expect ')' after ${inputType} arguments.`);
    
    this.consume(this.lexer.TOKEN_TYPES.SEMICOLON, `Expect ';' after ${inputType} statement.`);
    
    return {
      type: 'InputStatement',
      inputType,
      prompt
    };
  }
  
  /**
   * Parse a block of statements
   * @returns {Array} Array of statement AST nodes
   */
  block() {
    const statements = [];
    
    while (!this.check(this.lexer.TOKEN_TYPES.RIGHT_BRACE) && !this.isAtEnd()) {
      const declaration = this.declaration();
      if (declaration) {
        statements.push(declaration);
      }
    }
    
    this.consume(this.lexer.TOKEN_TYPES.RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  }
  
  /**
   * Parse an expression statement
   * @returns {Object} AST node for the expression statement
   */
  expressionStatement() {
    const expression = this.expression();
    this.consume(this.lexer.TOKEN_TYPES.SEMICOLON, "Expect ';' after expression.");
    
    return {
      type: 'ExpressionStatement',
      expression
    };
  }
  
  /**
   * Parse an expression
   * @returns {Object} AST node for the expression
   */
  expression() {
    return this.assignment();
  }
  
  /**
   * Parse an assignment expression
   * @returns {Object} AST node for the assignment
   */
  assignment() {
    const expr = this.logicalOr();
    
    if (this.match(this.lexer.TOKEN_TYPES.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();
      
      if (expr.type === 'Variable') {
        return {
          type: 'Assignment',
          name: expr.name,
          value
        };
      } else if (expr.type === 'Get') {
        return {
          type: 'Set',
          object: expr.object,
          name: expr.name,
          value
        };
      }
      
      this.error("Invalid assignment target.");
    }
    
    return expr;
  }
  
  /**
   * Parse a logical OR expression
   * @returns {Object} AST node for the logical OR
   */
  logicalOr() {
    let expr = this.logicalAnd();
    
    while (this.match(this.lexer.TOKEN_TYPES.OR)) {
      const operator = this.previous();
      const right = this.logicalAnd();
      
      expr = {
        type: 'Logical',
        left: expr,
        operator,
        right
      };
    }
    
    return expr;
  }
  
  /**
   * Parse a logical AND expression
   * @returns {Object} AST node for the logical AND
   */
  logicalAnd() {
    let expr = this.equality();
    
    while (this.match(this.lexer.TOKEN_TYPES.AND)) {
      const operator = this.previous();
      const right = this.equality();
      
      expr = {
        type: 'Logical',
        left: expr,
        operator,
        right
      };
    }
    
    return expr;
  }
  
  /**
   * Parse an equality expression
   * @returns {Object} AST node for the equality
   */
  equality() {
    let expr = this.comparison();
    
    while (this.match(this.lexer.TOKEN_TYPES.BANG_EQUAL, this.lexer.TOKEN_TYPES.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      
      expr = {
        type: 'Binary',
        left: expr,
        operator,
        right
      };
    }
    
    return expr;
  }
  
  /**
   * Parse a comparison expression
   * @returns {Object} AST node for the comparison
   */
  comparison() {
    let expr = this.term();
    
    while (this.match(
      this.lexer.TOKEN_TYPES.GREATER,
      this.lexer.TOKEN_TYPES.GREATER_EQUAL,
      this.lexer.TOKEN_TYPES.LESS,
      this.lexer.TOKEN_TYPES.LESS_EQUAL
    )) {
      const operator = this.previous();
      const right = this.term();
      
      expr = {
        type: 'Binary',
        left: expr,
        operator,
        right
      };
    }
    
    return expr;
  }
  
  /**
   * Parse a term expression (addition, subtraction)
   * @returns {Object} AST node for the term
   */
  term() {
    let expr = this.factor();
    
    while (this.match(this.lexer.TOKEN_TYPES.MINUS, this.lexer.TOKEN_TYPES.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      
      expr = {
        type: 'Binary',
        left: expr,
        operator,
        right
      };
    }
    
    return expr;
  }
  
  /**
   * Parse a factor expression (multiplication, division)
   * @returns {Object} AST node for the factor
   */
  factor() {
    let expr = this.unary();
    
    while (this.match(this.lexer.TOKEN_TYPES.SLASH, this.lexer.TOKEN_TYPES.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      
      expr = {
        type: 'Binary',
        left: expr,
        operator,
        right
      };
    }
    
    return expr;
  }
  
  /**
   * Parse a unary expression
   * @returns {Object} AST node for the unary
   */
  unary() {
    if (this.match(this.lexer.TOKEN_TYPES.BANG, this.lexer.TOKEN_TYPES.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      
      return {
        type: 'Unary',
        operator,
        right
      };
    }
    
    return this.call();
  }
  
  /**
   * Parse a function call
   * @returns {Object} AST node for the call
   */
  call() {
    let expr = this.primary();
    
    while (true) {
      if (this.match(this.lexer.TOKEN_TYPES.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(this.lexer.TOKEN_TYPES.DOT)) {
        const name = this.consume(this.lexer.TOKEN_TYPES.IDENTIFIER, "Expect property name after '.'.");
        
        expr = {
          type: 'Get',
          object: expr,
          name
        };
      } else {
        break;
      }
    }
    
    return expr;
  }
  
  /**
   * Finish parsing a function call
   * @param {Object} callee - The function being called
   * @returns {Object} AST node for the call
   */
  finishCall(callee) {
    const arguments_ = [];
    
    if (!this.check(this.lexer.TOKEN_TYPES.RIGHT_PAREN)) {
      do {
        if (arguments_.length >= 255) {
          this.error("Cannot have more than 255 arguments.");
        }
        
        arguments_.push(this.expression());
      } while (this.match(this.lexer.TOKEN_TYPES.COMMA));
    }
    
    const paren = this.consume(this.lexer.TOKEN_TYPES.RIGHT_PAREN, "Expect ')' after arguments.");
    
    return {
      type: 'Call',
      callee,
      paren,
      arguments: arguments_
    };
  }
  
  /**
   * Parse a primary expression (literals, variables, etc.)
   * @returns {Object} AST node for the primary
   */
  primary() {
    if (this.match(this.lexer.TOKEN_TYPES.FALSE)) return { type: 'Literal', value: false };
    if (this.match(this.lexer.TOKEN_TYPES.TRUE)) return { type: 'Literal', value: true };
    if (this.match(this.lexer.TOKEN_TYPES.NULL)) return { type: 'Literal', value: null };
    
    if (this.match(this.lexer.TOKEN_TYPES.NUMBER, this.lexer.TOKEN_TYPES.STRING)) {
      return { type: 'Literal', value: this.previous().literal };
    }
    
    if (this.match(this.lexer.TOKEN_TYPES.IDENTIFIER)) {
      return { type: 'Variable', name: this.previous().lexeme };
    }
    
    if (this.match(this.lexer.TOKEN_TYPES.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(this.lexer.TOKEN_TYPES.RIGHT_PAREN, "Expect ')' after expression.");
      
      return { type: 'Grouping', expression: expr };
    }
    
    // Array literals (Flex supports arrays)
    if (this.match(this.lexer.TOKEN_TYPES.LEFT_BRACKET)) {
      const elements = [];
      
      if (!this.check(this.lexer.TOKEN_TYPES.RIGHT_BRACKET)) {
        do {
          elements.push(this.expression());
        } while (this.match(this.lexer.TOKEN_TYPES.COMMA));
      }
      
      this.consume(this.lexer.TOKEN_TYPES.RIGHT_BRACKET, "Expect ']' after array elements.");
      
      return { type: 'ArrayLiteral', elements };
    }
    
    this.error(`Expect expression. Got ${this.peek().type}.`);
  }
  
  /**
   * Check if the current token matches any of the given types
   * @param  {...string} types - Token types to match
   * @returns {boolean} True if current token matches any type
   */
  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check if the current token is of the given type
   * @param {string} type - Token type to check
   * @returns {boolean} True if current token matches type
   */
  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }
  
  /**
   * Advance to the next token
   * @returns {Object} The previous token
   */
  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }
  
  /**
   * Check if we've reached the end of the tokens
   * @returns {boolean} True if at the end
   */
  isAtEnd() {
    return this.peek().type === this.lexer.TOKEN_TYPES.EOF;
  }
  
  /**
   * Get the current token
   * @returns {Object} The current token
   */
  peek() {
    return this.tokens[this.current];
  }
  
  /**
   * Get the previous token
   * @returns {Object} The previous token
   */
  previous() {
    return this.tokens[this.current - 1];
  }
  
  /**
   * Consume a token of the expected type
   * @param {string} type - The expected token type
   * @param {string} message - Error message if token doesn't match
   * @returns {Object} The consumed token
   */
  consume(type, message) {
    if (this.check(type)) return this.advance();
    
    this.error(message);
  }
  
  /**
   * Report a parsing error
   * @param {string} message - Error message
   */
  error(message) {
    const token = this.peek();
    const line = token.line;
    const where = token.type === this.lexer.TOKEN_TYPES.EOF 
      ? " at end" 
      : ` at '${token.lexeme}'`;
    
    const error = new SyntaxError(`[line ${line}] Error${where}: ${message}`);
    console.error(error);
    throw error;
  }
  
  /**
   * Synchronize after a parsing error
   * Discards tokens until we reach a statement boundary
   */
  synchronize() {
    this.advance();
    
    while (!this.isAtEnd()) {
      if (this.previous().type === this.lexer.TOKEN_TYPES.SEMICOLON) return;
      
      switch (this.peek().type) {
        case this.lexer.TOKEN_TYPES.FUNCTION:
        case this.lexer.TOKEN_TYPES.IF:
        case this.lexer.TOKEN_TYPES.WHILE:
        case this.lexer.TOKEN_TYPES.FOR:
        case this.lexer.TOKEN_TYPES.RETURN:
        case this.lexer.TOKEN_TYPES.PRINT:
        case this.lexer.TOKEN_TYPES.PRINT_LINE:
          return;
      }
      
      this.advance();
    }
  }
}
