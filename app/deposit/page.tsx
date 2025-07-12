"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Banknote, Shield, CheckCircle, AlertTriangle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { supabase } from "@/lib/supabase"
import PayPalPayment from "@/components/paypal-payment"

export default function DepositPage() {
  const [depositData, setDepositData] = useState({
    amount: "",
  })
  const [depositSuccess, setDepositSuccess] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getCurrentUser()
  }, [])

  const handlePayPalSuccess = (details: any) => {
    setDepositSuccess(true)
    setDepositData({ amount: "" })
    setError("")
    setTimeout(() => setDepositSuccess(false), 5000)
  }

  const handlePayPalError = (error: any) => {
    setError(error.message || 'PayPal payment failed')
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Deposit Funds 💰</h1>
          <p className="text-gray-600">Add funds to your Money Buddy wallet using PayPal</p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Payment Error</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {depositSuccess && (
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Deposit Successful! 🎉</h3>
                  <p className="text-green-600">Your funds have been added to your Money Buddy wallet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deposit Form */}
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
          <CardHeader>
            <CardTitle className="text-purple-700 flex items-center space-x-2">
              <Banknote className="h-5 w-5" />
              <span>PayPal Deposit</span>
            </CardTitle>
            <CardDescription>
              Deposit funds using PayPal, Venmo, credit cards, or bank account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Deposit Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Enter amount to deposit"
                  value={depositData.amount}
                  onChange={(e) => setDepositData({ amount: e.target.value })}
                  className="border-purple-200 focus:border-purple-400 text-lg font-semibold"
                  required
                />
              </div>

              {/* PayPal Payment Form */}
              {depositData.amount && parseFloat(depositData.amount) >= 1 && user && (
                <PayPalPayment
                  amount={parseFloat(depositData.amount)}
                  userId={user.id}
                  onSuccess={handlePayPalSuccess}
                  onError={handlePayPalError}
                />
              )}

              {/* Instructions */}
              {(!depositData.amount || parseFloat(depositData.amount) < 1) && (
                <div className="text-center p-6 text-gray-500">
                  <Banknote className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Enter an amount of $1.00 or more to see PayPal payment options</p>
                </div>
              )}

              {!user && (
                <div className="text-center p-6 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Please log in to make a deposit</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PayPal Info */}
        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
          <CardHeader>
            <CardTitle className="text-blue-700">About PayPal Deposits</CardTitle>
            <CardDescription>
              Secure, convenient deposits with multiple payment options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-blue-800">Payment Methods</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>✓ PayPal balance</p>
                  <p>✓ Venmo balance</p>
                  <p>✓ Credit/debit cards</p>
                  <p>✓ Bank accounts</p>
                  <p>✓ Buy now, pay later options</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-blue-800">Benefits</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>✓ Instant deposits</p>
                  <p>✓ Buyer protection</p>
                  <p>✓ Secure processing</p>
                  <p>✓ No PayPal account required</p>
                  <p>✓ Mobile optimized</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Fee:</strong> 2.9% + $0.30 per transaction (same as major card processors)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
