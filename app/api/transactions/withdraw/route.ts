import { type NextRequest, NextResponse } from "next/server"
import RealPaymentProcessor from "@/lib/real-payment-processor"

export async function POST(request: NextRequest) {
  try {
    const { userId, paymentMethodId, amount, description } = await request.json()

    // Validate input
    if (!userId || !paymentMethodId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0 || amount > 10000) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Process the withdrawal
    const transaction = await RealPaymentProcessor.processRealWithdrawal(userId, paymentMethodId, amount, description)

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Withdrawal API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
