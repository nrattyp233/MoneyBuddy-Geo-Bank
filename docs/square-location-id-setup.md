# How to Get Your Square Location ID

Your Square Location ID is required for processing payouts and withdrawals. Here's how to find it:

## Method 1: Square Developer Dashboard

1. **Log into Square Developer Dashboard**
   - Go to [developer.squareup.com](https://developer.squareup.com/)
   - Sign in with your Square account

2. **Select Your Application**
   - Click on your "Money Buddy" application
   - Or the application you created for this banking app

3. **Navigate to Locations**
   - In the left sidebar, click on **"Locations"**
   - You'll see a list of all your business locations

4. **Copy the Location ID**
   - Each location will show an ID that looks like: `L7HXV8XHMMM2M`
   - Copy this ID - this is your `SQUARE_LOCATION_ID`

## Method 2: Square Dashboard (Business Account)

1. **Log into Square Dashboard**
   - Go to [squareup.com/dashboard](https://squareup.com/dashboard)
   - Sign in with your Square business account

2. **Go to Account & Settings**
   - Click on your profile icon in the top right
   - Select **"Account & Settings"**

3. **Select Locations**
   - Click on **"Locations"** in the left menu
   - You'll see your business locations listed

4. **View Location Details**
   - Click on a location to view its details
   - The Location ID will be displayed in the location information

## Method 3: Using Square API (Advanced)

If you want to programmatically get your location ID:

\`\`\`javascript
const { Client, Environment } = require('squareup');

const client = new Client({
  accessToken: 'YOUR_SQUARE_ACCESS_TOKEN',
  environment: Environment.Sandbox // or Environment.Production
});

const locationsApi = client.locationsApi;

async function getLocations() {
  try {
    const { result } = await locationsApi.listLocations();
    console.log('Locations:', result.locations);
    
    // Your location ID will be in result.locations[0].id
    const locationId = result.locations[0].id;
    console.log('Location ID:', locationId);
  } catch (error) {
    console.error('Error:', error);
  }
}

getLocations();
\`\`\`

## What Your Location ID Looks Like

Square Location IDs typically follow this format:
- **Sandbox**: `LTK0K07B3HPQM` (13 characters)
- **Production**: `L7HXV8XHMMM2M` (13 characters)
- Always starts with "L" followed by alphanumeric characters

## Adding to Your Environment

Once you have your Location ID, add it to your `.env.local` file:

\`\`\`env
# Square Configuration
SQUARE_ACCESS_TOKEN=your_access_token_here
SQUARE_APPLICATION_ID=your_application_id_here
SQUARE_LOCATION_ID=L7HXV8XHMMM2M
SQUARE_ENVIRONMENT=sandbox
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_key_here
\`\`\`

## Default Location

If you have multiple locations:
- Use your **primary/main location** for the banking app
- This is typically the first location you created
- You can process payments from any location, but payouts need a specific location ID

## Troubleshooting

**"Location not found" error:**
- Make sure you're using the correct environment (sandbox vs production)
- Verify the Location ID format (should be 13 characters starting with "L")
- Check that the location is active in your Square account

**Multiple locations:**
- If you have multiple business locations, choose your primary one
- You can always change this later in your environment variables

**Sandbox vs Production:**
- Sandbox locations are different from production locations
- Make sure your `SQUARE_ENVIRONMENT` matches the location you're using

## Need Help?

- Check your Square Dashboard at [squareup.com/dashboard](https://squareup.com/dashboard)
- Visit Square Developer docs at [developer.squareup.com](https://developer.squareup.com/)
- Contact Square support if you can't find your location ID

Your Location ID is now ready to use with Money Buddy! 🏦
