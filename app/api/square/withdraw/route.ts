import { type NextRequest, NextResponse } from "next/server"
import { supabase, createTransaction, getUserByEmail } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { amount, method, bankDetails, userEmail } = await req.json()

    if (!amount || !userEmail || !method) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (amount < 1) {
      return NextResponse.json({ success: false, error: "Minimum withdrawal amount is $1" }, { status: 400 })
    }

    // Check if Square Location ID is configured
    if (!process.env.SQUARE_LOCATION_ID) {
      console.error("SQUARE_LOCATION_ID environment variable is not set")
      return NextResponse.json(
        {
          success: false,
          error: "Payment processing not configured. Please contact support.",
        },
        { status: 500 },
      )
    }

    // Get user from database
    const user = await getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Calculate fee based on method
    const fee = method === "instant" ? 1.5 : method === "card" ? 1.0 : 0
    const totalDeducted = amount + fee

    // Check if user has sufficient funds
    if (user.balance < totalDeducted) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient funds",
          required: totalDeducted,
          available: user.balance,
          shortfall: totalDeducted - user.balance,
        },
        { status: 400 },
      )
    }

    // Validate bank details for bank transfers
    if (
      method === "bank" &&
      (!bankDetails || !bankDetails.accountHolder || !bankDetails.routingNumber || !bankDetails.accountNumber)
    ) {
      return NextResponse.json({ success: false, error: "Bank account details are required" }, { status: 400 })
    }

    // In production, you would process with Square here
    // Example Square payout integration:
    /*
    const { Client, Environment } = require('squareup')
    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox
    })

    const payoutsApi = client.payoutsApi
    const requestBody = {
      locationId: process.env.SQUARE_LOCATION_ID, // This is where the Location ID is used
      amountMoney: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD'
      },
      destination: {
        type: method === 'bank' ? 'BANK_ACCOUNT' : 'CARD',
        id: bankDetails.id // This would be a stored payment method ID
      },
      idempotencyKey: `withdrawal_${user.id}_${Date.now()}`
    }

    const { result, statusCode } = await payoutsApi.createPayout(requestBody)
    */

    // For demo purposes, simulate withdrawal processing
    const withdrawalResult = {
      id: `sq_withdrawal_${Date.now()}`,
      status: method === "bank" ? "PENDING" : "PROCESSING",
      amount: amount,
      fee: fee,
      currency: "USD",
      method: method,
      location_id: process.env.SQUARE_LOCATION_ID, // Include location ID in response
      estimated_arrival: method === "instant" ? "Within minutes" : method === "card" ? "Instant" : "1-2 business days",
      created_at: new Date().toISOString(),
    }

    // Update user's balance in Supabase
    const newBalance = user.balance - totalDeducted
    const { error: balanceError } = await supabase
      .from("users")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (balanceError) {
      console.error("Error updating user balance:", balanceError)
      return NextResponse.json({ success: false, error: "Failed to update balance" }, { status: 500 })
    }

    // Create transaction record
    const transactionData = {
      user_id: user.id,
      type: "withdrawal" as const,
      amount: amount,
      fee: fee,
      description: `Square withdrawal via ${method}`,
      status: "pending" as const,
      square_payment_id: withdrawalResult.id,
      metadata: {
        method: method,
        location_id: process.env.SQUARE_LOCATION_ID,
        bank_details: bankDetails
          ? {
              account_holder: bankDetails.accountHolder,
              routing_number: bankDetails.routingNumber,
              account_number_last_four: bankDetails.accountNumber?.slice(-4),
            }
          : null,
        estimated_arrival: withdrawalResult.estimated_arrival,
      },
    }

    const transaction = await createTransaction(transactionData)
    if (!transaction) {
      console.error("Failed to create transaction record")
      // Rollback balance change if transaction logging fails
      await supabase
        .from("users")
        .update({
          balance: user.balance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      return NextResponse.json({ success: false, error: "Failed to process withdrawal" }, { status: 500 })
    }

    // Create notification for user
    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Withdrawal Initiated",
      message: `$${amount.toFixed(2)} withdrawal is being processed. ${withdrawalResult.estimated_arrival}`,
      type: "transaction",
      is_read: false,
      metadata: {
        transaction_id: transaction.id,
        amount: amount,
        fee: fee,
        method: method,
        location_id: process.env.SQUARE_LOCATION_ID,
      },
    })

    if (notificationError) {
      console.error("Error creating notification:", notificationError)
    }

    console.log("Square withdrawal processed successfully:", {
      userId: user.id,
      amount,
      fee,
      method,
      locationId: process.env.SQUARE_LOCATION_ID,
      newBalance,
      withdrawalId: withdrawalResult.id,
    })

    return NextResponse.json({
      success: true,
      withdrawal: withdrawalResult,
      newBalance: newBalance,
      transaction: transaction,
      message: "Withdrawal initiated successfully",
    })
  } catch (error) {
    console.error("Square withdrawal error:", error)
    return NextResponse.json({ success: false, error: "Withdrawal processing failed" }, { status: 500 })
  }
}
