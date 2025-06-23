"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CreditCard, Building2, Plus, Star, Trash2, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PaymentProcessor, { type PaymentMethod } from "@/lib/payment-processor"
import AddPaymentMethodDialog from "@/components/add-payment-method-dialog"

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
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
  }

  const handleRemoveMethod = async (methodId: string) => {
    const confirmed = window.confirm("Are you sure you want to remove this payment method?")
    if (!confirmed) return

    setIsLoading(true)
    setError("")

    try {
      const userId = localStorage.getItem("userEmail") || "demo-user"
      await PaymentProcessor.removePaymentMethod(userId, methodId)
      loadPaymentMethods()
      setSuccess("Payment method removed successfully")
    } catch (err) {
      setError("Failed to remove payment method")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetPrimary = async (methodId: string) => {
    setIsLoading(true)
    setError("")

    try {
      const userId = localStorage.getItem("userEmail") || "demo-user"
      await PaymentProcessor.setPrimaryPaymentMethod(userId, methodId)
      loadPaymentMethods()
      setSuccess("Primary payment method updated")
    } catch (err) {
      setError("Failed to update primary payment method")
    } finally {
      setIsLoading(false)
    }
  }

  const getCardBrandIcon = (brand: string) => {
    switch (brand) {
      case "visa":
        return "💳"
      case "mastercard":
        return "💳"
      case "amex":
        return "💳"
      case "discover":
        return "💳"
      default:
        return "💳"
    }
  }

  const debitCards = paymentMethods.filter((method) => method.type === "debit_card")
  const bankAccounts = paymentMethods.filter((method) => method.type === "bank_account")

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
            <CreditCard className="h-6 w-6 text-lime-400 mr-3" />
            <h1 className="text-xl font-bold text-white">Payment Methods</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Payment Method Button */}
        <div className="mb-8">
          <Button onClick={() => setShowAddDialog(true)} className="btn-accent text-white font-semibold">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-400/30">
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-lime-500/20 border-lime-400/30">
            <AlertDescription className="text-lime-200">{success}</AlertDescription>
          </Alert>
        )}

        {/* Debit Cards */}
        <Card className="mb-8 card-gradient border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Debit Cards
            </CardTitle>
            <CardDescription className="text-white/70">
              Manage your debit cards for deposits and withdrawals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {debitCards.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No debit cards added</h3>
                <p className="text-white/60 mb-4">Add a debit card to make deposits and withdrawals</p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  variant="outline"
                  className="glass-effect text-white border-white/30 hover:bg-white/10"
                >
                  Add Debit Card
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {debitCards.map((method) => {
                  const details = method.details as any
                  return (
                    <div key={method.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{getCardBrandIcon(details.brand)}</div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-white">{method.name}</h3>
                              {method.isPrimary && (
                                <Badge className="bg-lime-500/20 text-lime-300 border-lime-400/30">
                                  <Star className="h-3 w-3 mr-1" />
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-white/70">
                              {details.brand.toUpperCase()} •••• {details.last4}
                            </p>
                            <p className="text-xs text-white/50">
                              {details.cardholderName} • Expires {details.expiryMonth}/{details.expiryYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!method.isPrimary && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetPrimary(method.id)}
                              disabled={isLoading}
                              className="text-white/70 hover:bg-white/10 hover:text-white"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMethod(method.id)}
                            disabled={isLoading}
                            className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Accounts */}
        <Card className="card-gradient border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Bank Accounts
            </CardTitle>
            <CardDescription className="text-white/70">Manage your bank accounts for ACH transfers</CardDescription>
          </CardHeader>
          <CardContent>
            {bankAccounts.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No bank accounts added</h3>
                <p className="text-white/60 mb-4">Add a bank account for ACH transfers</p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  variant="outline"
                  className="glass-effect text-white border-white/30 hover:bg-white/10"
                >
                  Add Bank Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bankAccounts.map((method) => {
                  const details = method.details as any
                  return (
                    <div key={method.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">🏦</div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-white">{method.name}</h3>
                              {method.isPrimary && (
                                <Badge className="bg-lime-500/20 text-lime-300 border-lime-400/30">
                                  <Star className="h-3 w-3 mr-1" />
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-white/70">
                              {details.bankName} •{" "}
                              {details.accountType.charAt(0).toUpperCase() + details.accountType.slice(1)}
                            </p>
                            <p className="text-xs text-white/50">
                              •••• {details.last4} • {details.accountHolderName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!method.isPrimary && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetPrimary(method.id)}
                              disabled={isLoading}
                              className="text-white/70 hover:bg-white/10 hover:text-white"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMethod(method.id)}
                            disabled={isLoading}
                            className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/deposit">
            <Button variant="outline" className="w-full glass-effect text-white border-white/30 hover:bg-white/10">
              <Plus className="h-4 w-4 mr-2" />
              Make Deposit
            </Button>
          </Link>
          <Link href="/withdraw">
            <Button variant="outline" className="w-full glass-effect text-white border-white/30 hover:bg-white/10">
              <Settings className="h-4 w-4 mr-2" />
              Withdraw Funds
            </Button>
          </Link>
        </div>
      </div>

      {/* Add Payment Method Dialog */}
      <AddPaymentMethodDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          loadPaymentMethods()
          setSuccess("Payment method added successfully")
        }}
        onError={(error) => setError(error)}
      />
    </div>
  )
}
