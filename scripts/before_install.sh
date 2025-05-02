#!/bin/bash
set -e

echo "Installing Node.js..."

# Update package lists
if ! sudo yum update -y; then
  echo "yum update failed."
  exit 1
fi

# Install Node.js 18.x if not already installed
if ! command -v node &> /dev/null; then
    echo "Node.js could not be found, installing..."
    curl -sL https://rpm.nodesource.com/setup_16.x | bash -
    yum install -y nodejs
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
if ! sudo yum clean all; then
    echo "yum clean failed."
    exit 1
fi

echo "Node.js installation completed"
