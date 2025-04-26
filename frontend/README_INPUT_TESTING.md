# Flex Input Testing Guide

## Overview

The Flex language provides two input functions: `da5l()` and `input()`. Both functions allow programs to read input from the user. When running Flex programs in the online compiler, these functions will prompt the user for input through the web interface.

This document provides instructions for testing and using the input functionality in the Flex Web Compiler.

## Using the Test Page

### Accessing the Test Page

1. Navigate to the `/test_input.html` page
2. The test page includes a code editor, execution controls, and an input field

### Test Page Layout

- **Editor**: Write your Flex code here
- **Run Button**: Execute the current code
- **Output Area**: View program output and input prompts 
- **Input Field**: Appears when the program is waiting for input
- **Input Queue**: Pre-load inputs to be used when the program requests them

### Basic Testing Steps

1. Enter Flex code using the `da5l()` or `input()` function in the code editor
2. Click the "Run" button
3. When the program reaches the input function, the input field will be highlighted
4. Enter your input in the field and press Enter or click "Submit"
5. The program will continue execution with your input

## Sample Test Programs

### Basic Input Example
```flex
print("Welcome to Flex input test!")
print("Please enter your name:")
name = da5l()  // or name = input()
print("Hello, {name}!")
```

### Multiple Inputs
```flex
print("Enter your first name:")
first = input()  // Using input() function
print("Enter your last name:")
last = da5l()   // Using da5l() function
print("Hello, {first} {last}!")
```

## Troubleshooting

### WebSocket Connection Issues
1. **No WebSocket Connection**:
   - Check that your browser supports WebSockets
   - Verify that the server is running correctly

2. **Input Request Not Detected**:
   - Verify that your code includes a call to `da5l()` or `input()`
   - Ensure the code is executed and reaches the input function
   - Verify that the server logs show "__FLEX_INPUT_REQUEST__" messages

3. **Input Not Being Processed**:
   - Check that you're submitting input through the designated input field
   - Verify that the input is being sent to the Python process

## Server Logs

To check the server logs for input-related issues:
```
pm2 logs flex-web-compiler --lines 50
```

Look for messages containing "__FLEX_INPUT_REQUEST__" which indicate input requests from the Flex program. 