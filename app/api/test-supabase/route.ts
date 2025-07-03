import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .limit(1)

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: "Connection failed",
        details: connectionError.message,
        projectInfo: null,
        tables: [],
        needsSetup: true,
      })
    }

    // Get project info from the URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const projectId = supabaseUrl.split("//")[1]?.split(".")[0] || "unknown"

    // Check for required tables
    const requiredTables = ["users", "transactions", "geofences", "savings_locks"]
    const tableChecks = []
    let needsSetup = false
    const missingTables = []

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase.from(tableName).select("*").limit(1)

        if (error && error.message.includes("does not exist")) {
          tableChecks.push({
            name: tableName,
            exists: false,
            rowCount: 0,
            error: "Table does not exist",
          })
          needsSetup = true
          missingTables.push(tableName)
        } else {
          // Get row count
          const { count } = await supabase.from(tableName).select("*", { count: "exact", head: true })

          tableChecks.push({
            name: tableName,
            exists: true,
            rowCount: count || 0,
            error: null,
          })
        }
      } catch (err) {
        tableChecks.push({
          name: tableName,
          exists: false,
          rowCount: 0,
          error: err instanceof Error ? err.message : "Unknown error",
        })
        needsSetup = true
        missingTables.push(tableName)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Connected to Supabase successfully",
      projectInfo: {
        projectId,
        url: supabaseUrl,
      },
      tables: tableChecks,
      needsSetup,
      missingTables,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Connection test failed",
      details: error instanceof Error ? error.message : "Unknown error",
      projectInfo: null,
      tables: [],
      needsSetup: true,
    })
  }
}
