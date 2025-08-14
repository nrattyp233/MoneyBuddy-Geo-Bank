#!/bin/bash

# Money Buddy VPS Deployment Script
echo "🖥️  Money Buddy VPS Deployment"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 process manager..."
    npm install -g pm2
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check for environment file
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Please create it with your environment variables."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "🚀 Starting Money Buddy with PM2..."
    
    # Stop existing process if running
    pm2 delete money-buddy 2>/dev/null || true
    
    # Start new process
    pm2 start npm --name "money-buddy" -- start
    
    # Save PM2 configuration
    pm2 save
    
    # Set up PM2 to start on boot
    pm2 startup
    
    echo "✅ Money Buddy is now running!"
    echo ""
    echo "🌐 Access your app at: http://localhost:3000"
    echo ""
    echo "📋 Useful PM2 commands:"
    echo "   View logs:    pm2 logs money-buddy"
    echo "   Restart:      pm2 restart money-buddy"
    echo "   Stop:         pm2 stop money-buddy"
    echo "   Status:       pm2 status"
    echo "   Monitor:      pm2 monit"
    echo ""
    echo "🔧 To update:"
    echo "   1. git pull"
    echo "   2. npm install"
    echo "   3. npm run build"
    echo "   4. pm2 restart money-buddy"
    
else
    echo "❌ Build failed! Please fix the errors above."
    exit 1
fi