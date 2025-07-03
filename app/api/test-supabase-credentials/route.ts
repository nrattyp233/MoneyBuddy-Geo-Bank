import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url, key } = await request.json()

    if (!url || !key) {
      return NextResponse.json({
        success: false,
        error: "Missing credentials",
        details: "Both URL and API key are required",
      })
    }

    // Create a test client with the provided credentials
    const testClient = createClient(url, key)

    // Test the connection by running a simple query
    const { data, error } = await testClient.from("information_schema.tables").select("table_name").limit(1)

    if (error) {
      // If information_schema doesn't work, try a different approach
      const { data: simpleTest, error: simpleError } = await testClient.rpc("version")

      if (simpleError) {
        return NextResponse.json({
          success: false,
          error: "Connection failed",
          details: simpleError.message,
          projectId: url.split("//")[1]?.split(".")[0] || "Unknown",
        })
      }
    }

    // Extract project ID from URL
    const projectId = url.split("//")[1]?.split(".")[0] || "Unknown"

    return NextResponse.json({
      success: true,
      message: "Connection successful",
      projectId,
      url,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
