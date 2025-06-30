"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Banknote, CreditCard, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function WithdrawPage() {
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    method: "bank",
    bankAccount: "",
    routingNumber: "",
    accountHolder: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [error, setError] = useState("")
  const [availableBalance, setAvailableBalance] = useState(12450.75)
  const [newBalance, setNewBalance] = useState<number | null>(null)

  const withdrawMethods = [
    { id: "bank", name: "Bank Transfer", icon: Banknote, description: "1-2 business days", fee: 0 },
    { id: "instant", name: "Instant Transfer", icon: TrendingUp, description: "Within minutes", fee: 1.5 },
    { id: "card", name: "Debit Card", icon: CreditCard, description: "Instant to card", fee: 1.0 },
  ]

  const selectedMethod = withdrawMethods.find((method) => method.id === withdrawData.method)
  const withdrawAmount = Number.parseFloat(withdrawData.amount) || 0
  const withdrawFee = selectedMethod?.fee || 0
  const totalDeducted = withdrawAmount + withdrawFee

  // Fetch user balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // In a real app, you'd fetch this from your API
        // const response = await fetch('/api/user/balance')
        // const data = await response.json()
        // setAvailableBalance(data.balance)
      } catch (err) {
        console.error("Error fetching balance:", err)
      }
    }
    fetchBalance()
  }, [])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (totalDeducted > availableBalance) {
      setError(`Insufficient funds. You need $${(totalDeducted - availableBalance).toFixed(2)} more.`)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/square/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          method: withdrawData.method,
          userEmail: "user@example.com", // In real app, get from auth context
          bankDetails:
            withdrawData.method === "bank"
              ? {
                  accountHolder: withdrawData.accountHolder,
                  routingNumber: withdrawData.routingNumber,
                  accountNumber: withdrawData.bankAccount,
                }
              : null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setWithdrawSuccess(true)
        setNewBalance(result.newBalance)
        setAvailableBalance(result.newBalance)
        setWithdrawData({
          amount: "",
          method: "bank",
          bankAccount: "",
          routingNumber: "",
          accountHolder: "",
        })
        setTimeout(() => {
          setWithdrawSuccess(false)
          setNewBalance(null)
        }, 5000)
      } else {
        setError(result.error || "Withdrawal failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
      console.error("Withdrawal error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Withdraw Funds 💸</h1>
          <p className="text-gray-600">Transfer real money from your Money Buddy wallet using Square</p>
        </div>

        {/* Success Message */}
        {withdrawSuccess && (
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Withdrawal Initiated! 🎉</h3>
                  <p className="text-green-600">${withdrawAmount.toFixed(2)} is being processed by Square</p>
                  {newBalance !== null && (
                    <p className="text-green-700 font-medium">New Balance: ${newBalance.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Withdrawal Failed</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Balance */}
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-purple-600 mb-2">Available Balance</p>
              <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ${availableBalance.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Method Selection */}
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
          <CardHeader>
            <CardTitle className="text-purple-700">Choose Withdrawal Method</CardTitle>
            <CardDescription>Select how you'd like to receive your funds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {withdrawMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    withdrawData.method === method.id
                      ? "border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50"
                      : "border-gray-200 hover:border-purple-200"
                  }`}
                  onClick={() => setWithdrawData({ ...withdrawData, method: method.id })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <method.icon className="h-6 w-6 text-purple-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {method.fee > 0 ? (
                        <Badge variant="secondary">${method.fee} fee</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">Free</Badge>
                      )}
                      {withdrawData.method === method.id && (
                        <Badge className="bg-purple-100 text-purple-800 ml-2">Selected</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Form */}
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-700">
              <TrendingUp className="h-5 w-5" />
              <span>Withdrawal Details</span>
            </CardTitle>
            <CardDescription>Powered by Square - Secure money transfers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  max={availableBalance}
                  placeholder="Enter amount to withdraw"
                  value={withdrawData.amount}
                  onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                  className="border-purple-200 focus:border-purple-400 text-lg font-semibold"
                  required
                />
                <p className="text-sm text-gray-500">Maximum: ${availableBalance.toLocaleString()}</p>
              </div>

              {withdrawData.method === "bank" && (
                <div className="space-y-4 p-4 border-2 border-purple-200 rounded-lg bg-white/50">
                  <h4 className="font-medium text-purple-700">Bank Account Information</h4>

                  <div className="space-y-2">
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      placeholder="John Doe"
                      value={withdrawData.accountHolder}
                      onChange={(e) => setWithdrawData({ ...withdrawData, accountHolder: e.target.value })}
                      className="border-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        placeholder="123456789"
                        value={withdrawData.routingNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          if (value.length <= 9) {
                            setWithdrawData({ ...withdrawData, routingNumber: value })
                          }
                        }}
                        className="border-purple-200 focus:border-purple-400"
                        maxLength={9}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankAccount">Account Number</Label>
                      <Input
                        id="bankAccount"
                        placeholder="1234567890"
                        value={withdrawData.bankAccount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          if (value.length <= 17) {
                            setWithdrawData({ ...withdrawData, bankAccount: value })
                          }
                        }}
                        className="border-purple-200 focus:border-purple-400"
                        maxLength={17}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {withdrawData.method === "instant" && (
                <div className="space-y-4 p-4 border-2 border-purple-200 rounded-lg bg-white/50">
                  <h4 className="font-medium text-purple-700">Instant Transfer</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-700">
                      Instant transfers arrive within minutes but include a $1.50 processing fee.
                    </p>
                  </div>
                </div>
              )}

              {withdrawData.method === "card" && (
                <div className="space-y-4 p-4 border-2 border-purple-200 rounded-lg bg-white/50">
                  <h4 className="font-medium text-purple-700">Debit Card Transfer</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      Funds will be sent directly to your debit card instantly with a $1.00 processing fee.
                    </p>
                  </div>
                </div>
              )}

              {/* Fee Summary */}
              {withdrawAmount > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">Withdrawal Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Withdrawal Amount:</span>
                      <span className="font-medium">${withdrawAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Processing Fee:</span>
                      <span className="font-medium">${withdrawFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold">
                      <span className="text-blue-800">Total Deducted:</span>
                      <span className="text-blue-900">${totalDeducted.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Remaining Balance:</span>
                      <span className="font-medium">${(availableBalance - totalDeducted).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning for insufficient funds */}
              {totalDeducted > availableBalance && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Insufficient Funds</h4>
                      <p className="text-sm text-red-700">
                        You need ${(totalDeducted - availableBalance).toFixed(2)} more to complete this withdrawal.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 text-white border-0 py-3 text-lg font-semibold"
                disabled={isLoading || totalDeducted > availableBalance || !withdrawData.amount}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing Withdrawal...</span>
                  </div>
                ) : (
                  `Withdraw $${withdrawAmount.toFixed(2)} 🐵`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Withdrawals */}
        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
          <CardHeader>
            <CardTitle className="text-blue-700">Recent Withdrawals</CardTitle>
            <CardDescription>Your latest Money Buddy withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-white/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Bank Transfer</p>
                    <p className="text-sm text-gray-500">January 14, 2024</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">-$800.00</p>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-white/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Instant Transfer</p>
                    <p className="text-sm text-gray-500">January 11, 2024</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">-$300.00</p>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Processing
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
