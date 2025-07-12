import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      console.error("Auth registration error:", authError)
      
      // Handle specific error cases
      if (authError.message?.includes("already been registered") || authError.code === "email_exists") {
        return NextResponse.json(
          { error: "An account with this email already exists. Please try logging in instead." },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: authError.message || "Failed to create authentication account" },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 400 }
      )
    }

    // Create user record in database using admin client (bypasses RLS)
    const { data: userData, error: dbError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        name,
        phone: phone || null,
        balance: 0,
        savings_balance: 0,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database user creation error:", dbError)
      
      // Clean up the auth user if database creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "User registered successfully",
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
