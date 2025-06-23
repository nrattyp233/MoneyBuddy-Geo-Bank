import { type NextRequest, NextResponse } from "next/server"
import RealPaymentProcessor from "@/lib/real-payment-processor"

export async function POST(request: NextRequest) {
  try {
    const { fromUserId, toUserId, amount, description, restrictions } = await request.json()

    // Validate input
    if (!fromUserId || !toUserId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (fromUserId === toUserId) {
      return NextResponse.json({ error: "Cannot transfer to yourself" }, { status: 400 })
    }

    // Process the transfer
    const transactionId = await RealPaymentProcessor.processRealTransfer(
      fromUserId,
      toUserId,
      amount,
      description,
      restrictions,
    )

    return NextResponse.json({ transactionId })
  } catch (error) {
    console.error("Transfer API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
