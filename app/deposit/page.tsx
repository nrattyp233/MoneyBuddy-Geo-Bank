"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Plus, CreditCard, Building2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PaymentProcessor, { type PaymentMethod } from "@/lib/payment-processor"

export default function DepositPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedMethodId, setSelectedMethodId] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else {
      loadPaymentMethods()
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

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!selectedMethodId || !amount) {
      setError("Please select a payment method and enter an amount")
      setIsLoading(false)
      return
    }

    const depositAmount = Number.parseFloat(amount)
    if (depositAmount <= 0) {
      setError("Amount must be greater than $0")
      setIsLoading(false)
      return
    }

    if (depositAmount > 10000) {
      setError("Maximum deposit amount is $10,000")
      setIsLoading(false)
      return
    }

    try {
      const userId = localStorage.getItem("userEmail") || "demo-user"

      // Call real API endpoint
      const response = await fetch("/api/transactions/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          paymentMethodId: selectedMethodId,
          amount: depositAmount,
          description: description || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to process deposit")
      }

      setSuccess(`Successfully deposited $${depositAmount.toFixed(2)} to your wallet!`)

      // Reset form
      setAmount("")
      setDescription("")

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process deposit")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId)

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
            <Plus className="h-6 w-6 text-lime-400 mr-3" />
            <h1 className="text-xl font-bold text-white">Deposit Funds</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="card-gradient border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Add Money to Wallet</CardTitle>
            <CardDescription className="text-white/70">
              Deposit funds from your debit card or bank account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No payment methods</h3>
                <p className="text-white/60 mb-4">Add a payment method to make deposits</p>
                <Link href="/payment-methods">
                  <Button className="btn-accent text-white">Add Payment Method</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleDeposit} className="space-y-6">
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
                    placeholder="What's this deposit for?"
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
                        <span className="text-white/80">Deposit Amount:</span>
                        <span className="font-medium text-white">${Number.parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Processing Fee:</span>
                        <span className="font-medium text-lime-400">FREE</span>
                      </div>
                      <div className="flex justify-between border-t border-white/20 pt-2">
                        <span className="font-medium text-white">You'll Receive:</span>
                        <span className="font-medium text-lime-400">${Number.parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">From:</span>
                        <span className="font-medium text-white">{selectedMethod.name}</span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="bg-red-500/20 border-red-400/30">
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
                  disabled={isLoading || !selectedMethodId || !amount}
                  className="w-full btn-accent text-white font-semibold"
                >
                  {isLoading ? "Processing Deposit..." : "Deposit Funds"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 card-gradient border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white text-lg">Deposit Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
              <span>Deposits are processed instantly and are completely free</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
              <span>Funds are immediately available in your wallet</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
              <span>Maximum deposit amount is $10,000 per transaction</span>
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
          <Link href="/withdraw">
            <Button variant="outline" className="w-full glass-effect text-white border-white/30 hover:bg-white/10">
              <Building2 className="h-4 w-4 mr-2" />
              Withdraw Funds
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
