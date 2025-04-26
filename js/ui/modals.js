/**
 * Modal UI components for Flex Web Interpreter
 * Handles examples, saving, and loading of programs
 */
class FlexModals {
  constructor() {
    // Initialize modal elements
    this.examplesModal = document.getElementById('examples-modal');
    this.openModal = document.getElementById('open-modal');
    this.saveModal = document.getElementById('save-modal');
    
    // Initialize lists
    this.examplesList = document.getElementById('examples-list');
    this.savedProgramsList = document.getElementById('saved-programs-list');
    
    // Initialize save form
    this.saveForm = document.getElementById('save-form');
    this.programNameInput = document.getElementById('program-name');
    
    // Get buttons
    this.examplesButton = document.getElementById('examples-button');
    this.openButton = document.getElementById('open-button');
    this.saveButton = document.getElementById('save-button');
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize examples
    this.initializeExamples();
  }
  
  /**
   * Set up event listeners for modals
   */
  setupEventListeners() {
    // Modal open buttons
    this.examplesButton.addEventListener('click', () => this.showModal(this.examplesModal));
    this.openButton.addEventListener('click', () => {
      this.loadSavedProgramsList();
      this.showModal(this.openModal);
    });
    this.saveButton.addEventListener('click', () => this.showModal(this.saveModal));
    
    // Modal close buttons (×)
    document.querySelectorAll('.close').forEach(closeButton => {
      closeButton.addEventListener('click', () => {
        const modal = closeButton.closest('.modal');
        this.hideModal(modal);
      });
    });
    
    // Close modals when clicking outside content
    window.addEventListener('click', event => {
      if (event.target.classList.contains('modal')) {
        this.hideModal(event.target);
      }
    });
    
    // Handle save form submission
    this.saveForm.addEventListener('submit', event => {
      event.preventDefault();
      this.saveProgram();
    });
    
    // Cancel save button
    this.saveForm.querySelector('.cancel').addEventListener('click', () => {
      this.hideModal(this.saveModal);
    });
  }
  
  /**
   * Initialize examples list
   */
  initializeExamples() {
    const examples = [
      {
        name: 'Hello World',
        description: 'A simple hello world program with user input.',
        code: `# Flex Hello World Example
etb3("Hello, World!");
etb3("What is your name?");
name = da5l();
etb3("Nice to meet you, " + name + "!");`
      },
      {
        name: 'Fibonacci',
        description: 'Calculate Fibonacci numbers.',
        code: `# Fibonacci Sequence Example
function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

etb3("Fibonacci Sequence Calculator");
etb3("Enter a number: ");
num = da5l();
num = 1 * num;  # Convert to number

etb3("Calculating fibonacci(" + num + ")...");
result = fibonacci(num);
etb3("The " + num + "th Fibonacci number is: " + result);`
      },
      {
        name: 'Calculator',
        description: 'A simple calculator program.',
        code: `# Simple Calculator Example
etb3("Simple Calculator");
etb3("Enter first number: ");
num1 = 1 * da5l();  # Convert to number

etb3("Enter operation (+, -, *, /): ");
op = da5l();

etb3("Enter second number: ");
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

etb3(num1 + " " + op + " " + num2 + " = " + result);`
      },
      {
        name: 'Array Operations',
        description: 'Demonstrates array operations in Flex.',
        code: `# Array Operations Example
etb3("Array Operations in Flex");

# Create an array
numbers = [10, 20, 30, 40, 50];
etb3("Original array: " + numbers);

# Access elements
etb3("First element: " + numbers[0]);
etb3("Last element: " + numbers[4]);

# Modify elements
numbers[2] = 35;
etb3("After modification: " + numbers);

# Array length
etb3("Array length: " + numbers.length);

# Sum of array elements
sum = 0;
for (i = 0; i < numbers.length; i = i + 1) {
  sum = sum + numbers[i];
}
etb3("Sum of all elements: " + sum);

# Average of array elements
average = sum / numbers.length;
etb3("Average of all elements: " + average);`
      },
      {
        name: 'Loops and Conditionals',
        description: 'Demonstrates loops and conditionals in Flex.',
        code: `# Loops and Conditionals Example
etb3("Loops and Conditionals in Flex");

# While loop example
etb3("\\nWhile Loop Example:");
count = 1;
while (count <= 5) {
  etb3("Count: " + count);
  count = count + 1;
}

# For loop example
etb3("\\nFor Loop Example:");
for (i = 5; i >= 1; i = i - 1) {
  etb3("Countdown: " + i);
}

# Nested conditionals
etb3("\\nEnter a number between 1 and 100: ");
num = 1 * da5l();  # Convert to number

etb3("Number categorization:");
if (num < 1 || num > 100) {
  etb3("Number is outside the valid range!");
} else {
  if (num < 50) {
    etb3("Number is in the lower half.");
    
    if (num % 2 == 0) {
      etb3("It's an even number.");
    } else {
      etb3("It's an odd number.");
    }
    
    if (num % 5 == 0) {
      etb3("It's divisible by 5.");
    }
  } else {
    etb3("Number is in the upper half.");
    
    if (num % 2 == 0) {
      etb3("It's an even number.");
    } else {
      etb3("It's an odd number.");
    }
    
    if (num % 10 == 0) {
      etb3("It's divisible by 10.");
    }
  }
}`
      }
    ];
    
    // Clear existing examples
    this.examplesList.innerHTML = '';
    
    // Add each example to the list
    examples.forEach(example => {
      const exampleElement = document.createElement('div');
      exampleElement.className = 'example-item';
      
      exampleElement.innerHTML = `
        <h3>${example.name}</h3>
        <p>${example.description}</p>
        <button class="load-example">Load Example</button>
      `;
      
      // Add click handler
      exampleElement.querySelector('.load-example').addEventListener('click', () => {
        // Update the editor with the example code
        window.flexEditor.setCode(example.code);
        
        // Close the modal
        this.hideModal(this.examplesModal);
        
        // Focus the editor
        window.flexEditor.focus();
      });
      
      this.examplesList.appendChild(exampleElement);
    });
  }
  
  /**
   * Load saved programs list from storage
   */
  loadSavedProgramsList() {
    // Clear existing list
    this.savedProgramsList.innerHTML = '';
    
    // Get saved programs from storage
    const savedPrograms = window.flexStorage.listPrograms();
    
    if (savedPrograms.length === 0) {
      const message = document.createElement('p');
      message.textContent = 'No saved programs found.';
      this.savedProgramsList.appendChild(message);
      return;
    }
    
    // Add each program to the list
    savedPrograms.forEach(program => {
      const programElement = document.createElement('div');
      programElement.className = 'saved-program-item';
      
      // Format date
      const formattedDate = new Date(program.lastModified).toLocaleString();
      
      programElement.innerHTML = `
        <div class="program-info">
          <h3>${program.name}</h3>
          <p>Last modified: ${formattedDate}</p>
        </div>
        <div class="program-actions">
          <button class="load-program" data-id="${program.id}">Load</button>
          <button class="delete-program" data-id="${program.id}">Delete</button>
        </div>
      `;
      
      // Add click handlers
      programElement.querySelector('.load-program').addEventListener('click', () => {
        this.loadProgram(program.id);
      });
      
      programElement.querySelector('.delete-program').addEventListener('click', () => {
        this.deleteProgram(program.id, programElement);
      });
      
      this.savedProgramsList.appendChild(programElement);
    });
  }
  
  /**
   * Save the current program
   */
  saveProgram() {
    const name = this.programNameInput.value.trim();
    
    if (!name) {
      alert('Please enter a program name.');
      return;
    }
    
    const code = window.flexEditor.getCode();
    
    // Save to storage
    window.flexStorage.saveProgram(name, code);
    
    // Reset form
    this.programNameInput.value = '';
    
    // Close modal
    this.hideModal(this.saveModal);
    
    // Show confirmation
    const terminal = window.flexTerminal;
    if (terminal) {
      terminal.writeLine(`Program "${name}" saved successfully.`, 'success');
    }
  }
  
  /**
   * Load a program by ID
   * @param {string} id - Program ID
   */
  loadProgram(id) {
    const program = window.flexStorage.loadProgram(id);
    
    if (program) {
      window.flexEditor.setCode(program.code);
      
      // Close modal
      this.hideModal(this.openModal);
      
      // Focus editor
      window.flexEditor.focus();
      
      // Show confirmation
      const terminal = window.flexTerminal;
      if (terminal) {
        terminal.writeLine(`Program "${program.name}" loaded.`, 'info');
      }
    } else {
      alert('Could not load the program.');
    }
  }
  
  /**
   * Delete a program
   * @param {string} id - Program ID
   * @param {HTMLElement} element - Program element to remove
   */
  deleteProgram(id, element) {
    if (confirm('Are you sure you want to delete this program?')) {
      const programName = window.flexStorage.deleteProgram(id);
      
      if (programName) {
        // Remove from DOM
        element.remove();
        
        // Show confirmation
        const terminal = window.flexTerminal;
        if (terminal) {
          terminal.writeLine(`Program "${programName}" deleted.`, 'info');
        }
        
        // If no programs left, show message
        if (this.savedProgramsList.children.length === 0) {
          const message = document.createElement('p');
          message.textContent = 'No saved programs found.';
          this.savedProgramsList.appendChild(message);
        }
      }
    }
  }
  
  /**
   * Show a modal
   * @param {HTMLElement} modal - Modal to show
   */
  showModal(modal) {
    if (modal) {
      modal.style.display = 'block';
      
      // Focus on input if it exists
      const input = modal.querySelector('input');
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    }
  }
  
  /**
   * Hide a modal
   * @param {HTMLElement} modal - Modal to hide
   */
  hideModal(modal) {
    if (modal) {
      modal.style.display = 'none';
    }
  }
}
