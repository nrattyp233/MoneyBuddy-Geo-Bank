
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  const buf = await req.arrayBuffer()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig!,
      webhookSecret!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const userId = paymentIntent.metadata?.user_id;
      const amount = paymentIntent.amount_received / 100; // Stripe uses cents
      if (!userId) {
        console.error('No user_id in paymentIntent metadata');
        break;
      }
      // Update user balance
      const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: supabase.rpc('increment_balance', { user_id: userId, amount }) })
        .eq('id', userId)
      if (balanceError) {
        console.error('Error updating user balance:', balanceError)
      }
      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'deposit',
          amount,
          status: 'completed',
          provider: 'stripe',
          provider_id: paymentIntent.id,
          metadata: paymentIntent,
        })
      if (txError) {
        console.error('Error creating transaction:', txError)
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const userId = paymentIntent.metadata?.user_id;
      const amount = paymentIntent.amount / 100;
      if (userId) {
        await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'deposit',
            amount,
            status: 'failed',
            provider: 'stripe',
            provider_id: paymentIntent.id,
            metadata: paymentIntent,
          })
      }
      console.log('Payment failed:', paymentIntent.id, paymentIntent.last_payment_error?.message);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true })
}
