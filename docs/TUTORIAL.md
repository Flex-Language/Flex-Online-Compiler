# Flex Programming Language Tutorial

This tutorial will guide you through creating your first Flex program, from installation to writing and running code.

## Table of Contents

1. [Installation](#installation)
2. [Hello World](#hello-world)
3. [Variables and Data Types](#variables-and-data-types)
4. [Control Structures](#control-structures)
5. [Functions](#functions)
6. [Working with Lists](#working-with-lists)
7. [File Import](#file-import)
8. [Using AI-Assisted Error Handling](#using-ai-assisted-error-handling)
9. [Next Steps](#next-steps)

## Installation

### Prerequisites

- Python 3.6 or higher
- For AI features (optional):
  - [LM Studio](https://lmstudio.ai/) with Qwen2.5 7B Instruct 1M model
  - OpenAI API key (optional alternative)

### Setup Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Flex
   ```

2. For AI features (optional):
   - Install LM Studio
   - Download the Qwen2.5 7B Instruct 1M model
   - Start LM Studio and enable the API server

## Hello World

Let's create your first Flex program:

1. Create a new file named `hello.txt` in the Flex directory
2. Add the following code:
   ```
   print("Hello, World!")
   ```
3. Run the program:
   - On Unix/Linux/macOS:
     ```bash
     ./flex.sh hello.txt
     ```
   - On Windows:
     ```bash
     flex.bat hello.txt
     ```

You should see `Hello, World!` printed to the console.

## Variables and Data Types

Let's explore variables and data types in Flex:

1. Create a new file named `variables.txt`
2. Add the following code:
   ```
   # Integer variable with type annotation
   rakm age = 25
   print("Age: {age}")
   
   # String variable (type inferred)
   name = "John Doe"
   print("Name: {name}")
   
   # Boolean variable
   is_student = true
   print("Is student: {is_student}")
   
   # Float variable
   height = 1.75
   print("Height: {height} meters")
   
   # List/array
   dorg hobbies = ["reading", "coding", "gaming"]
   print("First hobby: {hobbies[0]}")
   ```
3. Run the program:
   ```bash
   ./flex.sh variables.txt
   ```

This program demonstrates different variable types in Flex. Notice how you can use string interpolation with `{variable_name}` inside strings.

## Control Structures

Now let's explore control structures:

1. Create a new file named `control.txt`
2. Add the following code:
   ```
   # If-else statement
   rakm age = 20
   
   if (age >= 18) {
       print("You are an adult")
   } else {
       print("You are a minor")
   }
   
   # For loop
   print("Counting from 1 to 5:")
   for (i=1; i<=5; i++) {
       print("Number {i}")
   }
   
   # While loop
   print("Countdown:")
   rakm count = 5
   while (count > 0) {
       print("Count: {count}")
       count--
   }
   
   # Break statement
   print("Using break:")
   for (i=1; i<=10; i++) {
       if (i == 6) {
           print("Breaking at 6")
           break
       }
       print("Loop number {i}")
   }
   ```
3. Run the program:
   ```bash
   ./flex.sh control.txt
   ```

This program demonstrates conditional statements and loops in Flex.

## Functions

Let's create and use functions:

1. Create a new file named `functions.txt`
2. Add the following code:
   ```
   # Simple function with no parameters
   sndo2 greet() {
       print("Hello, there!")
   }
   
   # Call the function
   greet()
   
   # Function with parameters
   sndo2 personalized_greeting(name) {
       print("Hello, {name}!")
   }
   
   # Call the function with an argument
   personalized_greeting("Alice")
   
   # Function with return value
   sndo2 add(a, b) {
       rg3 a + b
   }
   
   # Call the function and store the result
   sum = add(5, 3)
   print("5 + 3 = {sum}")
   
   # Function with typed parameters
   sndo2 multiply(int x, int y) {
       rg3 x * y
   }
   
   # Call the function
   product = multiply(4, 7)
   print("4 * 7 = {product}")
   
   # Recursive function
   sndo2 factorial(n) {
       if (n <= 1) {
           rg3 1
       }
       rg3 n * factorial(n - 1)
   }
   
   # Call the recursive function
   result = factorial(5)
   print("Factorial of 5 is {result}")
   ```
3. Run the program:
   ```bash
   ./flex.sh functions.txt
   ```

This program demonstrates how to define and call functions in Flex, including functions with parameters, return values, and recursion.

## Working with Lists

Let's explore working with lists:

1. Create a new file named `lists.txt`
2. Add the following code:
   ```
   # Create a list
   dorg numbers = [10, 20, 30, 40, 50]
   
   # Access elements
   print("First element: {numbers[0]}")
   print("Third element: {numbers[2]}")
   
   # Modify elements
   numbers[1] = 25
   print("Modified list: {numbers}")
   
   # Loop through the list
   print("All numbers:")
   for (i=0; i<5; i++) {
       print("numbers[{i}] = {numbers[i]}")
   }
   
   # Calculate sum of list elements
   sum = 0
   for (i=0; i<5; i++) {
       sum = sum + numbers[i]
   }
   print("Sum of all numbers: {sum}")
   
   # Find maximum value
   sndo2 find_max(list) {
       max = list[0]
       for (i=1; i<5; i++) {
           if (list[i] > max) {
               max = list[i]
           }
       }
       rg3 max
   }
   
   max_value = find_max(numbers)
   print("Maximum value: {max_value}")
   
   # Mixed type list
   dorg mixed = ["hello", 42, true, 3.14]
   print("Mixed list: {mixed}")
   ```
3. Run the program:
   ```bash
   ./flex.sh lists.txt
   ```

## File Import

Flex allows you to import code from other files:

1. Create two files:
   
   `math_utils.txt`:
   ```
   sndo2 add(a, b) {
       rg3 a + b
   }
   
   sndo2 subtract(a, b) {
       rg3 a - b
   }
   
   sndo2 multiply(a, b) {
       rg3 a * b
   }
   
   sndo2 divide(a, b) {
       if (b == 0) {
           print("Error: Division by zero!")
           rg3 0
       }
       rg3 a / b
   }
   ```
   
   `calculator.txt`:
   ```
   # Import the file containing math functions
   geeb "math_utils.txt"
   
   # Now we can use the imported functions
   x = 10
   y = 5
   
   print("{x} + {y} = {add(x, y)}")
   print("{x} - {y} = {subtract(x, y)}")
   print("{x} * {y} = {multiply(x, y)}")
   print("{x} / {y} = {divide(x, y)}")
   
   # Test division by zero
   print("10 / 0 = {divide(10, 0)}")
   ```

2. Run the calculator program:
   ```bash
   ./flex.sh calculator.txt
   ```

This demonstrates how to organize your code across multiple files by importing functionality.

## Using AI-Assisted Error Handling

Flex includes AI-assisted error handling to help debug your code:

1. Create a file with an intentional error:
   
   `error_example.txt`:
   ```
   # This has a syntax error - missing closing brace
   if (true) {
       print("This will cause an error"
   
   # This has a logical error - division by zero
   result = 10 / 0
   print("Result: {result}")
   ```

2. Run with AI assistance:
   ```bash
   # Unix/Linux/macOS
   export USE_AI=true
   ./flex.sh error_example.txt
   
   # Windows
   set USE_AI=true
   flex.bat error_example.txt
   ```

The AI will identify and explain the errors and suggest fixes.

## Next Steps

Now that you've completed this tutorial, you can:

1. Explore the Examples section for more complex programs
2. Read the Full Documentation for detailed language specifications
3. Create your own Flex programs
4. Contribute to the Flex language development

Happy coding with Flex! 