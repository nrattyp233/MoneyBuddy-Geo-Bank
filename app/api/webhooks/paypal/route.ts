import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import crypto from "crypto"

// PayPal webhook event types we care about
const WEBHOOK_EVENTS = {
  PAYMENT_CAPTURE_COMPLETED: 'PAYMENT.CAPTURE.COMPLETED',
  PAYMENT_CAPTURE_DENIED: 'PAYMENT.CAPTURE.DENIED',
  PAYMENT_CAPTURE_PENDING: 'PAYMENT.CAPTURE.PENDING',
  CHECKOUT_ORDER_APPROVED: 'CHECKOUT.ORDER.APPROVED',
  CHECKOUT_ORDER_COMPLETED: 'CHECKOUT.ORDER.COMPLETED'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const event = JSON.parse(body)

    // Verify webhook signature (for production security)
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (webhookId && process.env.NODE_ENV === 'production') {
      const headers = req.headers
      const signature = headers.get('paypal-transmission-sig')
      const certId = headers.get('paypal-cert-id')
      const authAlgo = headers.get('paypal-auth-algo')
      const transmissionTime = headers.get('paypal-transmission-time')

      // In production, you should verify the webhook signature
      // For now, we'll log the event and process it
      console.log('PayPal webhook received:', event.event_type)
    }

    // Process the webhook event
    switch (event.event_type) {
      case WEBHOOK_EVENTS.PAYMENT_CAPTURE_COMPLETED:
        await handlePaymentCompleted(event)
        break
      
      case WEBHOOK_EVENTS.PAYMENT_CAPTURE_DENIED:
        await handlePaymentDenied(event)
        break
      
      case WEBHOOK_EVENTS.PAYMENT_CAPTURE_PENDING:
        await handlePaymentPending(event)
        break
      
      case WEBHOOK_EVENTS.CHECKOUT_ORDER_COMPLETED:
        await handleOrderCompleted(event)
        break
      
      default:
        console.log('Unhandled PayPal webhook event:', event.event_type)
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' })

  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCompleted(event: any) {
  try {
    const paymentId = event.resource.id
    const orderId = event.resource.supplementary_data?.related_ids?.order_id
    const amount = parseFloat(event.resource.amount.value)
    
    console.log('Payment completed:', { paymentId, orderId, amount })

    // Update transaction status to completed
    const { data: transaction, error: findError } = await supabase
      .from('transactions')
      .select('*')
      .eq('square_payment_id', orderId)
      .single()

    if (findError || !transaction) {
      console.error('Transaction not found for order:', orderId)
      return
    }

    // Update transaction status
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        metadata: {
          ...transaction.metadata,
          paypal_payment_id: paymentId,
          webhook_processed_at: new Date().toISOString()
        }
      })
      .eq('id', transaction.id)

    if (updateError) {
      console.error('Failed to update transaction:', updateError)
      return
    }

    // Update user balance
    const { error: balanceError } = await supabase
      .from('users')
      .update({
        balance: supabase.sql`balance + ${amount}`
      })
      .eq('id', transaction.user_id)

    if (balanceError) {
      console.error('Failed to update user balance:', balanceError)
    }

    console.log('Payment completed successfully for user:', transaction.user_id)

  } catch (error) {
    console.error('Error handling payment completed:', error)
  }
}

async function handlePaymentDenied(event: any) {
  try {
    const paymentId = event.resource.id
    const orderId = event.resource.supplementary_data?.related_ids?.order_id
    
    console.log('Payment denied:', { paymentId, orderId })

    // Update transaction status to failed
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'failed',
        metadata: {
          paypal_payment_id: paymentId,
          webhook_processed_at: new Date().toISOString(),
          failure_reason: 'Payment denied by PayPal'
        }
      })
      .eq('square_payment_id', orderId)

    if (error) {
      console.error('Failed to update transaction:', error)
    }

  } catch (error) {
    console.error('Error handling payment denied:', error)
  }
}

async function handlePaymentPending(event: any) {
  try {
    const paymentId = event.resource.id
    const orderId = event.resource.supplementary_data?.related_ids?.order_id
    
    console.log('Payment pending:', { paymentId, orderId })

    // Update transaction with pending status and payment ID
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'pending',
        metadata: {
          paypal_payment_id: paymentId,
          webhook_processed_at: new Date().toISOString(),
          pending_reason: event.resource.reason_code || 'Payment pending'
        }
      })
      .eq('square_payment_id', orderId)

    if (error) {
      console.error('Failed to update transaction:', error)
    }

  } catch (error) {
    console.error('Error handling payment pending:', error)
  }
}

async function handleOrderCompleted(event: any) {
  try {
    const orderId = event.resource.id
    const amount = parseFloat(event.resource.purchase_units[0]?.amount?.value || 0)
    
    console.log('Order completed:', { orderId, amount })

    // This is handled by payment completed event, but we can log it
    console.log('Order completion confirmed for:', orderId)

  } catch (error) {
    console.error('Error handling order completed:', error)
  }
}
