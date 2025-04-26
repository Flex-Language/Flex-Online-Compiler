/**
 * Test script for Flex input handling
 * This script tests the PythonShell input handling directly
 */

const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs');

// Create a simple Flex program that uses input
const testCode = `
print("This is a test of the input handling system.")
print("Please enter your name:")
name = da5l()
print("Hello, {name}! Nice to meet you.")
`;

// Write the test code to a file
const testFilePath = path.join(__dirname, 'temp', 'input_test_script.lx');
fs.writeFileSync(testFilePath, testCode);

// Set up options for python-shell
const options = {
  mode: 'text',
  pythonPath: 'python3',
  scriptPath: path.join(__dirname, '../../'),
  args: [testFilePath],
  pythonOptions: ['-u'], // Unbuffered output
  stderrParser: line => line,
  stdoutParser: line => line
};

// Run the Flex code through PythonShell
const pyshell = new PythonShell('main.py', options);

// Handle messages from the Python script
pyshell.on('message', (message) => {
  console.log(`Received message: ${message}`);
  
  // Check if this is an input request
  if (message === '__FLEX_INPUT_REQUEST__') {
    console.log('Input request detected, sending test input...');
    // Send a test input
    pyshell.send('Test User');
  }
});

// Handle errors
pyshell.on('stderr', (stderr) => {
  console.error(`Error: ${stderr}`);
});

// Handle end of execution
pyshell.end((err, code, signal) => {
  if (err) {
    console.error(`Execution failed: ${err.message}`);
  } else {
    console.log(`Execution completed with code ${code}`);
  }
  
  // Clean up the test file
  try {
    fs.unlinkSync(testFilePath);
    console.log('Test file cleaned up');
  } catch (err) {
    console.error(`Error cleaning up test file: ${err.message}`);
  }
});

console.log('Test script started...'); 