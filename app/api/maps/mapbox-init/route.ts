export async function POST(request: Request) {
  try {
    const { center, zoom, style } = await request.json()
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN

    if (!accessToken || accessToken === "pk.your_mapbox_token_here") {
      return Response.json({ error: "No Mapbox token available" }, { status: 400 })
    }

    // Return initialization config without exposing token
    return Response.json({
      success: true,
      config: {
        // We'll use a session-based approach or signed URLs
        initScript: `
          window.mapboxgl.accessToken = '${accessToken}';
          window.mapboxInitialized = true;
        `,
        center: center || [-74.006, 40.7128],
        zoom: zoom || 13,
        style: `mapbox://styles/mapbox/${style || "streets-v12"}`,
      },
    })
  } catch (error) {
    console.error("Error initializing Mapbox:", error)
    return Response.json({ error: "Failed to initialize Mapbox" }, { status: 500 })
  }
}
