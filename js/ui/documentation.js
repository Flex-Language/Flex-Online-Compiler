/**
 * Documentation UI component for Flex Web Interpreter
 * Provides language reference and user guide
 */
class FlexDocumentation {
  constructor() {
    // Initialize documentation modal
    this.docModal = document.getElementById('documentation-modal');
    
    if (!this.docModal) {
      this.createDocumentationModal();
    }
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load documentation content
    this.loadDocumentationContent();
  }
  
  /**
   * Create the documentation modal
   */
  createDocumentationModal() {
    this.docModal = document.createElement('div');
    this.docModal.id = 'documentation-modal';
    this.docModal.className = 'modal';
    
    this.docModal.innerHTML = `
      <div class="modal-content documentation-content">
        <div class="modal-header">
          <h2>Flex Documentation</h2>
          <span class="close">&times;</span>
        </div>
        <div class="doc-sidebar">
          <div class="search-container">
            <input type="text" id="doc-search" placeholder="Search documentation...">
          </div>
          <div class="doc-nav">
            <h3>Contents</h3>
            <ul id="doc-nav-list">
              <li><a href="#introduction" class="active">Introduction</a></li>
              <li><a href="#getting-started">Getting Started</a></li>
              <li><a href="#language-basics">Language Basics</a></li>
              <li><a href="#control-flow">Control Flow</a></li>
              <li><a href="#functions">Functions</a></li>
              <li><a href="#arrays">Arrays</a></li>
              <li><a href="#standard-library">Standard Library</a></li>
              <li><a href="#examples">Examples</a></li>
              <li><a href="#debugging">Debugging</a></li>
              <li><a href="#best-practices">Best Practices</a></li>
            </ul>
          </div>
        </div>
        <div class="doc-content">
          <div id="doc-content-container">
            <!-- Documentation content will be loaded here -->
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.docModal);
  }
  
  /**
   * Set up event listeners for documentation
   */
  setupEventListeners() {
    // Close button
    const closeButton = this.docModal.querySelector('.close');
    closeButton.addEventListener('click', () => {
      this.hideDocumentation();
    });
    
    // Navigation links
    const navLinks = this.docModal.querySelectorAll('#doc-nav-list a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Get the section id from the href
        const sectionId = link.getAttribute('href').substring(1);
        
        // Scroll to the section
        const section = document.getElementById(sectionId);
        if (section) {
          const container = document.getElementById('doc-content-container');
          container.scrollTop = section.offsetTop - 20;
        }
      });
    });
    
    // Search functionality
    const searchInput = document.getElementById('doc-search');
    searchInput.addEventListener('input', () => {
      this.searchDocumentation(searchInput.value);
    });
    
    // Click on documentation button
    const docButton = document.getElementById('documentation-button');
    if (docButton) {
      docButton.addEventListener('click', () => {
        this.showDocumentation();
      });
    }
    
    // Close when clicking outside
    window.addEventListener('click', (event) => {
      if (event.target === this.docModal) {
        this.hideDocumentation();
      }
    });
  }
  
  /**
   * Load documentation content
   */
  loadDocumentationContent() {
    const contentContainer = document.getElementById('doc-content-container');
    
    if (!contentContainer) {
      return;
    }
    
    contentContainer.innerHTML = `
      <section id="introduction">
        <h2>Introduction to Flex</h2>
        <p>Flex is a dynamic, interpreted programming language designed for simplicity and learning. It supports multiple syntax styles, including English and Arabic-inspired keywords, making it accessible to a diverse range of learners.</p>
        <p>This web interpreter allows you to write, run, and debug Flex code directly in your browser without any need for installation or server-side components.</p>
      </section>
      
      <section id="getting-started">
        <h2>Getting Started</h2>
        <p>To start using the Flex Web Interpreter:</p>
        <ol>
          <li>Write your Flex code in the editor panel on the left</li>
          <li>Click the "Run" button (or press Ctrl+Enter) to execute your code</li>
          <li>View the output in the terminal panel on the right</li>
          <li>Use the "Save" button to save your program for later use</li>
        </ol>
        <h3>Your First Flex Program</h3>
        <pre><code># My first Flex program
etb3("Hello, World!");
etb3("What is your name?");
name = da5l();
etb3("Nice to meet you, " + name + "!");</code></pre>
      </section>
      
      <section id="language-basics">
        <h2>Language Basics</h2>
        
        <h3>Comments</h3>
        <p>Comments in Flex start with the # symbol:</p>
        <pre><code># This is a comment</code></pre>
        
        <h3>Output</h3>
        <p>Flex provides several ways to display output:</p>
        <pre><code>print("This prints without a newline");
etb3("This prints with a newline");</code></pre>
        
        <h3>Input</h3>
        <p>To get input from the user:</p>
        <pre><code>name = scan();    # English style
name = da5l();    # Arabic-inspired style
name = d5l();     # Shortened Arabic style</code></pre>
        
        <h3>Variables</h3>
        <p>Variables in Flex are dynamically typed and don't require explicit declaration:</p>
        <pre><code>name = "John"    # String
age = 25         # Number
is_student = true  # Boolean</code></pre>
        
        <h3>Data Types</h3>
        <ul>
          <li><strong>Numbers:</strong> <code>42</code>, <code>3.14</code></li>
          <li><strong>Strings:</strong> <code>"Hello"</code>, <code>'World'</code></li>
          <li><strong>Booleans:</strong> <code>true</code>, <code>false</code></li>
          <li><strong>Null:</strong> <code>null</code></li>
          <li><strong>Arrays:</strong> <code>[1, 2, 3, 4]</code></li>
        </ul>
        
        <h3>Operators</h3>
        <h4>Arithmetic Operators</h4>
        <ul>
          <li>Addition: <code>+</code></li>
          <li>Subtraction: <code>-</code></li>
          <li>Multiplication: <code>*</code></li>
          <li>Division: <code>/</code></li>
          <li>Modulo: <code>%</code></li>
        </ul>
        
        <h4>Comparison Operators</h4>
        <ul>
          <li>Equal to: <code>==</code></li>
          <li>Not equal to: <code>!=</code></li>
          <li>Greater than: <code>></code></li>
          <li>Less than: <code><</code></li>
          <li>Greater than or equal to: <code>>=</code></li>
          <li>Less than or equal to: <code><=</code></li>
        </ul>
        
        <h4>Logical Operators</h4>
        <ul>
          <li>And: <code>&&</code></li>
          <li>Or: <code>||</code></li>
          <li>Not: <code>!</code></li>
        </ul>
      </section>
      
      <section id="control-flow">
        <h2>Control Flow</h2>
        
        <h3>Conditionals</h3>
        <pre><code>if (condition) {
    # Code to execute if condition is true
} else if (another_condition) {
    # Code to execute if another_condition is true
} else {
    # Code to execute if no conditions are true
}</code></pre>
        
        <h3>While Loop</h3>
        <pre><code>while (condition) {
    # Code to execute while condition is true
}</code></pre>
        
        <h3>For Loop</h3>
        <pre><code>for (initializer; condition; increment) {
    # Code to execute for each iteration
}

# Example:
for (i = 0; i < 5; i = i + 1) {
    etb3("Iteration: " + i);
}</code></pre>
      </section>
      
      <section id="functions">
        <h2>Functions</h2>
        
        <h3>Function Declaration</h3>
        <pre><code>function function_name(parameter1, parameter2) {
    # Function body
    return value;  # Optional return statement
}</code></pre>
        
        <h3>Function Call</h3>
        <pre><code>result = function_name(argument1, argument2);</code></pre>
        
        <h3>Example</h3>
        <pre><code>function add(a, b) {
    return a + b;
}

sum = add(5, 3);
etb3("The sum is: " + sum);</code></pre>
      </section>
      
      <section id="arrays">
        <h2>Arrays</h2>
        
        <h3>Array Creation</h3>
        <pre><code>numbers = [1, 2, 3, 4, 5];
names = ["Alice", "Bob", "Charlie"];
mixed = [1, "two", true, null];</code></pre>
        
        <h3>Array Access</h3>
        <pre><code>first_number = numbers[0];  # Arrays are zero-indexed</code></pre>
        
        <h3>Array Properties and Methods</h3>
        <pre><code># Get array length
length = numbers.length;

# Add element to the end
numbers[numbers.length] = 6;</code></pre>
        
        <h3>Array Iteration</h3>
        <pre><code>for (i = 0; i < numbers.length; i = i + 1) {
    etb3("Element at index " + i + ": " + numbers[i]);
}</code></pre>
      </section>
      
      <section id="standard-library">
        <h2>Standard Library</h2>
        
        <h3>Input/Output Functions</h3>
        <ul>
          <li><code>print(value)</code> - Print value without a newline</li>
          <li><code>etb3(value)</code> - Print value with a newline</li>
          <li><code>scan()</code> / <code>da5l()</code> / <code>d5l()</code> - Read input from the user</li>
          <li><code>clearScreen()</code> - Clear the terminal screen</li>
        </ul>
        
        <h3>Math Functions</h3>
        <ul>
          <li><code>abs(number)</code> - Absolute value</li>
          <li><code>round(number)</code> - Round to nearest integer</li>
          <li><code>floor(number)</code> - Round down to nearest integer</li>
          <li><code>ceil(number)</code> - Round up to nearest integer</li>
          <li><code>pow(base, exponent)</code> - Power function</li>
          <li><code>sqrt(number)</code> - Square root</li>
          <li><code>random()</code> - Random number between 0 and 1</li>
          <li><code>sin(angle)</code> - Sine function (angle in radians)</li>
          <li><code>cos(angle)</code> - Cosine function (angle in radians)</li>
          <li><code>tan(angle)</code> - Tangent function (angle in radians)</li>
          <li><code>min(a, b, ...)</code> - Minimum value</li>
          <li><code>max(a, b, ...)</code> - Maximum value</li>
        </ul>
        
        <h3>String Functions</h3>
        <ul>
          <li><code>length(string)</code> - String length</li>
          <li><code>toUpper(string)</code> - Convert to uppercase</li>
          <li><code>toLower(string)</code> - Convert to lowercase</li>
          <li><code>substring(string, start, end)</code> - Get substring</li>
          <li><code>replace(string, search, replace)</code> - Replace all occurrences</li>
          <li><code>split(string, delimiter)</code> - Split string into array</li>
          <li><code>trim(string)</code> - Remove whitespace from start and end</li>
          <li><code>startsWith(string, prefix)</code> - Check if string starts with prefix</li>
          <li><code>endsWith(string, suffix)</code> - Check if string ends with suffix</li>
          <li><code>contains(string, substring)</code> - Check if string contains substring</li>
          <li><code>indexOf(string, substring)</code> - Get index of substring</li>
          <li><code>repeat(string, count)</code> - Repeat string n times</li>
          <li><code>padLeft(string, length, padString)</code> - Pad string from left</li>
          <li><code>padRight(string, length, padString)</code> - Pad string from right</li>
        </ul>
      </section>
      
      <section id="examples">
        <h2>Examples</h2>
        
        <h3>Temperature Converter</h3>
        <pre><code>etb3("Temperature Converter");
etb3("Enter temperature in Celsius:");
celsius = da5l();
celsius = 1 * celsius;  # Convert to number

fahrenheit = (celsius * 9/5) + 32;

etb3(celsius + "°C is equal to " + fahrenheit + "°F");</code></pre>
        
        <h3>Fibonacci Sequence</h3>
        <pre><code>function fibonacci(n) {
    if (n <= 1) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

etb3("Fibonacci Sequence Calculator");
etb3("Enter a number:");
num = da5l();
num = 1 * num;  # Convert to number

etb3("The " + num + "th Fibonacci number is: " + fibonacci(num));</code></pre>
        
        <h3>Simple Calculator</h3>
        <pre><code>etb3("Simple Calculator");
etb3("Enter first number:");
num1 = 1 * da5l();  # Convert to number

etb3("Enter operation (+, -, *, /):");
op = da5l();

etb3("Enter second number:");
num2 = 1 * da5l();  # Convert to number

result = 0;
if (op == "+") {
    result = num1 + num2;
} else if (op == "-") {
    result = num1 - num2;
} else if (op == "*") {
    result = num1 * num2;
} else if (op == "/") {
    if (num2 == 0) {
        etb3("Error: Division by zero!");
        result = "undefined";
    } else {
        result = num1 / num2;
    }
} else {
    etb3("Error: Invalid operation!");
    result = "undefined";
}

etb3(num1 + " " + op + " " + num2 + " = " + result);</code></pre>
      </section>
      
      <section id="debugging">
        <h2>Debugging</h2>
        <p>The Flex Web Interpreter includes a built-in debugger to help you understand and fix issues in your code.</p>
        
        <h3>Starting the Debugger</h3>
        <p>Click the "Debug" button (or press Ctrl+Shift+Enter) to start debugging your code.</p>
        
        <h3>Setting Breakpoints</h3>
        <p>Click in the left gutter (next to line numbers) to set breakpoints. Execution will pause at these points.</p>
        
        <h3>Debugger Controls</h3>
        <ul>
          <li><strong>Step Into (F11):</strong> Execute the current line, stepping into any function calls</li>
          <li><strong>Step Over (F10):</strong> Execute the current line without stepping into function calls</li>
          <li><strong>Step Out (Shift+F11):</strong> Execute until the end of the current function</li>
          <li><strong>Continue (F5):</strong> Run until the next breakpoint or the end of the program</li>
          <li><strong>Stop (Shift+F5):</strong> Stop debugging</li>
        </ul>
        
        <h3>Inspecting Variables</h3>
        <p>The Variables panel shows the current value of all variables in scope during a debug session.</p>
        
        <h3>Call Stack</h3>
        <p>The Call Stack panel shows the execution path through your code, helping you understand how functions are called.</p>
      </section>
      
      <section id="best-practices">
        <h2>Best Practices</h2>
        <ol>
          <li><strong>Use meaningful variable names:</strong> Choose descriptive names that indicate what the variable represents.</li>
          <li><strong>Add comments:</strong> Document your code to explain complex logic or important details.</li>
          <li><strong>Indent properly:</strong> Use consistent indentation to make your code more readable.</li>
          <li><strong>Break down complex problems:</strong> Use functions to divide complex problems into smaller, manageable parts.</li>
          <li><strong>Test your code:</strong> Try your program with different inputs to ensure it works correctly.</li>
          <li><strong>Keep functions small:</strong> Each function should do one thing well.</li>
          <li><strong>Handle errors:</strong> Check for potential errors and provide meaningful messages.</li>
          <li><strong>Convert input to the right type:</strong> Remember to convert input to numbers when needed using: <code>value = 1 * value;</code></li>
          <li><strong>Use the debugger:</strong> When something isn't working, use the debugger to step through your code.</li>
        </ol>
      </section>
    `;
  }
  
  /**
   * Show documentation
   */
  showDocumentation() {
    if (this.docModal) {
      this.docModal.style.display = 'block';
    }
  }
  
  /**
   * Hide documentation
   */
  hideDocumentation() {
    if (this.docModal) {
      this.docModal.style.display = 'none';
    }
  }
  
  /**
   * Search documentation
   * @param {string} query - Search query
   */
  searchDocumentation(query) {
    query = query.toLowerCase();
    
    // Get all sections
    const sections = document.querySelectorAll('#doc-content-container section');
    const navLinks = document.querySelectorAll('#doc-nav-list a');
    
    if (query.trim() === '') {
      // Show all sections if query is empty
      sections.forEach(section => {
        section.style.display = 'block';
      });
      
      navLinks.forEach(link => {
        link.parentElement.style.display = 'list-item';
      });
      
      return;
    }
    
    // Hide sections that don't match the query
    sections.forEach(section => {
      const sectionText = section.textContent.toLowerCase();
      const sectionId = section.id;
      
      if (sectionText.includes(query)) {
        section.style.display = 'block';
        
        // Highlight the matching text
        this.highlightMatches(section, query);
        
        // Show corresponding nav link
        const navLink = document.querySelector(`#doc-nav-list a[href="#${sectionId}"]`);
        if (navLink) {
          navLink.parentElement.style.display = 'list-item';
        }
      } else {
        section.style.display = 'none';
        
        // Hide corresponding nav link
        const navLink = document.querySelector(`#doc-nav-list a[href="#${sectionId}"]`);
        if (navLink) {
          navLink.parentElement.style.display = 'none';
        }
      }
    });
  }
  
  /**
   * Highlight matching text in a section
   * @param {Element} section - Section element
   * @param {string} query - Search query
   */
  highlightMatches(section, query) {
    // Remove existing highlights
    const highlights = section.querySelectorAll('.highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
    });
    
    // Don't highlight text inside code blocks
    const codeBlocks = section.querySelectorAll('pre, code');
    codeBlocks.forEach(block => {
      block.classList.add('no-highlight');
    });
    
    // Find text nodes that aren't inside code blocks
    const textNodes = [];
    const walk = document.createTreeWalker(
      section,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: node => {
          if (node.parentNode.classList && node.parentNode.classList.contains('no-highlight')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    while (walk.nextNode()) {
      textNodes.push(walk.currentNode);
    }
    
    // Highlight matches in text nodes
    textNodes.forEach(textNode => {
      const parent = textNode.parentNode;
      const text = textNode.textContent;
      const lowerText = text.toLowerCase();
      
      let lastIndex = 0;
      let result = document.createDocumentFragment();
      let match;
      const regex = new RegExp(query, 'gi');
      
      while ((match = regex.exec(lowerText)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          result.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
        }
        
        // Add highlighted match
        const span = document.createElement('span');
        span.className = 'highlight';
        span.textContent = text.substring(match.index, regex.lastIndex);
        result.appendChild(span);
        
        lastIndex = regex.lastIndex;
      }
      
      // Add remaining text
      if (lastIndex < text.length) {
        result.appendChild(document.createTextNode(text.substring(lastIndex)));
      }
      
      // Replace original text with highlighted version
      if (lastIndex > 0) {
        parent.replaceChild(result, textNode);
      }
    });
    
    // Remove no-highlight class
    codeBlocks.forEach(block => {
      block.classList.remove('no-highlight');
    });
  }
}
