#!/bin/bash
set -e

echo "Installing Node.js..."

# Update package lists
yum update -y

# Install Node.js 16.x if not already installed
if ! command -v node &> /dev/null
then
    echo "Node.js could not be found, installing..."
    curl -sL https://rpm.nodesource.com/setup_16.x | bash -
    yum install -y nodejs
else
    echo "Node.js is already installed, skipping installation."
fi

# Create application directory if it doesn't exist
mkdir -p /var/www/codeit

# Install PM2 globally
npm install -g pm2

# Check versions
echo "Node.js version:"
node -v
echo "npm version:"
npm -v
echo "PM2 version:"
pm2 -v

# Cleanup package manager cache (optional)
yum clean all

echo "Node.js installation completed"
