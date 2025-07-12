import checkoutNodeJssdk from '@paypal/checkout-server-sdk'

// PayPal environment setup
const Environment = process.env.PAYPAL_ENVIRONMENT === 'production' 
  ? checkoutNodeJssdk.core.LiveEnvironment 
  : checkoutNodeJssdk.core.SandboxEnvironment

// PayPal client
export const paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID!,
    process.env.PAYPAL_CLIENT_SECRET!
  )
)

// PayPal types
export interface PayPalOrder {
  id: string
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED'
  purchase_units: Array<{
    reference_id: string
    amount: {
      currency_code: string
      value: string
    }
  }>
  payer?: {
    email_address?: string
    payer_id?: string
  }
  create_time: string
  update_time: string
}

export interface PayPalCapture {
  id: string
  status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'REFUNDED' | 'PENDING'
  amount: {
    currency_code: string
    value: string
  }
  seller_protection?: {
    status: string
    dispute_categories: string[]
  }
  final_capture: boolean
  create_time: string
  update_time: string
}

// Create PayPal order
export async function createPayPalOrder(amount: number, userId: string): Promise<PayPalOrder | null> {
  try {
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest()
    request.prefer("return=representation")
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: `money_buddy_${userId}_${Date.now()}`,
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2)
        },
        description: 'Money Buddy Wallet Deposit'
      }],
      application_context: {
        brand_name: 'Money Buddy',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/deposit?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/deposit?cancelled=true`
      }
    })

    const response = await paypalClient.execute(request)
    return response.result as PayPalOrder
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    return null
  }
}

// Capture PayPal order (complete the payment)
export async function capturePayPalOrder(orderId: string): Promise<PayPalCapture | null> {
  try {
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId)
    request.requestBody({})

    const response = await paypalClient.execute(request)
    const capture = response.result.purchase_units[0].payments.captures[0]
    return capture as PayPalCapture
  } catch (error) {
    console.error('Error capturing PayPal order:', error)
    return null
  }
}

// Get order details
export async function getPayPalOrder(orderId: string): Promise<PayPalOrder | null> {
  try {
    const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderId)
    const response = await paypalClient.execute(request)
    return response.result as PayPalOrder
  } catch (error) {
    console.error('Error getting PayPal order:', error)
    return null
  }
}

// Refund payment
export async function refundPayPalPayment(captureId: string, amount?: number): Promise<any> {
  try {
    const request = new checkoutNodeJssdk.payments.CapturesRefundRequest(captureId)
    
    if (amount) {
      request.requestBody({
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2)
        }
      })
    }

    const response = await paypalClient.execute(request)
    return response.result
  } catch (error) {
    console.error('Error refunding PayPal payment:', error)
    return null
  }
}

// Webhook verification
export function verifyPayPalWebhook(
  body: string,
  headers: Record<string, string>,
  webhookId: string
): boolean {
  // PayPal webhook verification would go here
  // For now, return true (implement proper verification in production)
  return true
}
