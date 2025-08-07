#!/bin/bash
set -e

echo "Installing Node.js..."

# Update package lists
if ! sudo apt update -y; then
  echo "apt update failed."
  exit 1
fi

# Install Node.js 20.x if not already installed
if ! command -v node &> /dev/null; then
    echo "Node.js could not be found, installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "Node.js is already installed, skipping installation."
fi

# Create application directory if it doesn't exist
if ! sudo mkdir -p /var/www/codeit; then
    echo "Directory creation failed. Ensure you have the necessary permissions."
    exit 1
fi

# Install PM2 globally
if ! sudo npm install -g pm2; then
    echo "PM2 installation failed. Ensure you have the necessary permissions."
    exit 1
fi

# Check versions
if command -v node &> /dev/null; then
    echo "Node.js version:"
    node -v
else
    echo "Node.js installation failed."
    exit 1
fi

echo "npm version:"
npm -v
echo "PM2 version:"
pm2 -v

# Cleanup package manager cache (optional)
if ! sudo apt clean; then
    echo "apt clean failed."
    exit 1
fi

echo "Node.js installation completed"
