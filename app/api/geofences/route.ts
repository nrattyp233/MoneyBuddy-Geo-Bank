import { NextResponse } from "next/server"
import { getUserGeofences, createGeofence, getUserByEmail, type Geofence } from "@/lib/neon"

//----------  GET /api/geofences?userId=...  ----------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }
    const geofences = await getUserGeofences(userId)
    return NextResponse.json({ geofences })
  } catch (error) {
    console.error("GET /api/geofences error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

//----------  POST /api/geofences  ----------
export async function POST(req: Request) {
  try {
    const body: Partial<Geofence> & { recipient_email: string } = await req.json()

    // basic validation
    const required = ["user_id", "name", "center_lat", "center_lng", "amount", "recipient_email"]
    for (const key of required) {
      if (body[key as keyof typeof body] === undefined)
        return NextResponse.json({ error: `${key} is required` }, { status: 400 })
    }

    // verify recipient exists
    const recipient = await getUserByEmail(body.recipient_email)
    if (!recipient) return NextResponse.json({ error: "Recipient email not found" }, { status: 404 })

    const newFence = await createGeofence({
      ...body,
      recipient_id: recipient.id,
      radius: body.radius ?? 100,
      is_active: true,
      is_claimed: false,
    })

    return NextResponse.json({ geofence: newFence }, { status: 201 })
  } catch (error) {
    console.error("POST /api/geofences error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
