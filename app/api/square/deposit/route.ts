import { type NextRequest, NextResponse } from "next/server"
import { supabase, createTransaction, getUserByEmail } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { amount, cardNumber, expiryDate, cvv, cardholderName, userEmail } = await req.json()

    // Validate required fields
    if (!amount || !cardNumber || !expiryDate || !cvv || !cardholderName || !userEmail) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    // Validate amount
    if (amount < 1 || amount > 10000) {
      return NextResponse.json({ success: false, error: "Amount must be between $1 and $10,000" }, { status: 400 })
    }

    // Check Square configuration
    if (!process.env.SQUARE_ACCESS_TOKEN || !process.env.SQUARE_APPLICATION_ID || !process.env.SQUARE_LOCATION_ID) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment processing not configured",
        },
        { status: 500 },
      )
    }

    // Get user from database
    const user = await getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // In production, you would process with Square here
    /*
    const { Client, Environment } = require('squareup')
    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox
    })

    const paymentsApi = client.paymentsApi
    const requestBody = {
      sourceId: 'card-nonce-from-square-web-sdk', // This would come from Square Web SDK
      amountMoney: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD'
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      idempotencyKey: `deposit_${user.id}_${Date.now()}`,
      note: `Money Buddy deposit for user ${user.id}`
    }

    const { result, statusCode } = await paymentsApi.createPayment(requestBody)
    */

    // For demo purposes, simulate payment processing
    const paymentResult = {
      id: `sq_payment_${Date.now()}`,
      status: "COMPLETED",
      amount: amount,
      currency: "USD",
      location_id: process.env.SQUARE_LOCATION_ID,
      created_at: new Date().toISOString(),
      card: {
        last_four: cardNumber.slice(-4),
        brand: cardNumber.startsWith("4") ? "VISA" : cardNumber.startsWith("5") ? "MASTERCARD" : "UNKNOWN",
      },
    }

    // Update user's balance in Supabase
    const newBalance = user.balance + amount
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
      type: "deposit" as const,
      amount: amount,
      fee: 0,
      description: `Square deposit via ${paymentResult.card.brand} ending in ${paymentResult.card.last_four}`,
      status: "completed" as const,
      square_payment_id: paymentResult.id,
      metadata: {
        card_brand: paymentResult.card.brand,
        card_last_four: paymentResult.card.last_four,
        location_id: process.env.SQUARE_LOCATION_ID,
        cardholder_name: cardholderName,
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

      return NextResponse.json({ success: false, error: "Failed to process deposit" }, { status: 500 })
    }

    // Create notification for user
    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Deposit Successful",
      message: `$${amount.toFixed(2)} has been added to your account via ${paymentResult.card.brand} ending in ${
        paymentResult.card.last_four
      }`,
      type: "transaction",
      is_read: false,
      metadata: {
        transaction_id: transaction.id,
        amount: amount,
        payment_method: `${paymentResult.card.brand} ****${paymentResult.card.last_four}`,
      },
    })

    if (notificationError) {
      console.error("Error creating notification:", notificationError)
    }

    console.log("Square deposit processed successfully:", {
      userId: user.id,
      amount,
      newBalance,
      paymentId: paymentResult.id,
      locationId: process.env.SQUARE_LOCATION_ID,
    })

    return NextResponse.json({
      success: true,
      payment: paymentResult,
      newBalance: newBalance,
      transaction: transaction,
      message: "Deposit processed successfully",
    })
  } catch (error) {
    console.error("Square deposit error:", error)
    return NextResponse.json({ success: false, error: "Payment processing failed" }, { status: 500 })
  }
}
