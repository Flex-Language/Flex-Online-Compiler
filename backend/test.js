const assert = require('assert');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Basic test suite for Flex Online Compiler API
async function runTests() {
  console.log('Starting API tests...');
  const API_URL = 'http://localhost:3000';
  
  try {
    // Test 1: API is accessible
    console.log('Test 1: Checking if API is accessible...');
    await axios.get(API_URL);
    console.log('✅ API is accessible');
    
    // Test 2: Code execution
    console.log('Test 2: Testing code execution...');
    const simpleCode = 'print("Hello, Flex!")';
    const response = await axios.post(`${API_URL}/api/execute`, { code: simpleCode });
    assert.ok(response.data.output.includes('Hello, Flex!'), 'Code execution failed');
    console.log('✅ Code execution works');
    
    // Test 3: Examples endpoint
    console.log('Test 3: Testing examples endpoint...');
    const examplesResponse = await axios.get(`${API_URL}/api/examples`);
    assert.ok(Array.isArray(examplesResponse.data), 'Examples endpoint failed');
    console.log('✅ Examples endpoint works');
    
    // Test 4: Documentation endpoint
    console.log('Test 4: Testing documentation endpoint...');
    const docResponse = await axios.get(`${API_URL}/api/docs/README`);
    assert.ok(docResponse.data.content, 'Documentation endpoint failed');
    console.log('✅ Documentation endpoint works');
    
    console.log('All tests passed! ✅');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the tests
runTests(); 