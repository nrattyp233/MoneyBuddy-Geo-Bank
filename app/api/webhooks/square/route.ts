import { type NextRequest, NextResponse } from "next/server"
import RealPaymentProcessor from "@/lib/real-payment-processor"
import { WebhookSecurity } from "@/lib/webhook-security"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-square-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // Verify webhook signature in production
    if (process.env.NODE_ENV === "production") {
      const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
      const notificationUrl = `${request.nextUrl.origin}/api/webhooks/square`

      if (!signatureKey) {
        return NextResponse.json({ error: "Webhook signature key not configured" }, { status: 500 })
      }

      const isValid = WebhookSecurity.verifySquareWebhook(body, signature, signatureKey, notificationUrl)

      if (!isValid) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
      }
    }

    // Parse Square webhook event
    const event = JSON.parse(body)

    console.log("Square webhook received:", {
      eventType: event.type,
      merchantId: event.merchant_id,
      eventId: event.event_id,
    })

    // Handle the webhook event
    await RealPaymentProcessor.handleWebhook("square", event.type, event.data)

    return NextResponse.json({
      received: true,
      eventId: event.event_id,
      eventType: event.type,
    })
  } catch (error) {
    console.error("Square webhook error:", error)
    return NextResponse.json(
      {
        error: "Webhook handler failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Square webhook endpoint active",
    timestamp: new Date().toISOString(),
  })
}
