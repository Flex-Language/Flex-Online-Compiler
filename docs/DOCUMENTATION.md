# Flex Programming Language Documentation

## Introduction

Flex is a custom programming language designed to be simple yet powerful, with a syntax that combines elements from various popular programming languages. It features its own compiler, interpreter, and AI-assisted error handling capabilities.

This documentation provides a comprehensive guide to the Flex programming language, including its syntax, features, and how to use it effectively.

## Getting Started

### Installation

#### Prerequisites

- Python 3.6 or higher
- For AI features:
  - [LM Studio](https://lmstudio.ai/) with Qwen2.5 7B Instruct 1M model (for local AI)
  - OpenAI API key (optional, for using GPT-4o-mini)

#### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Flex
   ```

2. Set up AI capabilities (optional):
   - For local AI with Qwen2.5:
     - Install LM Studio
     - Download the Qwen2.5 7B Instruct 1M model
     - Start LM Studio and enable the API server
   - For OpenAI:
     - Set your OpenAI API key as an environment variable

### Running Your First Flex Program

1. Create a file named `hello.txt` with the following content:
   ```
   print("Hello, World!")
   ```

2. Run the program:
   - On Unix-like systems (macOS, Linux):
     ```bash
     ./flex.sh hello.txt
     ```
   - On Windows:
     ```bash
     flex.bat hello.txt
     ```

## Language Reference

### Data Types

Flex supports the following data types:

| Type | Keyword | Example | Description |
|------|---------|---------|-------------|
| Integer | `rakm` | `rakm x = 10` | Whole numbers |
| Float | `rakm` | `rakm y = 3.14` | Decimal numbers |
| String | N/A | `s = "Hello"` | Text enclosed in quotes |
| Boolean | N/A | `b = true` | `true` or `false` |
| List/Array | `dorg` | `dorg arr = [1, 2, 3]` | Collection of items |

### Variables

Variables in Flex can be declared with or without type annotations:

```
# With type annotation
rakm x = 10

# Without type annotation (type inferred)
y = 20
s = "Hello"
b = true
```

### Operators

#### Arithmetic Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `+` | Addition | `x + y` |
| `-` | Subtraction | `x - y` |
| `*` | Multiplication | `x * y` |
| `/` | Division | `x / y` |
| `%` | Modulus | `x % y` |
| `++` | Increment | `x++` |
| `--` | Decrement | `x--` |

#### Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `==` | Equal to | `x == y` |
| `!=` | Not equal to | `x != y` |
| `>` | Greater than | `x > y` |
| `<` | Less than | `x < y` |
| `>=` | Greater than or equal to | `x >= y` |
| `<=` | Less than or equal to | `x <= y` |

#### Logical Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `&&` | Logical AND | `x && y` |
| `||` | Logical OR | `x || y` |
| `!` | Logical NOT | `!x` |

### Control Structures

#### Conditional Statements

```
if (condition) {
    # code to execute if condition is true
} else if (another_condition) {
    # code to execute if another_condition is true
} else {
    # code to execute if all conditions are false
}
```

#### Loops

##### For Loop

```
for (initialization; condition; increment) {
    # code to execute in each iteration
}

# Example
for (i=0; i<5; i++) {
    print("i is {i}")
}
```

##### While Loop

```
while (condition) {
    # code to execute while condition is true
}

# Example
i = 0
while (i < 5) {
    print("i is {i}")
    i++
}
```

##### Break and Continue

```
# Break example
for (i=0; i<10; i++) {
    if (i == 5) {
        break  # Exit the loop when i equals 5
    }
    print(i)
}

# Continue example
for (i=0; i<10; i++) {
    if (i % 2 == 0) {
        continue  # Skip even numbers
    }
    print(i)
}
```

### Functions

Functions in Flex are defined using the `sndo2` keyword:

```
sndo2 function_name(parameter1, parameter2) {
    # function body
    rg3 value  # return statement
}
```

#### Function Parameters

Functions can have typed or untyped parameters:

```
# With type annotations
sndo2 add(int a, int b) {
    rg3 a + b
}

# Without type annotations
sndo2 greet(name) {
    print("Hello, {name}!")
}
```

#### Return Values

Functions return values using the `rg3` keyword:

```
sndo2 multiply(a, b) {
    rg3 a * b
}

result = multiply(5, 3)  # result will be 15
```

### Input and Output

#### Output

```
# Print to console
print("Hello, World!")

# Print with line break
etb3("This is a line break")

# String interpolation
x = 10
print("The value of x is {x}")
```

#### Input

```
# Read input from user
name = da5l()
print("Hello, {name}!")
```

### File Operations

#### Importing Files

You can import other Flex files using the `geeb` keyword:

```
geeb "path/to/file.lx"
```

### Working with Lists

Lists (arrays) in Flex are created using the `dorg` keyword:

```
dorg numbers = [1, 2, 3, 4, 5]
```

#### Accessing and Modifying Elements

```
# Access element at index
first = numbers[0]  # Gets the first element

# Modify element
numbers[2] = 30  # Sets the third element to 30
```

#### List Operations

```
# Length of list (currently requires manual counting)
length = 5  # For a list with 5 elements

# Iterating through a list
for (i=0; i<5; i++) {
    print("Element {i}: {numbers[i]}")
}
```

### Error Handling

Flex provides AI-assisted error handling to help developers identify and fix issues in their code.

#### Enabling AI Error Handling

```bash
# Unix/Linux/macOS
export USE_AI=true
./flex.sh your_program.txt

# Windows
set USE_AI=true
flex.bat your_program.txt
```

#### Common Errors

| Error Type | Description | Example |
|------------|-------------|---------|
| SyntaxError | Invalid syntax | Missing closing bracket, invalid operator |
| NameError | Using undefined variable | Referencing a variable before declaration |
| TypeError | Operation on incompatible types | Adding a string and a number without conversion |
| ZeroDivisionError | Division by zero | `x / 0` |

## Advanced Features

### Recursion

Flex supports recursive function calls:

```
sndo2 factorial(n) {
    if (n <= 1) {
        rg3 1
    }
    rg3 n * factorial(n - 1)
}

result = factorial(5)  # 5! = 120
```

### Nested Functions

You can define and call functions within other functions:

```
sndo2 outer() {
    sndo2 inner() {
        print("Inner function called")
    }
    
    print("Outer function called")
    inner()  # Call the inner function
}

outer()
```

### String Manipulation

```
# String concatenation
first = "Hello"
last = "World"
full = first + " " + last  # "Hello World"

# String interpolation
name = "Alice"
greeting = "Hello, {name}!"  # "Hello, Alice!"
```

## Best Practices

### Code Organization

- Use meaningful variable and function names
- Comment your code to explain complex logic
- Group related functions together
- Use proper indentation for readability

### Performance Considerations

- Avoid deeply nested loops when possible
- Use appropriate data structures for your task
- Break down complex problems into smaller functions

### Debugging Tips

1. Enable AI assistance for error messages
2. Add print statements to track variable values
3. Check for common errors like off-by-one in loops
4. Test functions with simple inputs first

## Examples

See the Examples section of the Flex Web Compiler for complete, working programs that demonstrate various language features.

## Contributing to Flex

The Flex language is open to contributions and improvements. If you'd like to contribute:

1. Fork the repository
2. Make your changes
3. Submit a pull request with a clear description of your improvements

## License

Flex is released under the [MIT License](https://opensource.org/licenses/MIT). 