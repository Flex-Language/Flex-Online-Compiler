# Flex Online Compiler

A comprehensive web-based IDE and compiler for the Flex programming language.

## Features

- **Code Editor**: Feature-rich editor with syntax highlighting for Flex
- **Code Execution**: Run Flex code directly in the browser
- **Examples Gallery**: Collection of example Flex programs
- **Documentation**: Integrated language reference and tutorials
- **Code Sharing**: Share your code with others via URL
- **Local Storage**: Automatically saves your code in the browser
- **Keyboard Shortcuts**: Convenient keyboard shortcuts for common actions
- **Security**: Protected against malicious code execution
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
flex-online/
├── backend/             # Node.js backend
│   ├── server.js        # Main server code
│   ├── temp/            # Temporary files for code execution
│   └── package.json     # Node.js dependencies
├── frontend/            # Web frontend
│   ├── index.html       # Main HTML file
│   ├── css/             # Stylesheets
│   │   └── styles.css   # Main CSS file
│   └── js/              # JavaScript files
│       ├── main.js      # Main application logic
│       └── flex-mode.js # CodeMirror syntax highlighting for Flex
├── logs/                # Application logs
├── deploy.sh            # Deployment script for production
└── ecosystem.config.js  # PM2 configuration
```

## Technical Requirements

### Backend
- Node.js 14.x or higher
- Python 3.6 or higher (for Flex language execution)

### Frontend
- Modern web browser supporting ES6

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd flex-online
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```
PORT=3000
NODE_ENV=development
PYTHON_PATH=python3
FLEX_SRC_PATH=../../src
TEMP_DIR=./temp
LOG_LEVEL=info
```

Adjust paths as needed for your environment.

### 4. Create Necessary Directories

```bash
mkdir -p backend/temp logs
```

### 5. Start the Server (Development)

```bash
cd ..  # Return to project root
node backend/server.js
```

### 6. Start the Server (Production)

For quick production deployment, use the provided script:

```bash
./deploy.sh
```

Or manually:

```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start the application with PM2
pm2 start ecosystem.config.js --env production
```

## Production Deployment

For production deployment:

1. Use the provided deployment script: `./deploy.sh`
2. The script will:
   - Install dependencies
   - Create necessary directories
   - Set environment to production
   - Start the application with PM2
   - Configure PM2 to start on system boot

### Manual Production Setup

1. Set the `NODE_ENV` to `production` in your environment variables
2. Configure a reverse proxy (Nginx or Apache) to forward requests to your Node.js application
3. Set up SSL certificates for secure HTTPS connections
4. Consider using a process manager like PM2 for high availability

### Security Considerations

The application includes several security features:
- Helmet for securing HTTP headers
- XSS protection
- Rate limiting to prevent abuse
- Code execution timeout
- Code validation to prevent dangerous operations

## User Features

### Keyboard Shortcuts

- `Ctrl + Enter`: Run code
- `Ctrl + S`: Save code to browser storage
- `Tab`: Insert 4 spaces
- `Ctrl + /`: Toggle comment
- `Ctrl + Z`: Undo
- `Ctrl + Y`: Redo

### Code Sharing

Share your code with others by clicking the "Share" button, which generates a URL containing your code that can be sent to others.

### Local Storage

Your code is automatically saved to the browser's local storage so you can continue where you left off when you return.

## API Documentation

### Execute Flex Code
- **URL:** `/api/execute`
- **Method:** POST
- **Body:** `{ "code": "your Flex code here" }`
- **Response:** `{ "output": "program output", "stderr": "error output if any" }`

### Get Examples
- **URL:** `/api/examples`
- **Method:** GET
- **Response:** Array of example objects with name and content

### Get Documentation
- **URL:** `/api/docs/:docFile`
- **Method:** GET
- **Params:** `docFile` - name of the documentation file (e.g., README, QUICK_REFERENCE)
- **Response:** `{ "content": "markdown content" }`

## Project Roadmap

### Phase 1: MVP (Complete)
- Basic code editor and execution
- Examples and documentation integration

### Phase 2: Enhanced Features (Current)
- Code sharing and local storage
- Security improvements
- Keyboard shortcuts
- Error handling improvements

### Phase 3: Advanced Features (Planned)
- User accounts and saved programs
- More advanced code editor features (autocomplete, etc.)
- Debugging tools
- Collaborative editing
- Version control integration
- IDE plugins and extensions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Troubleshooting

### Common Issues

- **"Error connecting to server"**: Make sure the backend server is running and accessible
- **"Code execution timed out"**: Your code might be in an infinite loop or taking too long to execute
- **"Invalid code detected"**: The code might contain potentially unsafe operations

For more detailed troubleshooting, check the logs in the `logs` directory.

## License

[MIT License](LICENSE)

## Acknowledgments

- Flex language developers
- CodeMirror for the code editor
- Bootstrap for the UI framework
- PM2 for process management 