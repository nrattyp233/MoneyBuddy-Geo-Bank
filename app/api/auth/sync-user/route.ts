import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { userId, name, phone } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Get user from Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: "User not found in authentication system" },
        { status: 404 }
      )
    }

    // Check if user already exists in database by ID
    const { data: existingUserById, error: checkByIdError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (existingUserById) {
      return NextResponse.json({
        message: "User already exists in database",
        user: existingUserById,
      })
    }

    // Check if user exists by email (might be a different ID)
    const { data: existingUserByEmail, error: checkByEmailError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", authUser.user.email!)
      .single()

    if (existingUserByEmail) {
      // Update the existing record with the correct auth ID
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          id: userId,
          name: name || authUser.user.user_metadata?.full_name || existingUserByEmail.name,
          phone: phone || existingUserByEmail.phone,
        })
        .eq("email", authUser.user.email!)
        .select()
        .single()

      if (updateError) {
        console.error("Database user update error:", updateError)
        return NextResponse.json(
          { error: "Failed to update existing user profile" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: "User updated successfully",
        user: updatedUser,
      })
    }

    // Create user record in database
    const { data: userData, error: dbError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId,
        email: authUser.user.email!,
        name: name || authUser.user.user_metadata?.full_name || "User",
        phone: phone || null,
        balance: 0,
        savings_balance: 0,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database user creation error:", dbError)
      return NextResponse.json(
        { error: "Failed to create user profile in database" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "User synced successfully",
      user: userData,
    })
  } catch (error) {
    console.error("User sync error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
