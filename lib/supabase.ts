import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role key
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Database types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  balance: number
  savings_balance: number
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  account_number: string
  account_type: "checking" | "savings"
  balance: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id?: string
  type: "deposit" | "withdrawal" | "transfer" | "geofence_transfer"
  amount: number
  fee: number
  description?: string
  recipient_email?: string
  recipient_id?: string
  status: "pending" | "completed" | "failed" | "cancelled"
  square_payment_id?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
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
  lock_duration: number
  interest_rate: number
  locked_at: string
  unlocks_at: string
  is_unlocked: boolean
  unlocked_at?: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  message: string
  response: string
  session_id?: string
  created_at: string
}

export interface PaymentMethod {
  id: string
  user_id: string
  type: "card" | "bank_account"
  provider: string
  provider_id: string
  last_four?: string
  brand?: string
  is_default: boolean
  is_active: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "transaction" | "geofence" | "savings" | "security"
  is_read: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

// Helper functions
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error) {
    console.error("Error fetching user by email:", error)
    return null
  }

  return data
}

export async function createUser(userData: Omit<User, "id" | "created_at" | "updated_at">): Promise<User | null> {
  const { data, error } = await supabase.from("users").insert(userData).select().single()

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  return data
}

export async function getUserTransactions(userId: string, limit = 10): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }

  return data || []
}

export async function createTransaction(
  transactionData: Omit<Transaction, "id" | "created_at" | "updated_at">,
): Promise<Transaction | null> {
  const { data, error } = await supabase.from("transactions").insert(transactionData).select().single()

  if (error) {
    console.error("Error creating transaction:", error)
    return null
  }

  return data
}

export async function getUserGeofences(userId: string): Promise<Geofence[]> {
  const { data, error } = await supabase
    .from("geofences")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching geofences:", error)
    return []
  }

  return data || []
}

export async function createGeofence(
  geofenceData: Omit<Geofence, "id" | "created_at" | "updated_at">,
): Promise<Geofence | null> {
  const { data, error } = await supabase.from("geofences").insert(geofenceData).select().single()

  if (error) {
    console.error("Error creating geofence:", error)
    return null
  }

  return data
}

export async function getActiveGeofencesAtLocation(lat: number, lng: number): Promise<Geofence[]> {
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

export async function getUserSavingsLocks(userId: string): Promise<SavingsLock[]> {
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

export async function createSavingsLock(
  lockData: Omit<SavingsLock, "id" | "created_at" | "updated_at">,
): Promise<SavingsLock | null> {
  const { data, error } = await supabase.from("savings_locks").insert(lockData).select().single()

  if (error) {
    console.error("Error creating savings lock:", error)
    return null
  }

  return data
}

export async function getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching notifications:", error)
    return []
  }

  return data || []
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

  if (error) {
    console.error("Error marking notification as read:", error)
    return false
  }

  return true
}
