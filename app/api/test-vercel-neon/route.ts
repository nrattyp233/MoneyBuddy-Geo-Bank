import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"

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
      })
    }

    // Test connection - this will wake up the suspended database
    console.log("Testing Neon database connection...")
    const startTime = Date.now()

    try {
      // Simple query to wake up the database
      const result = await sql`SELECT 1 as test`
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

      // Get host info (from connection string)
      const host = process.env.POSTGRES_HOST || process.env.DATABASE_URL?.match(/\/\/.*@([^:/]+)/)?.[1] || "Unknown"

      // Check for existing tables
      const tablesResult = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `

      const existingTables = tablesResult.map((row: any) => row.table_name)
      const requiredTables = ["users", "transactions", "geofences", "savings_locks"]
      const missingTables = requiredTables.filter((table) => !existingTables.includes(table))

      return NextResponse.json({
        success: true,
        connectionTime,
        database,
        version,
        user,
        host,
        availableVars,
        hasVercelIntegration: !!process.env.VERCEL,
        connectionSource: process.env.VERCEL ? "Vercel Environment" : "Local Environment",
        tables: {
          existing: existingTables,
          missing: missingTables,
          count: existingTables.length,
        },
        needsSetup: missingTables.length > 0,
        wakeUpTime: connectionTime > 1000 ? `${(connectionTime / 1000).toFixed(1)}s` : `${connectionTime}ms`,
      })
    } catch (dbError) {
      console.error("Database query failed:", dbError)

      // Check if it's a connection timeout (suspended database)
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError)
      const isSuspended =
        errorMessage.includes("timeout") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("ETIMEDOUT")

      return NextResponse.json({
        success: false,
        error: isSuspended ? "Database is suspended" : "Database connection failed",
        details: errorMessage,
        availableVars,
        isSuspended,
        needsWakeUp: isSuspended,
        troubleshooting: isSuspended
          ? [
              "Your Neon database is suspended (this is normal)",
              "Click 'Wake Up Database' to activate it",
              "First connection may take 10-30 seconds",
              "Database will auto-suspend after inactivity",
            ]
          : [
              "Check your DATABASE_URL environment variable",
              "Verify your Neon project is active",
              "Check your internet connection",
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
    })
  }
}

export async function POST() {
  // Wake up database endpoint
  try {
    console.log("Attempting to wake up Neon database...")
    const startTime = Date.now()

    // Multiple connection attempts to wake up the database
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      try {
        attempts++
        console.log(`Wake up attempt ${attempts}/${maxAttempts}`)

        const result = await sql`SELECT NOW() as current_time, 'Database is awake!' as message`
        const wakeTime = Date.now() - startTime

        console.log(`Database woke up successfully in ${wakeTime}ms on attempt ${attempts}`)

        return NextResponse.json({
          success: true,
          message: "Database is now active!",
          wakeTime: `${(wakeTime / 1000).toFixed(1)}s`,
          attempts,
          currentTime: result[0]?.current_time,
        })
      } catch (attemptError) {
        console.log(`Attempt ${attempts} failed:`, attemptError)

        if (attempts < maxAttempts) {
          // Wait before next attempt
          await new Promise((resolve) => setTimeout(resolve, 2000))
        } else {
          throw attemptError
        }
      }
    }
  } catch (error) {
    console.error("Failed to wake up database:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to wake up database",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
