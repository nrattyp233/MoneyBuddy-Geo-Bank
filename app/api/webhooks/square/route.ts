import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

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
    // Update user's wallet balance in database
    if (payment.status === "COMPLETED") {
      const amountMoney = payment.amount_money
      const amount = amountMoney.amount / 100 // Convert from cents to dollars

      // Here you would update your database
      // Example: Update user balance, create transaction record
      console.log(`Processing deposit of $${amount} for payment ${payment.id}`)

      // You could also send confirmation emails, push notifications, etc.
    }
  } catch (error) {
    console.error("Error handling payment created:", error)
  }
}

async function handlePaymentUpdated(payment: any) {
  console.log("Payment updated:", payment.id, "Status:", payment.status)

  try {
    if (payment.status === "FAILED" || payment.status === "CANCELED") {
      // Handle failed payments
      console.log(`Payment ${payment.id} failed or was canceled`)
      // Notify user, reverse any provisional balance updates, etc.
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

    // Process refund in your system
    console.log(`Processing refund of $${amount} for refund ${refund.id}`)
    // Update user balance, create refund transaction record, etc.
  } catch (error) {
    console.error("Error handling refund created:", error)
  }
}

async function handleRefundUpdated(refund: any) {
  console.log("Refund updated:", refund.id, "Status:", refund.status)

  try {
    if (refund.status === "COMPLETED") {
      // Refund completed successfully
      console.log(`Refund ${refund.id} completed`)
    }
  } catch (error) {
    console.error("Error handling refund updated:", error)
  }
}

async function handleDisputeCreated(dispute: any) {
  console.log("Dispute created:", dispute.id)

  try {
    // Handle payment disputes/chargebacks
    console.log(`New dispute ${dispute.id} for payment ${dispute.payment_id}`)
    // Notify admin, freeze related funds, etc.
  } catch (error) {
    console.error("Error handling dispute created:", error)
  }
}
