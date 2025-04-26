#!/bin/bash

# Flex Online Compiler Deployment Script
echo "Deploying Flex Online Compiler..."

# Navigate to the project directory
cd "$(dirname "$0")"

# Check for node and npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "Error: Node.js and npm are required but not installed."
    exit 1
fi

# Check for PM2
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Installing PM2 globally..."
    npm install -g pm2
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install --production
cd ..

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p backend/temp logs

# Set production environment
echo "Setting production environment..."
if [ ! -f backend/.env ]; then
    echo "Creating .env file..."
    cat > backend/.env << EOF
PORT=80
NODE_ENV=production
PYTHON_PATH=python3
FLEX_SRC_PATH=../../src
TEMP_DIR=./temp
LOG_LEVEL=info
EOF
else
    # Update existing .env file
    sed -i 's/NODE_ENV=development/NODE_ENV=production/' backend/.env
    sed -i 's/PORT=3000/PORT=80/' backend/.env
fi

# Check permissions for log directories
echo "Setting permissions..."
chmod -R 755 logs
chmod -R 755 backend/temp

# Start or restart the application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list
echo "Saving PM2 process list..."
pm2 save

# Setup PM2 to start on system boot if not already
if ! pm2 startup | grep -q "already enabled"; then
    echo "Setting up PM2 to start on system boot..."
    pm2 startup
fi

echo "Deployment complete!"
echo "The Flex Online Compiler should now be running at http://localhost:80"
echo "To monitor the application, use: pm2 monit" 