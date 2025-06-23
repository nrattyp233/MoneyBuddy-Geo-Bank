"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Minus, CreditCard, Building2, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PaymentProcessor, { type PaymentMethod } from "@/lib/payment-processor"

export default function WithdrawPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedMethodId, setSelectedMethodId] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [walletBalance, setWalletBalance] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else {
      loadPaymentMethods()
      loadWalletBalance()
    }
  }, [router])

  const loadPaymentMethods = () => {
    const userId = localStorage.getItem("userEmail") || "demo-user"
    const methods = PaymentProcessor.getPaymentMethods(userId)
    setPaymentMethods(methods)

    // Auto-select primary method
    const primary = methods.find((m) => m.isPrimary)
    if (primary) {
      setSelectedMethodId(primary.id)
    }
  }

  const loadWalletBalance = () => {
    const userId = localStorage.getItem("userEmail") || "demo-user"
    const stored = localStorage.getItem(`walletBalance_${userId}`)
    setWalletBalance(stored ? Number.parseFloat(stored) : 15420.5)
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!selectedMethodId || !amount) {
      setError("Please select a payment method and enter an amount")
      setIsLoading(false)
      return
    }

    const withdrawAmount = Number.parseFloat(amount)
    const feeAmount = 2.5
    const totalDeduction = withdrawAmount + feeAmount

    if (withdrawAmount <= 0) {
      setError("Amount must be greater than $0")
      setIsLoading(false)
      return
    }

    if (withdrawAmount > 10000) {
      setError("Maximum withdrawal amount is $10,000")
      setIsLoading(false)
      return
    }

    if (totalDeduction > walletBalance) {
      setError(
        `Insufficient balance. You need $${totalDeduction.toFixed(2)} (including $2.50 fee) but only have $${walletBalance.toFixed(2)}`,
      )
      setIsLoading(false)
      return
    }

    try {
      const userId = localStorage.getItem("userEmail") || "demo-user"

      // Call real API endpoint
      const response = await fetch("/api/transactions/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          paymentMethodId: selectedMethodId,
          amount: withdrawAmount,
          description: description || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to process withdrawal")
      }

      setSuccess(`Successfully withdrew $${withdrawAmount.toFixed(2)} to your payment method!`)
      loadWalletBalance() // Refresh balance

      // Reset form
      setAmount("")
      setDescription("")

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process withdrawal")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId)
  const withdrawAmount = Number.parseFloat(amount) || 0
  const feeAmount = 2.5
  const totalDeduction = withdrawAmount + feeAmount

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4 text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Minus className="h-6 w-6 text-lime-400 mr-3" />
            <h1 className="text-xl font-bold text-white">Withdraw Funds</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Balance */}
        <Card className="mb-6 card-gradient border-purple-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-white/70 text-sm">Available Balance</p>
              <p className="text-3xl font-bold text-lime-400">${walletBalance.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Withdraw to Payment Method</CardTitle>
            <CardDescription className="text-white/70">
              Transfer funds from your wallet to your debit card or bank account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No payment methods</h3>
                <p className="text-white/60 mb-4">Add a payment method to make withdrawals</p>
                <Link href="/payment-methods">
                  <Button className="btn-accent text-white">Add Payment Method</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-white">
                    Payment Method
                  </Label>
                  <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
                    <SelectTrigger className="select-white">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => {
                        const details = method.details as any
                        const icon = method.type === "debit_card" ? "💳" : "🏦"
                        const displayText =
                          method.type === "debit_card"
                            ? `${details.brand.toUpperCase()} •••• ${details.last4}`
                            : `${details.bankName} •••• ${details.last4}`

                        return (
                          <SelectItem key={method.id} value={method.id}>
                            <div className="flex items-center space-x-2">
                              <span>{icon}</span>
                              <span>
                                {method.name} - {displayText}
                              </span>
                              {method.isPrimary && <span className="text-xs text-green-600">(Primary)</span>}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white">
                    Amount ($)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="10000"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="input-white"
                  />
                  <p className="text-xs text-white/60">Minimum: $0.01 • Maximum: $10,000</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Description (Optional)
                  </Label>
                  <Input
                    id="description"
                    placeholder="What's this withdrawal for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-white"
                  />
                </div>

                {/* Transaction Summary */}
                {amount && selectedMethod && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-white">Transaction Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/80">Withdrawal Amount:</span>
                        <span className="font-medium text-white">${withdrawAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Processing Fee:</span>
                        <span className="font-medium text-red-300">$2.50</span>
                      </div>
                      <div className="flex justify-between border-t border-white/20 pt-2">
                        <span className="font-medium text-white">Total Deducted:</span>
                        <span className="font-medium text-red-300">${totalDeduction.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">You'll Receive:</span>
                        <span className="font-medium text-lime-400">${withdrawAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">To:</span>
                        <span className="font-medium text-white">{selectedMethod.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Remaining Balance:</span>
                        <span className="font-medium text-white">${(walletBalance - totalDeduction).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning for insufficient balance */}
                {amount && totalDeduction > walletBalance && (
                  <Alert variant="destructive" className="bg-red-500/20 border-red-400/30">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-200">
                      Insufficient balance. You need ${totalDeduction.toFixed(2)} but only have $
                      {walletBalance.toFixed(2)}
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="bg-red-500/20 border-red-400/30">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-lime-500/20 border-lime-400/30">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-lime-200">{success}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || !selectedMethodId || !amount || totalDeduction > walletBalance}
                  className="w-full btn-accent text-white font-semibold"
                >
                  {isLoading ? "Processing Withdrawal..." : "Withdraw Funds"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 card-gradient border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white text-lg">Withdrawal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span>Withdrawals incur a $2.50 processing fee</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
              <span>Funds typically arrive within 1-3 business days</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
              <span>Maximum withdrawal amount is $10,000 per transaction</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
              <span>All transactions are secured with bank-level encryption</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/payment-methods">
            <Button variant="outline" className="w-full glass-effect text-white border-white/30 hover:bg-white/10">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Payment Methods
            </Button>
          </Link>
          <Link href="/deposit">
            <Button variant="outline" className="w-full glass-effect text-white border-white/30 hover:bg-white/10">
              <Building2 className="h-4 w-4 mr-2" />
              Deposit Funds
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
