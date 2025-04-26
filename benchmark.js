const http = require('http');
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/execute',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const data = JSON.stringify({
  code: 'print(\"Hello, Flex!\")'
});

console.log('Running 5 concurrent requests to test performance...');
const startTime = Date.now();

for (let i = 0; i < 5; i++) {
  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    res.on('end', () => {
      console.log(`Request ${i+1} completed with status: ${res.statusCode}`);
      if (i === 4) {
        const totalTime = Date.now() - startTime;
        console.log(`All requests completed in ${totalTime}ms`);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`Problem with request ${i+1}: ${e.message}`);
  });
  
  req.write(data);
  req.end();
} 