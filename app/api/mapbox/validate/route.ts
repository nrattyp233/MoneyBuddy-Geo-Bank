import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ isValid: false, message: "Token is required" }, { status: 400 })
    }

    if (!token.startsWith("pk.")) {
      return NextResponse.json(
        { isValid: false, message: "Invalid token format. Mapbox tokens should start with 'pk.'" },
        { status: 400 },
      )
    }

    // Test the token by making a request to Mapbox API
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${token}`)

    if (response.ok) {
      return NextResponse.json({
        isValid: true,
        message: "Token is valid and working!",
        details: {
          type: "Valid Mapbox Token",
          scopes: "Public scopes verified",
          status: "Ready for geofencing",
        },
      })
    } else {
      let errorMessage = `Invalid token (${response.status})`
      if (response.status === 401) {
        errorMessage = "Token is invalid or expired"
      } else if (response.status === 403) {
        errorMessage = "Token doesn't have required permissions"
      }

      return NextResponse.json({ isValid: false, message: errorMessage }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      {
        isValid: false,
        message: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
