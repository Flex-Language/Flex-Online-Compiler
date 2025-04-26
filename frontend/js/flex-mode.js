// Define a CodeMirror mode for the Flex programming language
CodeMirror.defineMode("flex", function() {
  const keywords = /^(if|else|for|while|break|continue|return|sndo2|rg3|rakm|dorg|geeb|etb3|da5l|true|false|int|string|bool|list)\b/;
  
  const operators = /^(\+\+|\--|\+|\-|\*|\/|%|==|!=|>=|<=|>|<|&&|\|\||!|=)/;
  
  return {
    startState: function() {
      return {
        inString: false,
        // Single-line comments don't need state tracking between lines
        inMultiLineComment: false,
        inPythonMultiLineComment: false
      };
    },
    
    token: function(stream, state) {
      // Handle C-style multi-line comments
      if (state.inMultiLineComment) {
        if (stream.match("*/")) {
          state.inMultiLineComment = false;
          return "comment";
        }
        stream.next();
        return "comment";
      }
      
      // Handle Python-style multi-line comments
      if (state.inPythonMultiLineComment) {
        if (stream.match("'''")) {
          state.inPythonMultiLineComment = false;
          return "comment";
        }
        stream.next();
        return "comment";
      }
      
      // Handle whitespace
      if (stream.eatSpace()) return null;
      
      // Check for single-line comments (# and //)
      // These don't need state tracking since they end at end-of-line
      if (stream.match("#") || stream.match("//")) {
        stream.skipToEnd();
        return "comment";
      }
      
      // Check for multi-line comment start
      if (stream.match("/*")) {
        state.inMultiLineComment = true;
        return "comment";
      }
      
      // Check for Python-style multi-line comment start
      if (stream.match("'''")) {
        state.inPythonMultiLineComment = true;
        return "comment";
      }
      
      // Handle strings
      if (stream.match('"')) {
        state.inString = true;
        while (!stream.eol()) {
          const char = stream.next();
          if (char === '"' && stream.peek() !== '"') {
            state.inString = false;
            break;
          } else if (char === '\\' && stream.peek() === '"') {
            stream.next();
          }
        }
        return "string";
      }
      
      // Handle string interpolation with { }
      if (state.inString && stream.match('{')) {
        const content = stream.match(/[^}]+/);
        if (content && stream.eat('}')) {
          return "variable";
        }
        return "string";
      }
      
      // Handle numbers
      if (stream.match(/^-?\d+(\.\d+)?/)) {
        return "number";
      }
      
      // Handle keywords
      if (stream.match(keywords)) {
        return "keyword";
      }
      
      // Handle operators
      if (stream.match(operators)) {
        return "operator";
      }
      
      // Handle variable/function names
      if (stream.match(/^\w+/)) {
        return "variable";
      }
      
      // Handle special symbols
      if (stream.match(/[\[\]\(\)\{\},;]/)) {
        return "bracket";
      }
      
      // Fallback for any other character
      stream.next();
      return null;
    }
  };
});

// Register the mode with a MIME type
CodeMirror.defineMIME("text/x-flex", "flex"); 