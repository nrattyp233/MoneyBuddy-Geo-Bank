"use client"

import React, { useState } from 'react'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, CreditCard, Banknote } from "lucide-react"

interface PayPalPaymentProps {
  amount: number
  userId: string
  onSuccess: (details: any) => void
  onError: (error: any) => void
}

export default function PayPalPayment({ amount, userId, onSuccess, onError }: PayPalPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: "USD",
    intent: "capture",
    dataClientToken: undefined,
    components: "buttons",
    enableFunding: "venmo,paylater,card",
    disableFunding: "",
  }

  const createOrder = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          userId: userId
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order')
      }

      return data.orderId
    } catch (error: any) {
      console.error('Create order error:', error)
      setError(error.message)
      onError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const onApprove = async (data: any) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.orderID,
          userId: userId
        })
      })

      const captureData = await response.json()

      if (!captureData.success) {
        throw new Error(captureData.error || 'Payment capture failed')
      }

      onSuccess(captureData)
    } catch (error: any) {
      console.error('Capture order error:', error)
      setError(error.message)
      onError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = (data: any) => {
    console.log('PayPal payment cancelled:', data)
    setError('Payment was cancelled')
  }

  const onErrorHandler = (err: any) => {
    console.error('PayPal payment error:', err)
    setError('Payment failed. Please try again.')
    onError(err)
  }

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-700">
          <Banknote className="h-5 w-5" />
          <span>PayPal Payment</span>
        </CardTitle>
        <CardDescription>
          Pay with PayPal, Venmo, or credit card • Fee: 2.9% + $0.30
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Payment Details</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-blue-700">Deposit Amount:</span>
              <span className="font-medium">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">PayPal Fee (2.9% + $0.30):</span>
              <span className="font-medium text-orange-600">
                ${(amount * 0.029 + 0.30).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t border-blue-200 pt-1">
              <span className="text-blue-800">Total Cost:</span>
              <span className="text-blue-900">${(amount + (amount * 0.029 + 0.30)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">You'll Receive:</span>
              <span className="font-medium text-green-700">${amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800">PayPal Benefits</h4>
              <div className="text-sm text-green-700 space-y-1 mt-1">
                <p>• Pay with PayPal balance, bank account, or card</p>
                <p>• Venmo payments supported</p>
                <p>• Buyer protection included</p>
                <p>• Instant deposits to Money Buddy wallet</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              style={{
                shape: "rect",
                layout: "vertical",
                color: "gold",
                label: "paypal",
              }}
              disabled={isLoading}
              createOrder={createOrder}
              onApprove={onApprove}
              onCancel={onCancel}
              onError={onErrorHandler}
            />
          </PayPalScriptProvider>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <CreditCard className="h-4 w-4" />
            <span>Secured by PayPal • No account required</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
