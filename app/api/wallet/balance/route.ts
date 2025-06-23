import { type NextRequest, NextResponse } from "next/server"
import RealPaymentProcessor from "@/lib/real-payment-processor"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    // Get wallet balance
    const balance = await RealPaymentProcessor.getWalletBalance(userId)

    return NextResponse.json({ balance })
  } catch (error) {
    console.error("Balance API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
