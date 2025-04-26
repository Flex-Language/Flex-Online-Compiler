# Flex Programming Language Quick Reference

## Running Flex Programs

### Unix/Linux/macOS
```bash
./flex.sh your_program.txt
```

### Windows
```bash
flex.bat your_program.txt
```

## Basic Syntax

### Variables
```
rakm x = 10                # Integer
y = 3.14                   # Float
s = "Hello, World!"        # String
b = true                   # Boolean
dorg arr = [1, 2, 3]       # Array/List
```

### Operators

#### Arithmetic
```
x + y      # Addition
x - y      # Subtraction
x * y      # Multiplication
x / y      # Division
x % y      # Modulus
x++        # Increment
x--        # Decrement
```

#### Comparison
```
x == y     # Equal to
x != y     # Not equal to
x > y      # Greater than
x < y      # Less than
x >= y     # Greater than or equal to
x <= y     # Less than or equal to
```

#### Logical
```
x && y     # Logical AND
x || y     # Logical OR
!x         # Logical NOT
```

### Control Structures

#### If Statement
```
if (condition) {
    # code
} else if (another_condition) {
    # code
} else {
    # code
}
```

#### For Loop
```
for (i=0; i<5; i++) {
    # code
}
```

#### While Loop
```
while (condition) {
    # code
}
```

#### Break and Continue
```
break       # Exit the loop
continue    # Skip to the next iteration
```

### Functions

#### Function Definition
```
sndo2 function_name(param1, param2) {
    # function body
    rg3 value  # return statement
}
```

#### Function Call
```
result = function_name(arg1, arg2)
```

### Input/Output

#### Output
```
print("Hello, World!")                # Print to console
etb3("This prints with a line break") # Print with line break
x = 10
print("Value: {x}")                   # String interpolation
```

#### Input
```
name = da5l()  # Read input from user
```

### File Operations

#### Import File
```
geeb "path/to/file.lx"
```

### Arrays/Lists

#### Create and Access
```
dorg arr = [1, 2, 3, 4, 5]
first = arr[0]     # Access first element (index 0)
arr[1] = 20        # Modify second element
```

## Common Patterns

### Function with Return Value
```
sndo2 add(a, b) {
    rg3 a + b
}
sum = add(5, 3)  # sum will be 8
```

### Conditional Logic
```
if (x > 10) {
    print("x is greater than 10")
} else {
    print("x is not greater than 10")
}
```

### Loop Through Array
```
dorg numbers = [1, 2, 3, 4, 5]
for (i=0; i<5; i++) {
    print("Number: {numbers[i]}")
}
```

### Read Input and Process
```
print("Enter your name:")
name = da5l()
print("Hello, {name}!")
```

## AI-Assisted Error Handling

### Enable AI
```bash
# Unix/Linux/macOS
export USE_AI=true
python main.py your_program.txt

# Windows
set USE_AI=true
python main.py your_program.txt
```

## Common Error Messages

| Error | Possible Cause |
|-------|----------------|
| `SyntaxError: Unexpected token` | Typo or incorrect syntax |
| `NameError: Variable not defined` | Using a variable before defining it |
| `TypeError: Incompatible types` | Trying to perform operations on incompatible types |
| `ZeroDivisionError` | Attempting to divide by zero | 