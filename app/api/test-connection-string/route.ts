import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const { connectionString } = await request.json()

    if (!connectionString) {
      return NextResponse.json({
        success: false,
        error: "Missing connection string",
        details: "Connection string is required",
      })
    }

    // Validate connection string format
    if (!connectionString.startsWith("postgresql://")) {
      return NextResponse.json({
        success: false,
        error: "Invalid connection string format",
        details: "Connection string should start with postgresql://",
      })
    }

    if (!connectionString.includes("neon.tech")) {
      return NextResponse.json({
        success: false,
        error: "Not a Neon connection string",
        details: "Connection string should contain neon.tech",
      })
    }

    // Extract project info from URL
    const urlMatch = connectionString.match(/\/\/.*@([^:/]+)/)
    const host = urlMatch?.[1] || "unknown"
    const projectName = host.split(".")[0]?.replace("ep-", "") || "unknown"

    console.log(`Testing connection to project: ${projectName}`)

    // Test connection
    const startTime = Date.now()

    try {
      const sql = neon(connectionString)

      // Test basic connection
      const result = await sql`SELECT 1 as test, NOW() as current_time`
      const connectionTime = Date.now() - startTime

      console.log(`Database connection successful in ${connectionTime}ms`)

      // Get database info
      const versionResult = await sql`SELECT version()`
      const version = versionResult[0]?.version || "Unknown"

      // Get current database name
      const dbResult = await sql`SELECT current_database()`
      const database = dbResult[0]?.current_database || "Unknown"

      // Get current user
      const userResult = await sql`SELECT current_user`
      const user = userResult[0]?.current_user || "Unknown"

      // Check for existing tables
      const tablesResult = await sql`
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public'
        ORDER BY table_name
      `

      const existingTables = tablesResult.map((row: any) => ({
        name: row.table_name,
        columns: row.column_count,
      }))

      const requiredTables = ["users", "transactions", "geofences", "savings_locks"]
      const existingTableNames = existingTables.map((t) => t.name)
      const missingTables = requiredTables.filter((table) => !existingTableNames.includes(table))

      // Get row counts for existing tables
      const tableCounts: Record<string, number> = {}
      for (const table of existingTableNames) {
        try {
          const countResult = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`
          tableCounts[table] = Number(countResult[0]?.count) || 0
        } catch (error) {
          tableCounts[table] = 0
        }
      }

      return NextResponse.json({
        success: true,
        connectionTime,
        database,
        version,
        user,
        host,
        projectName,
        projectStatus: "Connected and Active",
        connectionSource: "Direct Connection String",
        tables: {
          existing: existingTables,
          existingNames: existingTableNames,
          missing: missingTables,
          count: existingTables.length,
          counts: tableCounts,
        },
        needsSetup: missingTables.length > 0,
        isActive: true,
        responseTime: `${connectionTime}ms`,
        connectionString: connectionString.replace(/:[^:@]*@/, ":****@"), // Hide password
      })
    } catch (dbError) {
      console.error("Database query failed:", dbError)

      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError)
      const isConnectionError =
        errorMessage.includes("timeout") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("ETIMEDOUT") ||
        errorMessage.includes("getaddrinfo") ||
        errorMessage.includes("no pg_hba.conf entry") ||
        errorMessage.includes("authentication failed")

      const isAccessError =
        errorMessage.includes("access") ||
        errorMessage.includes("permission") ||
        errorMessage.includes("authentication") ||
        errorMessage.includes("no pg_hba.conf entry") ||
        errorMessage.includes("password authentication failed")

      const isSuspendedError =
        errorMessage.includes("suspended") ||
        errorMessage.includes("inactive") ||
        errorMessage.includes("endpoint is not active")

      let errorType = "Connection Error"
      let troubleshooting = [
        "Check your connection string format",
        "Verify your credentials are correct",
        "Make sure your internet connection is working",
        "Try again in a few moments",
      ]

      if (isAccessError) {
        errorType = "Authentication Failed"
        troubleshooting = [
          "Check your username and password in the connection string",
          "Verify you have access to this Neon project",
          "Make sure the connection string is complete and correct",
          "Try getting a fresh connection string from Neon console",
        ]
      } else if (isSuspendedError) {
        errorType = "Database Suspended"
        troubleshooting = [
          "Your Neon database is suspended (this is normal)",
          "Try connecting again - it should wake up automatically",
          "Wait 10-30 seconds for the database to become active",
          "Check your Neon console to see if the project is active",
        ]
      }

      return NextResponse.json({
        success: false,
        error: errorType,
        details: errorMessage,
        projectName,
        projectStatus: errorType,
        isConnectionError,
        isAccessError,
        isSuspendedError,
        troubleshooting,
      })
    }
  } catch (error) {
    console.error("Connection test failed:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to test connection",
      details: error instanceof Error ? error.message : "Unknown error",
      projectStatus: "Test Failed",
      troubleshooting: [
        "Check that your connection string is valid",
        "Make sure it starts with postgresql://",
        "Verify it contains neon.tech in the hostname",
        "Try copying the connection string again from Neon console",
      ],
    })
  }
}
