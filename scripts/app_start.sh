#!/bin/bash
set -e

# Set AWS region environment variables
export AWS_REGION=ap-south-1
export AWS_DEFAULT_REGION=ap-south-1

APP_DIR="/var/www/codeit"
cd $APP_DIR

echo "Starting Node application from $APP_DIR..."
echo "Fetching environment variables from AWS Parameter Store..."

# Check AWS CLI configuration
if ! aws sts get-caller-identity > /dev/null 2>&1; then
  echo "AWS CLI is not configured. Please configure AWS CLI."
  exit 1
fi

# Define all your parameter names
PARAMS=(
  "/codeit/PORT"
  "/codeit/DATABASE_URL"
  "/codeit/EMAIL_USER"
  "/codeit/EMAIL_PASS"
  "/codeit/MAIL_HOST"
  "/codeit/MAIL_USER"
  "/codeit/MAIL_PASS"
  "/codeit/JWT_SECRET"
  "/codeit/FRONTEND_URL"
  "/codeit/GOOGLE_CLIENT_ID"
  "/codeit/JUDGE0_API_KEY"
  "/codeit/JUDGE0_API_BASE_URL"
)

# Fetch parameters
for param in "${PARAMS[@]}"; do
  name=$(basename "$param")
  value=$(aws ssm get-parameter --name "$param" --with-decryption --query Parameter.Value --output text) || { echo "Failed to fetch $name"; exit 1; }
  export $name="$value"
done

# Write to .env file
echo "Writing .env file..."
cat > "$APP_DIR/.env" << EOF
PORT=$PORT
DATABASE_URL=$DATABASE_URL
EMAIL_USER=$EMAIL_USER
EMAIL_PASS=$EMAIL_PASS
MAIL_HOST=$MAIL_HOST
MAIL_USER=$MAIL_USER
MAIL_PASS=$MAIL_PASS
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=$FRONTEND_URL
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
JUDGE0_API_KEY=$JUDGE0_API_KEY
JUDGE0_API_BASE_URL=$JUDGE0_API_BASE_URL
EOF

# Check if PM2 is installed, if not, install it
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Installing PM2..."
    npm install -g pm2
fi

# Check if Node.js is installed, if not, exit
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Please ensure Node.js is installed."
    exit 1
fi

echo "Starting application with PM2..."

# Start the Node.js application using PM2
pm2 start "$APP_DIR/src/server.ts" --name "codeit" --interpreter ts-node --env production

# Enable PM2 to start on boot
pm2 startup | bash || echo "PM2 startup script failed"
pm2 save || echo "PM2 save failed"

echo "Application started successfully."
