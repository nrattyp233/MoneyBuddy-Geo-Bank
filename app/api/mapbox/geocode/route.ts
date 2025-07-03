import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
    }

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!mapboxToken) {
      return NextResponse.json({ error: "Mapbox token not configured" }, { status: 500 })
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&limit=5&types=address,poi,place`,
    )

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Geocoding error:", error)
    return NextResponse.json({ error: "Failed to geocode address" }, { status: 500 })
  }
}
