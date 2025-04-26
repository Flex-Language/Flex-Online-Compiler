/**
 * Test script for Flex input handling using direct child_process
 * This script tests input handling with more direct control over stdin/stdout
 */

const { spawn } = require('child_process');
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
const testFilePath = path.join(__dirname, 'temp', 'direct_test.lx');
fs.writeFileSync(testFilePath, testCode);

console.log('Test script started...');
console.log(`Test file created at: ${testFilePath}`);

// Spawn a Python process with the main.py script - explicitly set unbuffered mode
const pythonProcess = spawn('python3', [
  '-u', // Force unbuffered mode
  path.join(__dirname, '../../main.py'),
  testFilePath
], {
  stdio: ['pipe', 'pipe', 'pipe'] // Make stdin, stdout, stderr all pipes
});

// Flag to track if we've sent input
let inputSent = false;

// Listen for data on stdout
pythonProcess.stdout.on('data', (data) => {
  const output = data.toString();
  // Log each line separately for clearer debugging
  output.split('\n').forEach(line => {
    if (line.trim()) {
      console.log(`Python stdout: "${line.trim()}"`);
    }
  });
  
  // Check if this is an input request
  if (output.includes('__FLEX_INPUT_REQUEST__') && !inputSent) {
    console.log('Input request detected, sending test input...');
    // Send a test input plus a newline and flush
    inputSent = true;
    try {
      pythonProcess.stdin.write('Test User\n');
      console.log('Input sent: "Test User"');
    } catch (err) {
      console.error(`Error sending input: ${err.message}`);
    }
  }
});

// Listen for data on stderr
pythonProcess.stderr.on('data', (data) => {
  console.error(`Python stderr: ${data.toString().trim()}`);
});

// Handle process exit
pythonProcess.on('close', (code) => {
  console.log(`Python process exited with code ${code}`);
  
  // Clean up the test file
  try {
    fs.unlinkSync(testFilePath);
    console.log('Test file cleaned up');
  } catch (err) {
    console.error(`Error cleaning up test file: ${err.message}`);
  }
  process.exit(0);
});

// Handle errors
pythonProcess.on('error', (err) => {
  console.error(`Failed to start process: ${err.message}`);
  process.exit(1);
});

// Add a timeout to kill the process if it hangs
const timeoutId = setTimeout(() => {
  console.log('Timeout reached - process appears to be hanging');
  if (pythonProcess) {
    console.log('Killing Python process...');
    pythonProcess.kill();
  }
  process.exit(1);
}, 10000); // 10 second timeout

// Clean up on script exit
process.on('exit', () => {
  clearTimeout(timeoutId);
  if (pythonProcess) {
    try {
      pythonProcess.kill();
    } catch (err) {
      // Ignore kill errors on exit
    }
  }
}); 