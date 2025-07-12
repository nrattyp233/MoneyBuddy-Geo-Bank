#!/bin/bash

# Money Buddy Production Deployment Script
# This script helps deploy Money Buddy to production

echo "🚀 Money Buddy Production Deployment"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$PAYPAL_CLIENT_ID" ] || [ -z "$PAYPAL_CLIENT_SECRET" ]; then
    echo "⚠️  Warning: PayPal credentials not found in environment variables."
    echo "   Make sure to set them in your deployment platform."
fi

echo "📦 Installing dependencies..."
npm install

echo "🔍 Running type check..."
npm run type-check

echo "🏗️  Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Deploy to your platform (Vercel, Railway, etc.)"
    echo "2. Set up environment variables"
    echo "3. Configure PayPal live credentials"
    echo "4. Test with small amounts"
    echo ""
    echo "📖 See PRODUCTION_SETUP.md for detailed instructions"
else
    echo "❌ Build failed! Please fix the errors above."
    exit 1
fi
