export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN

    if (!accessToken || !query) {
      return Response.json({ error: "Missing token or query" }, { status: 400 })
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&limit=1`,
    )

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center
      return Response.json({
        success: true,
        location: { lat, lng },
        placeName: data.features[0].place_name,
      })
    }

    return Response.json({ error: "Location not found" }, { status: 404 })
  } catch (error) {
    console.error("Geocoding error:", error)
    return Response.json({ error: "Geocoding failed" }, { status: 500 })
  }
}
