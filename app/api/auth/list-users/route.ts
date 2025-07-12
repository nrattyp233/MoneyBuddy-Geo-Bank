import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Get all auth users (for debugging)
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error("Error listing users:", error)
      return NextResponse.json({ error: "Failed to list users" }, { status: 500 })
    }

    // Return only email addresses for privacy
    const emails = users.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at
    }))

    return NextResponse.json({ users: emails })
  } catch (error) {
    console.error("List users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
