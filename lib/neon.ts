import { neon } from "@neondatabase/serverless"

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL!)

// Type definitions
export interface User {
  id: string
  email: string
  name: string
  balance: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: "deposit" | "withdrawal" | "transfer" | "geofence"
  amount: number
  description: string
  status: "pending" | "completed" | "failed"
  square_payment_id?: string
  square_fee?: number
  created_at: string
  updated_at: string
}

export interface Geofence {
  id: string
  user_id: string
  name: string
  center_lat: number
  center_lng: number
  radius: number
  amount: number
  recipient_email: string
  recipient_id: string
  memo?: string
  is_active: boolean
  is_claimed: boolean
  claimed_at?: string
  created_at: string
  updated_at: string
}

export interface SavingsLock {
  id: string
  user_id: string
  amount: number
  locked_until: string
  interest_rate: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Database connection check
export async function checkConnection(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("Database not configured – set DATABASE_URL")
    }
    await sql`SELECT 1`
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// User functions
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const users = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `
    return users[0] || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const users = await sql`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `
    return users[0] || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function createUser(userData: Omit<User, "id" | "created_at" | "updated_at">): Promise<User | null> {
  try {
    const users = await sql`
      INSERT INTO users (email, name, balance)
      VALUES (${userData.email}, ${userData.name}, ${userData.balance})
      RETURNING *
    `
    return users[0] || null
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function updateUserBalance(userId: string, newBalance: number): Promise<boolean> {
  try {
    await sql`
      UPDATE users 
      SET balance = ${newBalance}, updated_at = NOW()
      WHERE id = ${userId}
    `
    return true
  } catch (error) {
    console.error("Error updating user balance:", error)
    return false
  }
}

// Transaction functions
export async function createTransaction(
  transactionData: Omit<Transaction, "id" | "created_at" | "updated_at">,
): Promise<Transaction | null> {
  try {
    const transactions = await sql`
      INSERT INTO transactions (user_id, type, amount, description, status, square_payment_id, square_fee)
      VALUES (${transactionData.user_id}, ${transactionData.type}, ${transactionData.amount}, 
              ${transactionData.description}, ${transactionData.status}, 
              ${transactionData.square_payment_id || null}, ${transactionData.square_fee || null})
      RETURNING *
    `
    return transactions[0] || null
  } catch (error) {
    console.error("Error creating transaction:", error)
    return null
  }
}

export async function getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
  try {
    const transactions = await sql`
      SELECT * FROM transactions 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return transactions
  } catch (error) {
    console.error("Error getting user transactions:", error)
    return []
  }
}

export async function updateTransactionStatus(transactionId: string, status: Transaction["status"]): Promise<boolean> {
  try {
    await sql`
      UPDATE transactions 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${transactionId}
    `
    return true
  } catch (error) {
    console.error("Error updating transaction status:", error)
    return false
  }
}

// Geofence functions
export async function createGeofence(
  geofenceData: Omit<Geofence, "id" | "created_at" | "updated_at">,
): Promise<Geofence | null> {
  try {
    const geofences = await sql`
      INSERT INTO geofences (user_id, name, center_lat, center_lng, radius, amount, 
                           recipient_email, recipient_id, memo, is_active, is_claimed)
      VALUES (${geofenceData.user_id}, ${geofenceData.name}, ${geofenceData.center_lat}, 
              ${geofenceData.center_lng}, ${geofenceData.radius}, ${geofenceData.amount},
              ${geofenceData.recipient_email}, ${geofenceData.recipient_id}, 
              ${geofenceData.memo || null}, ${geofenceData.is_active}, ${geofenceData.is_claimed})
      RETURNING *
    `
    return geofences[0] || null
  } catch (error) {
    console.error("Error creating geofence:", error)
    return null
  }
}

export async function getUserGeofences(userId: string): Promise<Geofence[]> {
  try {
    const geofences = await sql`
      SELECT * FROM geofences 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return geofences
  } catch (error) {
    console.error("Error getting user geofences:", error)
    return []
  }
}

export async function getActiveGeofences(): Promise<Geofence[]> {
  try {
    const geofences = await sql`
      SELECT * FROM geofences 
      WHERE is_active = true AND is_claimed = false
      ORDER BY created_at DESC
    `
    return geofences
  } catch (error) {
    console.error("Error getting active geofences:", error)
    return []
  }
}

export async function claimGeofence(geofenceId: string): Promise<boolean> {
  try {
    await sql`
      UPDATE geofences 
      SET is_claimed = true, claimed_at = NOW(), updated_at = NOW()
      WHERE id = ${geofenceId}
    `
    return true
  } catch (error) {
    console.error("Error claiming geofence:", error)
    return false
  }
}

// Savings Lock functions
export async function createSavingsLock(
  savingsData: Omit<SavingsLock, "id" | "created_at" | "updated_at">,
): Promise<SavingsLock | null> {
  try {
    const savings = await sql`
      INSERT INTO savings_locks (user_id, amount, locked_until, interest_rate, is_active)
      VALUES (${savingsData.user_id}, ${savingsData.amount}, ${savingsData.locked_until}, 
              ${savingsData.interest_rate}, ${savingsData.is_active})
      RETURNING *
    `
    return savings[0] || null
  } catch (error) {
    console.error("Error creating savings lock:", error)
    return null
  }
}

export async function getUserSavingsLocks(userId: string): Promise<SavingsLock[]> {
  try {
    const savings = await sql`
      SELECT * FROM savings_locks 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return savings
  } catch (error) {
    console.error("Error getting user savings locks:", error)
    return []
  }
}

export async function getExpiredSavingsLocks(): Promise<SavingsLock[]> {
  try {
    const savings = await sql`
      SELECT * FROM savings_locks 
      WHERE is_active = true AND locked_until <= NOW()
      ORDER BY locked_until ASC
    `
    return savings
  } catch (error) {
    console.error("Error getting expired savings locks:", error)
    return []
  }
}

// Database utility functions
export async function getTables(): Promise<string[]> {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    return tables.map((row: any) => row.table_name)
  } catch (error) {
    console.error("Error getting tables:", error)
    return []
  }
}

export async function getTableRowCount(tableName: string): Promise<number> {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM ${sql(tableName)}`
    return Number.parseInt(result[0].count)
  } catch (error) {
    console.error(`Error getting row count for ${tableName}:`, error)
    return 0
  }
}
