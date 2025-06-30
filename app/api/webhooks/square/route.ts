import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { supabase, createTransaction } from "@/lib/supabase"

// Square webhook signature verification
function verifyWebhookSignature(body: string, signature: string, webhookSignatureKey: string): boolean {
  try {
    const hmac = crypto.createHmac("sha256", webhookSignatureKey)
    hmac.update(body)
    const expectedSignature = hmac.digest("base64")
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-square-hmacsha256-signature")
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY

    if (!webhookSignatureKey) {
      console.error("SQUARE_WEBHOOK_SIGNATURE_KEY not configured")
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    if (!signature) {
      console.error("Missing webhook signature")
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, webhookSignatureKey)) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log("Square webhook received:", event.type)

    // Handle different webhook events
    switch (event.type) {
      case "payment.created":
        await handlePaymentCreated(event.data.object.payment)
        break

      case "payment.updated":
        await handlePaymentUpdated(event.data.object.payment)
        break

      case "refund.created":
        await handleRefundCreated(event.data.object.refund)
        break

      case "refund.updated":
        await handleRefundUpdated(event.data.object.refund)
        break

      case "dispute.created":
        await handleDisputeCreated(event.data.object.dispute)
        break

      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Square webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handlePaymentCreated(payment: any) {
  console.log("Payment created:", payment.id)

  try {
    if (payment.status === "COMPLETED") {
      const amountMoney = payment.amount_money
      const amount = amountMoney.amount / 100 // Convert from cents to dollars

      // Find transaction by Square payment ID
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("square_payment_id", payment.id)
        .limit(1)

      if (error) {
        console.error("Error finding transaction:", error)
        return
      }

      if (transactions && transactions.length > 0) {
        const transaction = transactions[0]

        // Update transaction status
        const { error: updateError } = await supabase
          .from("transactions")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", transaction.id)

        if (updateError) {
          console.error("Error updating transaction:", updateError)
        }

        console.log(`Payment ${payment.id} completed for $${amount}`)
      }
    }
  } catch (error) {
    console.error("Error handling payment created:", error)
  }
}

async function handlePaymentUpdated(payment: any) {
  console.log("Payment updated:", payment.id, "Status:", payment.status)

  try {
    if (payment.status === "FAILED" || payment.status === "CANCELED") {
      // Find and update transaction
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("square_payment_id", payment.id)
        .limit(1)

      if (error) {
        console.error("Error finding transaction:", error)
        return
      }

      if (transactions && transactions.length > 0) {
        const transaction = transactions[0]

        // Update transaction status
        const { error: updateError } = await supabase
          .from("transactions")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", transaction.id)

        if (updateError) {
          console.error("Error updating transaction:", updateError)
        }

        // If it was a deposit, reverse the balance update
        if (transaction.type === "deposit") {
          const { data: users, error: userError } = await supabase
            .from("users")
            .select("balance")
            .eq("id", transaction.user_id)
            .limit(1)

          if (!userError && users && users.length > 0) {
            const user = users[0]
            const { error: balanceError } = await supabase
              .from("users")
              .update({
                balance: user.balance - transaction.amount,
                updated_at: new Date().toISOString(),
              })
              .eq("id", transaction.user_id)

            if (balanceError) {
              console.error("Error reversing balance:", balanceError)
            }
          }
        }

        console.log(`Payment ${payment.id} failed - transaction updated`)
      }
    }
  } catch (error) {
    console.error("Error handling payment updated:", error)
  }
}

async function handleRefundCreated(refund: any) {
  console.log("Refund created:", refund.id)

  try {
    const amountMoney = refund.amount_money
    const amount = amountMoney.amount / 100

    // Find original transaction by payment ID
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("square_payment_id", refund.payment_id)
      .limit(1)

    if (error) {
      console.error("Error finding original transaction:", error)
      return
    }

    if (transactions && transactions.length > 0) {
      const originalTransaction = transactions[0]

      // Create refund transaction record
      const refundTransactionData = {
        user_id: originalTransaction.user_id,
        type: "refund" as const,
        amount: amount,
        fee: 0,
        description: `Refund for transaction ${originalTransaction.id}`,
        status: "pending" as const,
        square_payment_id: refund.id,
        metadata: {
          original_transaction_id: originalTransaction.id,
          refund_reason: refund.reason || "Customer request",
        },
      }

      await createTransaction(refundTransactionData)
      console.log(`Refund ${refund.id} created for $${amount}`)
    }
  } catch (error) {
    console.error("Error handling refund created:", error)
  }
}

async function handleRefundUpdated(refund: any) {
  console.log("Refund updated:", refund.id, "Status:", refund.status)

  try {
    if (refund.status === "COMPLETED") {
      // Find refund transaction
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("square_payment_id", refund.id)
        .limit(1)

      if (error) {
        console.error("Error finding refund transaction:", error)
        return
      }

      if (transactions && transactions.length > 0) {
        const refundTransaction = transactions[0]

        // Update refund transaction status
        const { error: updateError } = await supabase
          .from("transactions")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", refundTransaction.id)

        if (updateError) {
          console.error("Error updating refund transaction:", updateError)
        }

        // Update user balance (add refund amount)
        const { data: users, error: userError } = await supabase
          .from("users")
          .select("balance")
          .eq("id", refundTransaction.user_id)
          .limit(1)

        if (!userError && users && users.length > 0) {
          const user = users[0]
          const { error: balanceError } = await supabase
            .from("users")
            .update({
              balance: user.balance + refundTransaction.amount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", refundTransaction.user_id)

          if (balanceError) {
            console.error("Error updating balance for refund:", balanceError)
          }
        }

        console.log(`Refund ${refund.id} completed`)
      }
    }
  } catch (error) {
    console.error("Error handling refund updated:", error)
  }
}

async function handleDisputeCreated(dispute: any) {
  console.log("Dispute created:", dispute.id)

  try {
    // Find transaction by payment ID
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("square_payment_id", dispute.payment_id)
      .limit(1)

    if (error) {
      console.error("Error finding disputed transaction:", error)
      return
    }

    if (transactions && transactions.length > 0) {
      const transaction = transactions[0]

      // Create dispute record (you might want a separate disputes table)
      const disputeTransactionData = {
        user_id: transaction.user_id,
        type: "dispute" as const,
        amount: -transaction.amount, // Negative amount for dispute
        fee: 0,
        description: `Dispute for transaction ${transaction.id}`,
        status: "pending" as const,
        square_payment_id: dispute.id,
        metadata: {
          original_transaction_id: transaction.id,
          dispute_reason: dispute.reason_code || "Unknown",
          dispute_state: dispute.state,
        },
      }

      await createTransaction(disputeTransactionData)

      // You might want to freeze the disputed amount or notify admins
      console.log(`Dispute ${dispute.id} created for payment ${dispute.payment_id}`)
    }
  } catch (error) {
    console.error("Error handling dispute created:", error)
  }
}
