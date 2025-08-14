#!/bin/bash

# Money Buddy Docker Compose Deployment Script
echo "🐳 Money Buddy Docker Compose Deployment"
echo "========================================"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

# Check for environment file
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Creating template..."
    cp .env.example .env.local 2>/dev/null || echo "Please create .env.local with your environment variables"
fi

echo "🏗️  Building and starting Money Buddy..."

# Use docker compose (newer) or docker-compose (older)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

$COMPOSE_CMD up -d --build

if [ $? -eq 0 ]; then
    echo "✅ Money Buddy is now running with Docker Compose!"
    echo ""
    echo "🌐 Access your app at: http://localhost:3000"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs:    $COMPOSE_CMD logs -f"
    echo "   Stop app:     $COMPOSE_CMD down"
    echo "   Restart:      $COMPOSE_CMD restart"
    echo "   View status:  $COMPOSE_CMD ps"
    echo ""
    echo "🔧 To update:"
    echo "   1. git pull"
    echo "   2. $COMPOSE_CMD up -d --build"
else
    echo "❌ Docker Compose deployment failed!"
    exit 1
fi