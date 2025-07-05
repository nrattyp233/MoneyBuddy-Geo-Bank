# Mapbox Setup Guide for Money Buddy

This guide will help you set up Mapbox for the geofencing functionality in Money Buddy.

## Step 1: Create a Mapbox Account

1. Go to [mapbox.com](https://www.mapbox.com/)
2. Click "Sign up" and create a free account
3. Verify your email address

## Step 2: Get Your Access Token

1. After logging in, go to your [Account page](https://account.mapbox.com/)
2. Scroll down to "Access tokens"
3. Copy your "Default public token" or create a new one
4. Your token should start with `pk.`

## Step 3: Configure Money Buddy

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Mapbox access token:

\`\`\`env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_access_token_here
\`\`\`

## Step 4: Verify Setup

1. Restart your development server: `npm run dev`
2. Navigate to the "Mapbox Geofence" page in Money Buddy
3. You should see an interactive map load
4. Click anywhere on the map to create geofence areas

## Mapbox Pricing

- **Free tier**: 50,000 map loads per month
- **Pay-as-you-go**: $5 per 1,000 map loads after free tier
- Perfect for development and small-scale production use

## Troubleshooting

### Map not loading?
- Check that your token starts with `pk.`
- Ensure the environment variable name is exactly `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- Restart your development server after adding the token

### Console errors?
- Open browser developer tools and check for specific error messages
- Verify your token is valid on the Mapbox website

### Need help?
- Check the [Mapbox documentation](https://docs.mapbox.com/)
- Contact Money Buddy support

## Security Notes

- The `NEXT_PUBLIC_` prefix makes this token visible to browsers
- This is safe for Mapbox public tokens (they're designed for client-side use)
- Never share your secret tokens or put them in client-side code
- You can restrict token usage by URL in your Mapbox account settings

## Features Enabled

With Mapbox configured, Money Buddy users can:
- ✅ Create interactive geofence areas on maps
- ✅ Restrict money transfers to specific locations
- ✅ Visualize geofence boundaries in real-time
- ✅ Edit and delete geofence areas
- ✅ See precise coordinates for each geofence zone

Your Money Buddy app is now ready for location-based money transfers! 🗺️🐵
