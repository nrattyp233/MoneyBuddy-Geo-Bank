import { type NextRequest, NextResponse } from "next/server"
import { capturePayPalOrder } from "@/lib/paypal"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { orderId, userId } = await req.json()

    // Validate input
    if (!orderId || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    // Capture the PayPal payment
    const capture = await capturePayPalOrder(orderId)

    if (!capture || capture.status !== 'COMPLETED') {
      return NextResponse.json({ 
        success: false, 
        error: "Payment capture failed" 
      }, { status: 500 })
    }

    // Get transaction from database
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('square_payment_id', orderId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !transaction) {
      return NextResponse.json({ 
        success: false, 
        error: "Transaction not found" 
      }, { status: 404 })
    }

    // Update transaction status
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status: 'completed',
        metadata: {
          ...transaction.metadata,
          capture_id: capture.id,
          capture_status: capture.status,
          captured_at: capture.create_time
        }
      })
      .eq('square_payment_id', orderId)

    if (updateError) {
      console.error("Error updating transaction:", updateError)
      return NextResponse.json({ 
        success: false, 
        error: "Failed to update transaction" 
      }, { status: 500 })
    }

    // Update user balance in accounts table
    // First, try to get the existing account
    const { data: existingAccount, error: accountFetchError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (existingAccount) {
      // Update existing account balance
      const newBalance = parseFloat(existingAccount.balance) + parseFloat(capture.amount.value)
      const { error: updateBalanceError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('user_id', userId)

      if (updateBalanceError) {
        console.error("Error updating balance:", updateBalanceError)
        return NextResponse.json({ 
          success: false, 
          error: "Failed to update balance" 
        }, { status: 500 })
      }
    } else {
      // Create new account with the deposit amount
      const { error: createAccountError } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          account_type: 'checking',
          balance: parseFloat(capture.amount.value),
          is_active: true
        })

      if (createAccountError) {
        console.error("Error creating account:", createAccountError)
        return NextResponse.json({ 
          success: false, 
          error: "Failed to create account" 
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      capture: capture,
      transaction: transaction,
      message: "Payment completed successfully"
    })

  } catch (error) {
    console.error("PayPal capture error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Payment capture failed" 
    }, { status: 500 })
  }
}
