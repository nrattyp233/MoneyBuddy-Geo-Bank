import { type NextRequest, NextResponse } from "next/server"
import RealPaymentProcessor from "@/lib/real-payment-processor"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-dwolla-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // Parse Dwolla webhook event
    const event = JSON.parse(body)

    // Handle the webhook event
    await RealPaymentProcessor.handleWebhook("dwolla", event.topic, event._embedded)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Dwolla webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}
