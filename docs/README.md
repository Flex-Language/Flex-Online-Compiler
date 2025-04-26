# Flex Language Documentation

Flex is a modern programming language designed for simplicity and flexibility. This documentation will help you get started with Flex and understand its key features.

## Getting Started

### Installation

1. **Prerequisites:**
   - Python 3.6 or higher
   - Git

2. **Setup:**
   - Clone the Flex repository:
     ```bash
     git clone <repository-url>
     cd Flex
     ```
   - No additional installation is needed - Flex runs as a Python application

3. **Running the Web Compiler:**
   - The easiest way to get started is using the Flex Web Compiler you're currently using
   - Alternatively, you can run Flex programs from the command line:
     ```bash
     # On Linux/macOS
     ./flex.sh your_program.txt
     
     # On Windows
     flex.bat your_program.txt
     ```

### Your First Flex Program

Flex syntax is similar to Python but with some unique features:

```
// This is a comment in Flex

// Variables are declared without type annotations
x = 10
y = "Hello"
z = true

// Printing values
print("The value of x is {x}")

// Input handling with da5l()
name = da5l() // Reads a line of input from the user
print("Hello, {name}!")

// Functions 
function add(a, b) {
  return a + b
}

result = add(5, 10)
print("5 + 10 = {result}")
```

### Code Structure

A typical Flex program consists of:

1. **Variable declarations** - Define your data
2. **Function definitions** - Create reusable code blocks
3. **Execution statements** - Perform operations and produce output

### Editor Features

The Flex Web Compiler provides:

- Syntax highlighting
- Code execution
- Interactive input handling
- Example programs to learn from
- Documentation access
- Real-time error messages

## Key Features

### Input Handling

Flex provides the `da5l()` function to read input from the user. It pauses program execution and waits for user input.

Example:
```
print("Enter your name:")
name = da5l()
print("Hello, {name}!")
```

### String Interpolation

Flex supports string interpolation using curly braces `{}`:

```
x = 10
y = 20
print("The sum of {x} and {y} is {x + y}")
```

### Control Flow

Flex supports standard control flow statements:

```
// Conditional statements
if (x > 10) {
  print("x is greater than 10")
} else if (x == 10) {
  print("x is equal to 10")
} else {
  print("x is less than 10")
}

// Loops
for (i = 0; i < 5; i++) {
  print("Loop iteration: {i}")
}
```

### Data Types

Flex supports these primary data types:

```
// Integer
rakm num = 42

// Float 
pi = 3.14159

// String
message = "Hello, Flex!"

// Boolean
is_valid = true

// List/Array
dorg items = [1, 2, 3, "mixed types allowed"]
```

### Functions

Functions are declared with the `sndo2` keyword and return values with `rg3`:

```
sndo2 calculate_area(width, height) {
  area = width * height
  rg3 area
}

rectangle_area = calculate_area(5, 10)
print("The area is {rectangle_area}")
```

## Additional Resources

- **Examples Tab**: Browse example programs to see Flex in action
- **Quick Reference**: Concise syntax guide for quick lookups
- **Tutorial**: Step-by-step guide to learning Flex programming
- **Full Documentation**: Complete language specification

For more help, check out the other sections in the Documentation tab. Happy coding! 