import { NextResponse } from "next/server"
import { testConnection, getDatabaseInfo } from "@/lib/neon"

export async function GET() {
  try {
    // Test basic connection
    const isConnected = await testConnection()

    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: "Connection failed",
        details: "Could not connect to Neon database. Check your DATABASE_URL environment variable.",
        connected: false,
      })
    }

    // Get detailed database info
    const dbInfo = await getDatabaseInfo()

    return NextResponse.json({
      success: true,
      connected: true,
      ...dbInfo,
    })
  } catch (error) {
    console.error("Database test failed:", error)
    return NextResponse.json({
      success: false,
      error: "Database test failed",
      details: error instanceof Error ? error.message : "Unknown error",
      connected: false,
    })
  }
}
