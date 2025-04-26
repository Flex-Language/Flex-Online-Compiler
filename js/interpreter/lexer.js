/**
 * Flex Language Lexer
 * Responsible for tokenizing Flex source code
 */
class FlexLexer {
  constructor() {
    this.tokens = [];
    this.source = '';
    this.start = 0;
    this.current = 0;
    this.line = 1;
    
    // Token types
    this.TOKEN_TYPES = {
      // Single-character tokens
      LEFT_PAREN: 'LEFT_PAREN',
      RIGHT_PAREN: 'RIGHT_PAREN',
      LEFT_BRACE: 'LEFT_BRACE',
      RIGHT_BRACE: 'RIGHT_BRACE',
      LEFT_BRACKET: 'LEFT_BRACKET',
      RIGHT_BRACKET: 'RIGHT_BRACKET',
      COMMA: 'COMMA',
      DOT: 'DOT',
      MINUS: 'MINUS',
      PLUS: 'PLUS',
      SEMICOLON: 'SEMICOLON',
      SLASH: 'SLASH',
      STAR: 'STAR',
      
      // One or two character tokens
      BANG: 'BANG',
      BANG_EQUAL: 'BANG_EQUAL',
      EQUAL: 'EQUAL',
      EQUAL_EQUAL: 'EQUAL_EQUAL',
      GREATER: 'GREATER',
      GREATER_EQUAL: 'GREATER_EQUAL',
      LESS: 'LESS',
      LESS_EQUAL: 'LESS_EQUAL',
      
      // Literals
      IDENTIFIER: 'IDENTIFIER',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      
      // Keywords
      AND: 'AND',
      OR: 'OR',
      IF: 'IF',
      ELSE: 'ELSE',
      TRUE: 'TRUE',
      FALSE: 'FALSE',
      FOR: 'FOR',
      WHILE: 'WHILE',
      FUNCTION: 'FUNCTION',
      RETURN: 'RETURN',
      NULL: 'NULL',
      PRINT: 'PRINT',
      PRINT_LINE: 'PRINT_LINE', // for etb3
      INPUT: 'INPUT',           // for da5l, d5l, scan
      
      EOF: 'EOF'
    };
    
    // Keywords mapping
    this.keywords = {
      'and': this.TOKEN_TYPES.AND,
      'or': this.TOKEN_TYPES.OR,
      'if': this.TOKEN_TYPES.IF,
      'else': this.TOKEN_TYPES.ELSE,
      'true': this.TOKEN_TYPES.TRUE,
      'false': this.TOKEN_TYPES.FALSE,
      'for': this.TOKEN_TYPES.FOR,
      'while': this.TOKEN_TYPES.WHILE,
      'function': this.TOKEN_TYPES.FUNCTION,
      'return': this.TOKEN_TYPES.RETURN,
      'null': this.TOKEN_TYPES.NULL,
      'print': this.TOKEN_TYPES.PRINT,
      'etb3': this.TOKEN_TYPES.PRINT_LINE,
      'da5l': this.TOKEN_TYPES.INPUT,
      'd5l': this.TOKEN_TYPES.INPUT,
      'scan': this.TOKEN_TYPES.INPUT
    };
  }
  
  /**
   * Tokenize the provided source code
   * @param {string} source - The source code to tokenize
   * @returns {Array} Array of tokens
   */
  tokenize(source) {
    this.source = source;
    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 1;
    
    while (!this.isAtEnd()) {
      // We are at the beginning of the next lexeme
      this.start = this.current;
      this.scanToken();
    }
    
    this.tokens.push(this.createToken(this.TOKEN_TYPES.EOF, "", null));
    return this.tokens;
  }
  
  /**
   * Scan a single token from the source
   */
  scanToken() {
    const c = this.advance();
    
    switch (c) {
      // Single-character tokens
      case '(': this.addToken(this.TOKEN_TYPES.LEFT_PAREN); break;
      case ')': this.addToken(this.TOKEN_TYPES.RIGHT_PAREN); break;
      case '{': this.addToken(this.TOKEN_TYPES.LEFT_BRACE); break;
      case '}': this.addToken(this.TOKEN_TYPES.RIGHT_BRACE); break;
      case '[': this.addToken(this.TOKEN_TYPES.LEFT_BRACKET); break;
      case ']': this.addToken(this.TOKEN_TYPES.RIGHT_BRACKET); break;
      case ',': this.addToken(this.TOKEN_TYPES.COMMA); break;
      case '.': this.addToken(this.TOKEN_TYPES.DOT); break;
      case '-': this.addToken(this.TOKEN_TYPES.MINUS); break;
      case '+': this.addToken(this.TOKEN_TYPES.PLUS); break;
      case ';': this.addToken(this.TOKEN_TYPES.SEMICOLON); break;
      case '*': this.addToken(this.TOKEN_TYPES.STAR); break;
      
      // One or two character tokens
      case '!': this.addToken(this.match('=') ? this.TOKEN_TYPES.BANG_EQUAL : this.TOKEN_TYPES.BANG); break;
      case '=': this.addToken(this.match('=') ? this.TOKEN_TYPES.EQUAL_EQUAL : this.TOKEN_TYPES.EQUAL); break;
      case '<': this.addToken(this.match('=') ? this.TOKEN_TYPES.LESS_EQUAL : this.TOKEN_TYPES.LESS); break;
      case '>': this.addToken(this.match('=') ? this.TOKEN_TYPES.GREATER_EQUAL : this.TOKEN_TYPES.GREATER); break;
      
      // Handle comments
      case '#': 
        // A comment goes until the end of the line
        while (this.peek() !== '\n' && !this.isAtEnd()) {
          this.advance();
        }
        break;
      
      // Ignore whitespace
      case ' ':
      case '\r':
      case '\t':
        break;
      
      // Handle newlines
      case '\n':
        this.line++;
        break;
      
      // String literals
      case '"': this.string('"'); break;
      case "'": this.string("'"); break;
      
      default:
        // Check for numbers
        if (this.isDigit(c)) {
          this.number();
        } 
        // Check for identifiers
        else if (this.isAlpha(c)) {
          this.identifier();
        }
        else {
          console.error(`Unexpected character '${c}' at line ${this.line}`);
        }
        break;
    }
  }
  
  /**
   * Process a string literal
   * @param {string} quoteType - The type of quote used (single or double)
   */
  string(quoteType) {
    while (this.peek() !== quoteType && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line++;
      this.advance();
    }
    
    if (this.isAtEnd()) {
      console.error(`Unterminated string at line ${this.line}`);
      return;
    }
    
    // The closing quote
    this.advance();
    
    // Trim the surrounding quotes
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(this.TOKEN_TYPES.STRING, value);
  }
  
  /**
   * Process a number literal
   */
  number() {
    while (this.isDigit(this.peek())) this.advance();
    
    // Look for a decimal part
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      // Consume the '.'
      this.advance();
      
      while (this.isDigit(this.peek())) this.advance();
    }
    
    const value = parseFloat(this.source.substring(this.start, this.current));
    this.addToken(this.TOKEN_TYPES.NUMBER, value);
  }
  
  /**
   * Process an identifier or keyword
   */
  identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();
    
    // See if the identifier is a reserved word
    const text = this.source.substring(this.start, this.current);
    const type = this.keywords[text] || this.TOKEN_TYPES.IDENTIFIER;
    
    this.addToken(type);
  }
  
  /**
   * Advance the current pointer and return the character
   * @returns {string} The current character
   */
  advance() {
    return this.source.charAt(this.current++);
  }
  
  /**
   * Add a token to the tokens list
   * @param {string} type - The token type
   * @param {*} literal - The literal value (optional)
   */
  addToken(type, literal = null) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(this.createToken(type, text, literal));
  }
  
  /**
   * Create a token object
   * @param {string} type - The token type
   * @param {string} lexeme - The token lexeme
   * @param {*} literal - The literal value
   * @returns {Object} The token object
   */
  createToken(type, lexeme, literal) {
    return {
      type,
      lexeme,
      literal,
      line: this.line
    };
  }
  
  /**
   * Check if the current character matches the expected character
   * @param {string} expected - The expected character
   * @returns {boolean} True if the character matches
   */
  match(expected) {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;
    
    this.current++;
    return true;
  }
  
  /**
   * Look at the current character without consuming it
   * @returns {string} The current character
   */
  peek() {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }
  
  /**
   * Look at the next character without consuming it
   * @returns {string} The next character
   */
  peekNext() {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }
  
  /**
   * Check if a character is a letter or underscore
   * @param {string} c - The character to check
   * @returns {boolean} True if the character is alpha
   */
  isAlpha(c) {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
           c === '_';
  }
  
  /**
   * Check if a character is a digit
   * @param {string} c - The character to check
   * @returns {boolean} True if the character is a digit
   */
  isDigit(c) {
    return c >= '0' && c <= '9';
  }
  
  /**
   * Check if a character is alphanumeric
   * @param {string} c - The character to check
   * @returns {boolean} True if the character is alphanumeric
   */
  isAlphaNumeric(c) {
    return this.isAlpha(c) || this.isDigit(c);
  }
  
  /**
   * Check if we've reached the end of the source
   * @returns {boolean} True if at the end
   */
  isAtEnd() {
    return this.current >= this.source.length;
  }
}
