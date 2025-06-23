export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
      return Response.json({
        hasApiKey: false,
        useMockMap: true,
      })
    }

    // Return a secure config without exposing the full API key
    return Response.json({
      hasApiKey: true,
      useMockMap: false,
      // Only return the script URL, not the raw key
      scriptUrl: `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`,
    })
  } catch (error) {
    console.error("Error getting maps config:", error)
    return Response.json(
      {
        hasApiKey: false,
        useMockMap: true,
      },
      { status: 500 },
    )
  }
}
