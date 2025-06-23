export async function GET() {
  try {
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN

    if (!accessToken || accessToken === "pk.your_mapbox_token_here") {
      return Response.json({
        hasToken: false,
        tokenValid: false,
        useMockMap: true,
      })
    }

    // Test the token by making a simple API call
    try {
      const response = await fetch(`https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${accessToken}`)

      return Response.json({
        hasToken: true,
        tokenValid: response.ok,
        useMockMap: !response.ok,
        // Return script URLs instead of raw token
        scriptUrl: "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js",
        styleUrl: "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css",
      })
    } catch (error) {
      return Response.json({
        hasToken: true,
        tokenValid: false,
        useMockMap: true,
      })
    }
  } catch (error) {
    console.error("Error getting Mapbox config:", error)
    return Response.json({
      hasToken: false,
      tokenValid: false,
      useMockMap: true,
    })
  }
}
