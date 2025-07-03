import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    const results = []
    const errors = []

    // Create users table
    try {
      const { error: usersError } = await supabase.rpc("exec", {
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(255),
            balance DECIMAL(10,2) DEFAULT 0.00,
            savings_balance DECIMAL(10,2) DEFAULT 0.00,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (usersError) {
        // Try alternative approach using direct table creation
        const { error: directError } = await supabase.from("users").select("id").limit(1)

        if (directError && directError.message.includes("does not exist")) {
          // Table doesn't exist, we need to create it via SQL
          errors.push("Users table creation failed: " + usersError.message)
        }
      } else {
        results.push("Users table created successfully")
      }
    } catch (err) {
      errors.push("Users table error: " + (err instanceof Error ? err.message : "Unknown"))
    }

    // Create transactions table
    try {
      const { error: transactionsError } = await supabase.rpc("exec", {
        sql: `
          CREATE TABLE IF NOT EXISTS transactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'geofence')),
            amount DECIMAL(10,2) NOT NULL,
            fee DECIMAL(10,2) DEFAULT 0.00,
            status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
            description TEXT,
            recipient_email VARCHAR(255),
            square_payment_id VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (!transactionsError) {
        results.push("Transactions table created successfully")
      } else {
        errors.push("Transactions table creation failed: " + transactionsError.message)
      }
    } catch (err) {
      errors.push("Transactions table error: " + (err instanceof Error ? err.message : "Unknown"))
    }

    // Create geofences table
    try {
      const { error: geofencesError } = await supabase.rpc("exec", {
        sql: `
          CREATE TABLE IF NOT EXISTS geofences (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
          );
        `,
      })

      if (!geofencesError) {
        results.push("Geofences table created successfully")
      } else {
        errors.push("Geofences table creation failed: " + geofencesError.message)
      }
    } catch (err) {
      errors.push("Geofences table error: " + (err instanceof Error ? err.message : "Unknown"))
    }

    // Create savings_locks table
    try {
      const { error: savingsError } = await supabase.rpc("exec", {
        sql: `
          CREATE TABLE IF NOT EXISTS savings_locks (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            interest_rate DECIMAL(5,4) NOT NULL,
            lock_duration_days INTEGER NOT NULL,
            locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            unlocks_at TIMESTAMP WITH TIME ZONE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (!savingsError) {
        results.push("Savings locks table created successfully")
      } else {
        errors.push("Savings locks table creation failed: " + savingsError.message)
      }
    } catch (err) {
      errors.push("Savings locks table error: " + (err instanceof Error ? err.message : "Unknown"))
    }

    // Create indexes
    try {
      const { error: indexError } = await supabase.rpc("exec", {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
          CREATE INDEX IF NOT EXISTS idx_geofences_user_id ON geofences(user_id);
          CREATE INDEX IF NOT EXISTS idx_geofences_location ON geofences(center_lat, center_lng);
          CREATE INDEX IF NOT EXISTS idx_savings_locks_user_id ON savings_locks(user_id);
        `,
      })

      if (!indexError) {
        results.push("Database indexes created successfully")
      }
    } catch (err) {
      // Indexes are optional, don't fail the whole setup
      console.log("Index creation warning:", err)
    }

    // Create sample data
    try {
      const { error: sampleError } = await supabase.from("users").upsert(
        [
          {
            email: "demo@moneybuddy.com",
            full_name: "Demo User",
            balance: 2500.0,
            savings_balance: 1000.0,
          },
        ],
        { onConflict: "email" },
      )

      if (!sampleError) {
        results.push("Sample user created successfully")

        // Create sample geofence
        const { data: userData } = await supabase.from("users").select("id").eq("email", "demo@moneybuddy.com").single()

        if (userData) {
          const { error: geofenceError } = await supabase.from("geofences").upsert([
            {
              user_id: userData.id,
              name: "Coffee Shop Transfer",
              center_lat: 40.7128,
              center_lng: -74.006,
              radius: 50,
              amount: 25.0,
              recipient_email: "friend@example.com",
              memo: "Coffee money for when you're near the shop!",
            },
          ])

          if (!geofenceError) {
            results.push("Sample geofence created successfully")
          }
        }
      }
    } catch (err) {
      // Sample data is optional
      console.log("Sample data warning:", err)
    }

    // If we have more successes than errors, consider it successful
    const success = results.length > errors.length

    return NextResponse.json({
      success,
      message: success ? "Database setup completed successfully" : "Database setup completed with some issues",
      results,
      errors,
      tablesCreated: results.filter((r) => r.includes("table created")).length,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Setup failed",
      details: error instanceof Error ? error.message : "Unknown error",
      results: [],
      errors: [error instanceof Error ? error.message : "Unknown error"],
    })
  }
}
