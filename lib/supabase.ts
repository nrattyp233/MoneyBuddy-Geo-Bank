import { createClient } from "@supabase/supabase-js"

// Environment variable helper
function getEnv() {
  if (typeof window === "undefined") {
    // Server-side: use regular env vars
    return {
      url: process.env.SUPABASE_URL || "",
      anonKey: process.env.SUPABASE_ANON_KEY || "",
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    }
  } else {
    // Client-side: use public env vars
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      serviceKey: "", // Not available on client
    }
  }
}

const env = getEnv()

// Only create clients if we have the required environment variables
let supabase: any = null
let supabaseAdmin: any = null

if (env.url && env.anonKey) {
  // Client for general use (works on both server and client)
  supabase = createClient(env.url, env.anonKey)

  // Admin client (server-only)
  if (typeof window === "undefined" && env.serviceKey) {
    supabaseAdmin = createClient(env.url, env.serviceKey)
  }
}

// Export with null checks
export { supabase, supabaseAdmin }

// Types
export interface User {
  id: string
  email: string
  full_name?: string
  balance: number
  savings_balance: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: "deposit" | "withdrawal" | "transfer" | "geofence"
  amount: number
  fee: number
  status: "pending" | "completed" | "failed"
  description: string
  recipient_email?: string
  square_payment_id?: string
  created_at: string
}

export interface Geofence {
  id: string
  user_id: string
  transaction_id?: string
  name: string
  center_lat: number
  center_lng: number
  radius: number
  amount: number
  recipient_email: string
  recipient_id?: string
  memo?: string
  is_active: boolean
  is_claimed: boolean
  claimed_at?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface SavingsLock {
  id: string
  user_id: string
  amount: number
  interest_rate: number
  lock_duration_days: number
  locked_at: string
  unlocks_at: string
  is_active: boolean
  created_at: string
}

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(env.url && env.anonKey)
}

// User functions
export async function getUserByEmail(email: string): Promise<User | null> {
  if (!supabase) {
    console.error("Supabase not configured")
    return null
  }

  const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

export async function createUser(userData: Partial<User>): Promise<User | null> {
  if (!supabase) {
    console.error("Supabase not configured")
    return null
  }

  const { data, error } = await supabase.from("users").insert([userData]).select().single()

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  return data
}

export async function updateUserBalance(userId: string, newBalance: number): Promise<boolean> {
  if (!supabase) {
    console.error("Supabase not configured")
    return false
  }

  const { error } = await supabase
    .from("users")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) {
    console.error("Error updating user balance:", error)
    return false
  }

  return true
}

// Transaction functions
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  if (!supabase) {
    console.error("Supabase not configured")
    return []
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }

  return data || []
}

export async function createTransaction(transactionData: Partial<Transaction>): Promise<Transaction | null> {
  if (!supabase) {
    console.error("Supabase not configured")
    return null
  }

  const { data, error } = await supabase.from("transactions").insert([transactionData]).select().single()

  if (error) {
    console.error("Error creating transaction:", error)
    return null
  }

  return data
}

export async function updateTransactionStatus(transactionId: string, status: Transaction["status"]): Promise<boolean> {
  if (!supabase) {
    console.error("Supabase not configured")
    return false
  }

  const { error } = await supabase.from("transactions").update({ status }).eq("id", transactionId)

  if (error) {
    console.error("Error updating transaction status:", error)
    return false
  }

  return true
}

// Geofence functions
export async function getUserGeofences(userId: string): Promise<Geofence[]> {
  if (!supabase) {
    console.error("Supabase not configured")
    return []
  }

  const { data, error } = await supabase
    .from("geofences")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching geofences:", error)
    return []
  }

  return data || []
}

export async function createGeofence(geofenceData: Partial<Geofence>): Promise<Geofence | null> {
  if (!supabase) {
    console.error("Supabase not configured")
    return null
  }

  const { data, error } = await supabase.from("geofences").insert([geofenceData]).select().single()

  if (error) {
    console.error("Error creating geofence:", error)
    return null
  }

  return data
}

export async function getActiveGeofencesAtLocation(lat: number, lng: number): Promise<Geofence[]> {
  if (!supabase) {
    console.error("Supabase not configured")
    return []
  }

  const { data, error } = await supabase.rpc("get_active_geofences_at_location", {
    check_lat: lat,
    check_lng: lng,
  })

  if (error) {
    console.error("Error fetching geofences at location:", error)
    return []
  }

  return data || []
}

export async function claimGeofence(geofenceId: string): Promise<boolean> {
  if (!supabase) {
    console.error("Supabase not configured")
    return false
  }

  const { error } = await supabase
    .from("geofences")
    .update({
      is_claimed: true,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", geofenceId)

  if (error) {
    console.error("Error claiming geofence:", error)
    return false
  }

  return true
}

// Savings functions
export async function getUserSavingsLocks(userId: string): Promise<SavingsLock[]> {
  if (!supabase) {
    console.error("Supabase not configured")
    return []
  }

  const { data, error } = await supabase
    .from("savings_locks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching savings locks:", error)
    return []
  }

  return data || []
}

export async function createSavingsLock(lockData: Partial<SavingsLock>): Promise<SavingsLock | null> {
  if (!supabase) {
    console.error("Supabase not configured")
    return null
  }

  const { data, error } = await supabase.from("savings_locks").insert([lockData]).select().single()

  if (error) {
    console.error("Error creating savings lock:", error)
    return null
  }

  return data
}
