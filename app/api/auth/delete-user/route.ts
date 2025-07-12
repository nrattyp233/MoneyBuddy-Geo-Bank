import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Delete user from Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (authError) {
      console.error("Error deleting auth user:", authError)
      return NextResponse.json({ error: "Failed to delete auth user" }, { status: 500 })
    }

    // Delete user from database
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId)

    if (dbError) {
      console.error("Error deleting database user:", dbError)
      // Auth user is already deleted, so we'll just log this error
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
