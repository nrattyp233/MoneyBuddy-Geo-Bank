import { type NextRequest, NextResponse } from "next/server"
import { createPayPalOrder } from "@/lib/paypal"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { amount, userId } = await req.json()

    // Validate input
    if (!amount || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    if (amount < 1 || amount > 10000) {
      return NextResponse.json({ 
        success: false, 
        error: "Amount must be between $1 and $10,000" 
      }, { status: 400 })
    }

    // Get or create user profile
    let { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // If user doesn't exist in users table, create them
    if (userError && userError.code === 'PGRST116') {
      // Get user data from auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
      
      if (authError || !authUser.user) {
        return NextResponse.json({ 
          success: false, 
          error: "Invalid user ID" 
        }, { status: 404 })
      }

      // Create user profile
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: authUser.user.email || '',
          name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'User',
          balance: 0.00,
          savings_balance: 0.00
        })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create user profile:', createError)
        return NextResponse.json({ 
          success: false, 
          error: "Failed to create user profile" 
        }, { status: 500 })
      }

      userProfile = newUser
    } else if (userError) {
      return NextResponse.json({ 
        success: false, 
        error: "User profile not found" 
      }, { status: 404 })
    }

    // Create PayPal order
    const order = await createPayPalOrder(amount, userId)

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to create PayPal order" 
      }, { status: 500 })
    }

    // Record transaction in database
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'deposit',
        status: 'pending',
        square_payment_id: order.id, // Using existing column for PayPal order ID
        metadata: {
          paypal_order_id: order.id,
          purchase_units: order.purchase_units
        }
      })

    if (transactionError) {
      console.error('Failed to record transaction:', transactionError)
    }

    return NextResponse.json({
      success: true,
      order: order,
      orderId: order.id,
      message: "PayPal order created successfully"
    })

  } catch (error) {
    console.error("PayPal order creation error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "PayPal order creation failed" 
    }, { status: 500 })
  }
}
