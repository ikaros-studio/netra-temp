#!/bin/bash

# Stop on errors
set -e

echo "Starting deployment process..."

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build the application
echo "Building the application..."
cd apps/web
pnpm run deploy

echo "Build completed. Files ready for deployment in apps/web/.output directory."

# Check if we should deploy to Vercel
if [ "$1" == "--vercel" ]; then
  echo "Deploying to Vercel..."
  # Check if Vercel CLI is installed
  if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
  fi
  
  # Deploy to Vercel
  cd ../..
  vercel --prod
  
  echo "Deployment to Vercel completed!"
else
  echo "To deploy to Vercel, run: ./deploy.sh --vercel"
  echo "For other deployment options, see deploy.md"
fi 