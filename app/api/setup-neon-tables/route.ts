import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function POST() {
  try {
    if (!sql) {
      return NextResponse.json({
        success: false,
        error: "Database not configured",
        details: "DATABASE_URL environment variable is not set",
      })
    }

    const tablesCreated: string[] = []

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        balance DECIMAL(10,2) DEFAULT 0.00,
        savings_balance DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    tablesCreated.push("users")

    // Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'geofence')),
        amount DECIMAL(10,2) NOT NULL,
        fee DECIMAL(10,2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        description TEXT,
        recipient_email VARCHAR(255),
        square_payment_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    tablesCreated.push("transactions")

    // Create geofences table
    await sql`
      CREATE TABLE IF NOT EXISTS geofences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        center_lat DECIMAL(10,8) NOT NULL,
        center_lng DECIMAL(11,8) NOT NULL,
        radius INTEGER NOT NULL DEFAULT 50,
        amount DECIMAL(10,2) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
        memo TEXT,
        is_active BOOLEAN DEFAULT true,
        is_claimed BOOLEAN DEFAULT false,
        claimed_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    tablesCreated.push("geofences")

    // Create savings_locks table
    await sql`
      CREATE TABLE IF NOT EXISTS savings_locks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        interest_rate DECIMAL(5,4) DEFAULT 0.0500,
        lock_duration_days INTEGER NOT NULL,
        locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        unlocks_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    tablesCreated.push("savings_locks")

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_geofences_user_id ON geofences(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_geofences_active ON geofences(is_active, is_claimed)`
    await sql`CREATE INDEX IF NOT EXISTS idx_geofences_location ON geofences(center_lat, center_lng)`
    await sql`CREATE INDEX IF NOT EXISTS idx_savings_locks_user_id ON savings_locks(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`

    // Create sample data
    let sampleDataCreated = false
    try {
      // Check if demo user already exists
      const existingUser = await sql`SELECT id FROM users WHERE email = 'demo@moneybuddy.com' LIMIT 1`

      if (existingUser.length === 0) {
        // Create demo user
        const demoUser = await sql`
          INSERT INTO users (email, full_name, balance, savings_balance)
          VALUES ('demo@moneybuddy.com', 'Demo User', 2500.00, 500.00)
          RETURNING id
        `

        const userId = demoUser[0].id

        // Create sample transaction
        const transaction = await sql`
          INSERT INTO transactions (user_id, type, amount, fee, status, description)
          VALUES (${userId}, 'deposit', 2500.00, 0.00, 'completed', 'Initial demo balance')
          RETURNING id
        `

        // Create sample geofence
        await sql`
          INSERT INTO geofences (
            user_id, transaction_id, name, center_lat, center_lng, radius, 
            amount, recipient_email, memo, is_active, is_claimed
          )
          VALUES (
            ${userId}, ${transaction[0].id}, 'Coffee Shop Transfer', 40.7128, -74.0060, 50,
            25.00, 'friend@example.com', 'Coffee money for when you visit NYC!', true, false
          )
        `

        sampleDataCreated = true
      }
    } catch (sampleError) {
      console.warn("Could not create sample data:", sampleError)
      // Continue without sample data
    }

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
      tablesCreated,
      sampleDataCreated,
      details: `Created ${tablesCreated.length} tables with performance indexes${sampleDataCreated ? " and sample data" : ""}`,
    })
  } catch (error) {
    console.error("Database setup failed:", error)
    return NextResponse.json({
      success: false,
      error: "Database setup failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
