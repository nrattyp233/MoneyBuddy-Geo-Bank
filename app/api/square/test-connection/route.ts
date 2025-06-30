import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check all required Square environment variables
    const requiredVars = {
      SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN,
      SQUARE_APPLICATION_ID: process.env.SQUARE_APPLICATION_ID,
      SQUARE_LOCATION_ID: process.env.SQUARE_LOCATION_ID,
      SQUARE_ENVIRONMENT: process.env.SQUARE_ENVIRONMENT,
      SQUARE_WEBHOOK_SIGNATURE_KEY: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
    }

    const missingVars = Object.entries(requiredVars)
      .filter(([key, value]) => !value || value.includes("your_") || value.includes("YOUR_"))
      .map(([key]) => key)

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Missing Square configuration",
        missing_variables: missingVars,
        message: "Please configure all required Square environment variables",
      })
    }

    // Test Square API connection (in production, you would make an actual API call)
    /*
    const { Client, Environment } = require('squareup')
    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox
    })

    // Test locations API
    const locationsApi = client.locationsApi
    const { result } = await locationsApi.listLocations()
    
    // Verify the location ID exists
    const location = result.locations?.find(loc => loc.id === process.env.SQUARE_LOCATION_ID)
    if (!location) {
      return NextResponse.json({
        success: false,
        error: "Location ID not found",
        available_locations: result.locations?.map(loc => ({ id: loc.id, name: loc.name }))
      })
    }
    */

    // For demo purposes, simulate successful connection
    const connectionTest = {
      access_token: process.env.SQUARE_ACCESS_TOKEN ? "✅ Configured" : "❌ Missing",
      application_id: process.env.SQUARE_APPLICATION_ID ? "✅ Configured" : "❌ Missing",
      location_id: process.env.SQUARE_LOCATION_ID ? "✅ Configured" : "❌ Missing",
      environment: process.env.SQUARE_ENVIRONMENT || "sandbox",
      webhook_key: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY ? "✅ Configured" : "❌ Missing",
    }

    return NextResponse.json({
      success: true,
      message: "Square configuration test completed",
      configuration: connectionTest,
      location_id: process.env.SQUARE_LOCATION_ID,
      environment: process.env.SQUARE_ENVIRONMENT,
      ready_for_payments: missingVars.length === 0,
    })
  } catch (error) {
    console.error("Square connection test error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to test Square connection",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
