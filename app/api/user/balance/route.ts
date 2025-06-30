import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userEmail = searchParams.get("email")

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Email parameter required" }, { status: 400 })
    }

    // Get user from database
    const user = await getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      balance: user.balance,
      savings_balance: user.savings_balance,
      user_id: user.id,
    })
  } catch (error) {
    console.error("Error fetching user balance:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch balance" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userEmail } = await req.json()

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Email required" }, { status: 400 })
    }

    // Get user from database
    const user = await getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      balance: user.balance,
      savings_balance: user.savings_balance,
      user_id: user.id,
    })
  } catch (error) {
    console.error("Error fetching user balance:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch balance" }, { status: 500 })
  }
}
