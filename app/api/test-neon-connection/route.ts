import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    // Check which environment variables are available
    const availableVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
      DATABASE_URL_UNPOOLED: !!process.env.DATABASE_URL_UNPOOLED,
      POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
      POSTGRES_HOST: !!process.env.POSTGRES_HOST,
      POSTGRES_USER: !!process.env.POSTGRES_USER,
      POSTGRES_PASSWORD: !!process.env.POSTGRES_PASSWORD,
      POSTGRES_DATABASE: !!process.env.POSTGRES_DATABASE,
    }

    // Check if we have any database URL
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      return NextResponse.json({
        success: false,
        error: "No database URL found",
        details: "DATABASE_URL or POSTGRES_URL environment variable is required",
        availableVars,
        needsSetup: true,
        projectStatus: "Environment variables not configured",
        troubleshooting: [
          "Add DATABASE_URL to your .env.local file",
          "Get connection string from your Neon project",
          "Make sure you have access to your Neon project",
          "Create a new Neon project if you don't have access",
        ],
      })
    }

    // Get the database URL to use
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    // Extract project info from URL
    const urlMatch = databaseUrl?.match(/\/\/.*@([^:/]+)/)
    const host = urlMatch?.[1] || "unknown"
    const projectName = host.split(".")[0]?.replace("ep-", "") || "unknown"

    console.log(`Testing connection to: ${projectName}`)

    // Test connection
    const startTime = Date.now()

    try {
      const sql = neon(databaseUrl!)

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
        availableVars,
        hasVercelIntegration: !!process.env.VERCEL,
        connectionSource: process.env.VERCEL ? "Vercel Environment" : "Local Environment",
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
        databaseUrl: databaseUrl.replace(/:[^:@]*@/, ":****@"), // Hide password
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
        errorMessage.includes("no pg_hba.conf entry")

      return NextResponse.json({
        success: false,
        error: isConnectionError ? "Connection failed" : "Database query failed",
        details: errorMessage,
        availableVars,
        projectName,
        projectStatus: isAccessError ? "Access Denied" : "Connection Error",
        isConnectionError,
        isAccessError,
        troubleshooting: isAccessError
          ? [
              "Check if you have access to this Neon project",
              "Verify you're using the correct connection string",
              "Make sure your Neon project is active",
              "Consider creating a new Neon project if you don't have access",
            ]
          : isConnectionError
            ? [
                "Check your DATABASE_URL environment variable",
                "Verify your Neon project is active",
                "Make sure your connection string includes the correct credentials",
                "Check your internet connection",
              ]
            : [
                "Database connected but query failed",
                "Check database permissions",
                "Verify the database schema",
                "Try refreshing the connection",
              ],
      })
    }
  } catch (error) {
    console.error("Connection test failed:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to test connection",
      details: error instanceof Error ? error.message : "Unknown error",
      availableVars: {},
      projectStatus: "Test Failed",
      troubleshooting: [
        "Check your environment variables",
        "Verify your Neon project exists and is accessible",
        "Make sure you have the correct connection string",
        "Try creating a new Neon project",
      ],
    })
  }
}
