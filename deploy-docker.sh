#!/bin/bash

# Money Buddy Docker Deployment Script
echo "🐳 Money Buddy Docker Deployment"
echo "================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check for environment file
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Creating template..."
    cp .env.example .env.local 2>/dev/null || echo "Please create .env.local with your environment variables"
fi

echo "🏗️  Building Docker image..."
docker build -t money-buddy .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    
    echo "🚀 Starting Money Buddy container..."
    docker run -d \
        --name money-buddy-app \
        -p 3000:3000 \
        --env-file .env.local \
        --restart unless-stopped \
        money-buddy
    
    if [ $? -eq 0 ]; then
        echo "✅ Money Buddy is now running!"
        echo ""
        echo "🌐 Access your app at: http://localhost:3000"
        echo ""
        echo "📋 Useful commands:"
        echo "   View logs: docker logs -f money-buddy-app"
        echo "   Stop app:  docker stop money-buddy-app"
        echo "   Start app: docker start money-buddy-app"
        echo "   Remove:    docker rm -f money-buddy-app"
        echo ""
        echo "🔧 To update:"
        echo "   1. docker stop money-buddy-app"
        echo "   2. docker rm money-buddy-app"
        echo "   3. git pull"
        echo "   4. ./deploy-docker.sh"
    else
        echo "❌ Failed to start container"
        exit 1
    fi
else
    echo "❌ Docker build failed!"
    exit 1
fi