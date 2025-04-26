# Flex Programming Language Reference

## Introduction

Flex is a dynamic, interpreted programming language designed for simplicity and learning. It supports multiple syntax styles, including English and Arabic-inspired keywords, making it accessible to a diverse range of learners.

## Basic Syntax

### Comments

```
# This is a comment in Flex
```

### Output

```
print("Hello, World!");  # English style
etb3("Hello, World!");   # Arabic-inspired style
```

### Variables and Assignment

Variables in Flex are dynamically typed and don't require explicit declaration:

```
name = "John"
age = 25
is_student = true
```

### Data Types

Flex supports the following data types:

- **Numbers**: `42`, `3.14`
- **Strings**: `"Hello"`, `'World'`
- **Booleans**: `true`, `false`
- **Null**: `null`
- **Arrays**: `[1, 2, 3, 4]`

### Operators

#### Arithmetic Operators
- Addition: `+`
- Subtraction: `-`
- Multiplication: `*`
- Division: `/`
- Modulo: `%`

#### Comparison Operators
- Equal to: `==`
- Not equal to: `!=`
- Greater than: `>`
- Less than: `<`
- Greater than or equal to: `>=`
- Less than or equal to: `<=`

#### Logical Operators
- And: `&&`
- Or: `||`
- Not: `!`

### Input

```
name = scan();     # English style
name = da5l();     # Arabic-inspired style
name = d5l();      # Shortened Arabic-inspired style
```

## Control Flow

### Conditionals

```
if (condition) {
    # Code to execute if condition is true
} else if (another_condition) {
    # Code to execute if another_condition is true
} else {
    # Code to execute if no conditions are true
}
```

### Loops

#### While Loop

```
while (condition) {
    # Code to execute while condition is true
}
```

#### For Loop

```
for (initializer; condition; increment) {
    # Code to execute for each iteration
}
```

Example:

```
for (i = 0; i < 5; i = i + 1) {
    etb3("Iteration: " + i);
}
```

## Functions

### Function Declaration

```
function function_name(parameter1, parameter2) {
    # Function body
    return value;  # Optional return statement
}
```

### Function Calls

```
result = function_name(argument1, argument2);
```

## Arrays

### Array Creation

```
numbers = [1, 2, 3, 4, 5];
names = ["Alice", "Bob", "Charlie"];
mixed = [1, "two", true, null];
```

### Array Access

```
first_number = numbers[0];  # Arrays are zero-indexed
```

### Array Methods

```
# Get array length
length = numbers.length;

# Add element to the end
numbers[numbers.length] = 6;
```

## Standard Library Functions

### Input/Output

- `print(value)` - Print value without a newline
- `etb3(value)` - Print value with a newline
- `scan()` / `da5l()` / `d5l()` - Read input from the user
- `clearScreen()` - Clear the terminal screen

### Math Functions

- `abs(number)` - Absolute value
- `round(number)` - Round to nearest integer
- `floor(number)` - Round down to nearest integer
- `ceil(number)` - Round up to nearest integer
- `pow(base, exponent)` - Power function
- `sqrt(number)` - Square root
- `random()` - Random number between 0 and 1
- `sin(angle)` - Sine function (angle in radians)
- `cos(angle)` - Cosine function (angle in radians)
- `tan(angle)` - Tangent function (angle in radians)
- `min(a, b, ...)` - Minimum value
- `max(a, b, ...)` - Maximum value

### String Functions

- `length(string)` - String length
- `toUpper(string)` - Convert to uppercase
- `toLower(string)` - Convert to lowercase
- `substring(string, start, end)` - Get substring
- `replace(string, search, replace)` - Replace all occurrences
- `split(string, delimiter)` - Split string into array
- `trim(string)` - Remove whitespace from start and end
- `startsWith(string, prefix)` - Check if string starts with prefix
- `endsWith(string, suffix)` - Check if string ends with suffix
- `contains(string, substring)` - Check if string contains substring
- `indexOf(string, substring)` - Get index of substring
- `repeat(string, count)` - Repeat string n times
- `padLeft(string, length, padString)` - Pad string from left
- `padRight(string, length, padString)` - Pad string from right

## Examples

### Hello World

```
etb3("Hello, World!");
```

### Temperature Converter

```
etb3("Temperature Converter");
etb3("Enter temperature in Celsius:");
celsius = da5l();
celsius = 1 * celsius;  # Convert to number

fahrenheit = (celsius * 9/5) + 32;

etb3(celsius + "°C is equal to " + fahrenheit + "°F");
```

### Fibonacci Sequence

```
function fibonacci(n) {
    if (n <= 1) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

etb3("Fibonacci Sequence Calculator");
etb3("Enter a number:");
num = da5l();
num = 1 * num;  # Convert to number

etb3("The " + num + "th Fibonacci number is: " + fibonacci(num));
```

### Array Manipulation

```
# Create an array
numbers = [10, 20, 30, 40, 50];
etb3("Original array: " + numbers);

# Sum of array elements
sum = 0;
for (i = 0; i < numbers.length; i = i + 1) {
    sum = sum + numbers[i];
}

etb3("Sum of all elements: " + sum);
etb3("Average of all elements: " + (sum / numbers.length));
```

## Error Handling

Flex provides useful error messages when encountering issues:

- **Syntax Errors**: When code doesn't follow the correct syntax
- **Runtime Errors**: When errors occur during program execution
- **Type Errors**: When operations are performed with incompatible types

## Best Practices

1. **Use meaningful variable names**: Choose descriptive names for your variables and functions.
2. **Add comments**: Document your code with comments to explain complex logic.
3. **Indent your code**: Use consistent indentation for better readability.
4. **Break down complex problems**: Use functions to break down complex problems into smaller, manageable parts.
5. **Test your code**: Test your code with different inputs to ensure it works correctly.
