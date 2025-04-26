/**
 * Flex language mode for CodeMirror
 * Provides syntax highlighting for Flex programming language
 */
(function(CodeMirror) {
  'use strict';
  
  CodeMirror.defineMode('flex', function() {
    // Keywords for Flex (including English and Arabic variants)
    const keywords = new Set([
      'if', 'else', 'while', 'for', 'function', 'return',
      'var', 'print', 'scan', 'break', 'continue',
      // Arabic variants
      'etb3', 'da5l', 'd5l'
    ]);
    
    // Built-in functions and libraries
    const builtins = new Set([
      'parseInt', 'parseFloat', 'toString', 'length',
      'abs', 'sqrt', 'pow', 'random', 'floor', 'ceil',
      'min', 'max', 'substring', 'indexOf', 'toUpperCase',
      'toLowerCase'
    ]);
    
    // Operators and punctuation
    const operators = new Set([
      '+', '-', '*', '/', '%', '=', '==', '!=', '<', '>',
      '<=', '>=', '&&', '||', '!', '&', '|', '^', '~'
    ]);
    
    return {
      startState: function() {
        return {
          inString: false,
          inComment: false,
          lastToken: null
        };
      },
      
      token: function(stream, state) {
        // Handle comments
        if (state.inComment) {
          if (stream.match('*/')) {
            state.inComment = false;
            return 'comment';
          }
          stream.skipToEnd();
          return 'comment';
        }
        
        if (stream.match('/*')) {
          state.inComment = true;
          return 'comment';
        }
        
        if (stream.match('//')) {
          stream.skipToEnd();
          return 'comment';
        }
        
        // Skip whitespace
        if (stream.eatSpace()) return null;
        
        // Handle strings
        if (state.inString) {
          while (!stream.eol()) {
            if (stream.next() === '"') {
              state.inString = false;
              break;
            }
          }
          return 'string';
        }
        
        if (stream.peek() === '"') {
          stream.next();
          state.inString = true;
          return 'string';
        }
        
        // Handle numbers
        if (stream.match(/^-?\d+(\.\d+)?/)) {
          return 'number';
        }
        
        // Keywords and identifiers
        if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
          const word = stream.current();
          
          if (keywords.has(word)) {
            return 'keyword';
          }
          
          if (builtins.has(word)) {
            return 'builtin';
          }
          
          return 'variable';
        }
        
        // Operators
        let ch = stream.next();
        if (ch === '=' && stream.peek() === '=') {
          stream.next();
          return 'operator';
        }
        
        if (ch === '!' && stream.peek() === '=') {
          stream.next();
          return 'operator';
        }
        
        if (ch === '<' && stream.peek() === '=') {
          stream.next();
          return 'operator';
        }
        
        if (ch === '>' && stream.peek() === '=') {
          stream.next();
          return 'operator';
        }
        
        if (ch === '&' && stream.peek() === '&') {
          stream.next();
          return 'operator';
        }
        
        if (ch === '|' && stream.peek() === '|') {
          stream.next();
          return 'operator';
        }
        
        if (operators.has(ch)) {
          return 'operator';
        }
        
        // Brackets, braces, parentheses
        if (/[\[\]{}()]/.test(ch)) {
          return 'bracket';
        }
        
        // Semicolons and commas
        if (/[;,]/.test(ch)) {
          return 'punctuation';
        }
        
        return null;
      }
    };
  });
  
  // Register the MIME type
  CodeMirror.defineMIME('text/x-flex', 'flex');
  
  // Add file extensions
  CodeMirror.modeInfo.push({
    name: 'Flex',
    mime: 'text/x-flex',
    mode: 'flex',
    ext: ['flex', 'lx']
  });
  
})(CodeMirror);
