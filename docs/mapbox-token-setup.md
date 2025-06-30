# Complete Mapbox Token Setup Guide

Based on your screenshot, you're already on the right page! Here's how to complete the setup:

## Step 1: Configure Token Scopes (You're Here Now!)

From your screenshot, I can see you have the correct **Public scopes** already selected:
- ✅ STYLES:TILES
- ✅ STYLES:READ  
- ✅ FONTS:READ
- ✅ DATASETS:READ
- ✅ VISION:READ

**Perfect!** These are exactly what Money Buddy needs for geofencing.

## Step 2: Secret Scopes (Leave Unchecked)

Keep all the **Secret scopes** unchecked (as shown in your screenshot):
- ❌ SCOPES:LIST
- ❌ MAP:READ
- ❌ MAP:WRITE
- ❌ USER:READ
- ❌ All other secret scopes

Money Buddy only needs the public scopes for client-side map rendering.

## Step 3: Token Restrictions (Optional but Recommended)

Scroll down to the "Token restrictions" section and add your domain:
- **Development**: `http://localhost:3000`
- **Production**: `https://your-money-buddy-domain.com`

This makes your token more secure by restricting where it can be used.

## Step 4: Create the Token

1. Scroll to the bottom of the page
2. Click **"Create token"** button
3. Copy the generated token (starts with `pk.`)

## Step 5: Add to Your Environment

Add the token to your `.env.local` file:

\`\`\`env
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV4YW1wbGUifQ.example_token_here
\`\`\`

## Step 6: Restart Your App

\`\`\`bash
npm run dev
\`\`\`

## Step 7: Test the Integration

Visit `/transfer/geofence` in your Money Buddy app to see the interactive map!

## What Each Scope Does:

- **STYLES:TILES** - Loads map tiles and styling
- **STYLES:READ** - Reads custom map styles  
- **FONTS:READ** - Loads map fonts for labels
- **DATASETS:READ** - Reads geographic datasets
- **VISION:READ** - Computer vision features (future use)

Your current scope selection is perfect for Money Buddy! 🗺️
