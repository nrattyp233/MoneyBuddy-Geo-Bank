import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    token: process.env.MAPBOX_ACCESS_TOKEN ?? null,
  })
}
