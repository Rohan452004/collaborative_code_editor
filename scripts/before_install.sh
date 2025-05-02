#!/bin/bash
set -e

echo "Installing Node.js..."

# Update package lists
sudo yum update -y || { echo "yum update failed"; exit 1; }

# Install Node.js 18.x if not already installed
if ! command -v node &> /dev/null
then
    echo "Node.js could not be found, installing..."
    sudo curl -sL https://rpm.nodesource.com/setup_16.x | bash - || { echo "Node.js setup failed"; exit 1; }
    sudo yum install -y nodejs || { echo "Node.js installation failed"; exit 1; }
else
    echo "Node.js is already installed, skipping installation."
fi

# Create application directory if it doesn't exist
sudo mkdir -p /var/www/codeit || { echo "Directory creation failed"; exit 1; }

# Install PM2 globally
sudo npm install -g pm2 || { echo "PM2 installation failed"; exit 1; }

# Check versions
echo "Node.js version:"
node -v
echo "npm version:"
npm -v
echo "PM2 version:"
pm2 -v

# Cleanup package manager cache (optional)
sudo yum clean all || { echo "yum clean failed"; exit 1; }

echo "Node.js installation completed"
