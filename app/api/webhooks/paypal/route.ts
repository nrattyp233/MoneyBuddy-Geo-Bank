import { type NextRequest, NextResponse } from "next/server"
import RealPaymentProcessor from "@/lib/real-payment-processor"
import { createClient } from "@supabase/supabase-js"

// Enhanced PayPal webhook verification
async function verifyPayPalWebhook(body: string, headers: Record<string, string>): Promise<boolean> {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (!webhookId) {
      console.error("PayPal webhook ID not configured")
      return false
    }

    // In production, implement full PayPal webhook verification
    // For now, we'll do basic header validation
    const requiredHeaders = [
      "paypal-transmission-id",
      "paypal-cert-id",
      "paypal-transmission-sig",
      "paypal-transmission-time",
      "paypal-auth-algo",
    ]

    const hasAllHeaders = requiredHeaders.every((header) => headers[header])
    if (!hasAllHeaders) {
      console.error("Missing required PayPal webhook headers")
      return false
    }

    // TODO: Implement full certificate verification in production
    // For now, accept webhooks with proper headers
    return true
  } catch (error) {
    console.error("PayPal webhook verification failed:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = {
      "paypal-transmission-id": request.headers.get("paypal-transmission-id") || "",
      "paypal-cert-id": request.headers.get("paypal-cert-id") || "",
      "paypal-transmission-sig": request.headers.get("paypal-transmission-sig") || "",
      "paypal-transmission-time": request.headers.get("paypal-transmission-time") || "",
      "paypal-auth-algo": request.headers.get("paypal-auth-algo") || "",
    }

    console.log("PayPal webhook received:", {
      webhookId: process.env.PAYPAL_WEBHOOK_ID ? "✅ Configured" : "❌ Missing",
      transmissionId: headers["paypal-transmission-id"],
      timestamp: headers["paypal-transmission-time"],
    })

    // Verify webhook signature in production
    if (process.env.NODE_ENV === "production") {
      const isValid = await verifyPayPalWebhook(body, headers)
      if (!isValid) {
        console.error("PayPal webhook verification failed")
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
      }
    }

    // Parse PayPal webhook event
    const event = JSON.parse(body)

    console.log("PayPal webhook event:", {
      eventType: event.event_type,
      resourceType: event.resource_type,
      summary: event.summary,
      eventId: event.id,
    })

    // Log webhook to database for monitoring
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    await supabase.from("webhook_events").insert({
      processor: "paypal",
      event_type: event.event_type,
      event_id: event.id,
      payload: event,
      processed_at: new Date().toISOString(),
      status: "received",
    })

    // Handle the webhook event
    await RealPaymentProcessor.handleWebhook("paypal", event.event_type, event.resource)

    // Update webhook status to processed
    await supabase
      .from("webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("event_id", event.id)

    console.log("✅ PayPal webhook processed successfully:", event.id)

    return NextResponse.json({
      received: true,
      eventId: event.id,
      eventType: event.event_type,
      webhookId: process.env.PAYPAL_WEBHOOK_ID ? "configured" : "missing",
      status: "processed",
    })
  } catch (error) {
    console.error("❌ PayPal webhook error:", error)

    // Log error to database
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

      await supabase.from("webhook_events").insert({
        processor: "paypal",
        event_type: "error",
        payload: { error: error instanceof Error ? error.message : "Unknown error" },
        status: "failed",
        processed_at: new Date().toISOString(),
      })
    } catch (dbError) {
      console.error("Failed to log webhook error:", dbError)
    }

    // Return 200 to prevent PayPal from retrying invalid requests
    return NextResponse.json(
      {
        error: "Webhook handler failed",
        message: error instanceof Error ? error.message : "Unknown error",
        webhookId: process.env.PAYPAL_WEBHOOK_ID ? "configured" : "missing",
      },
      { status: 200 },
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "PayPal webhook endpoint active",
    webhookId: process.env.PAYPAL_WEBHOOK_ID ? "✅ Configured" : "❌ Missing",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}
