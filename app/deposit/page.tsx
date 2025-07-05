"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Banknote, Smartphone, Shield, CheckCircle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function DepositPage() {
  const [depositData, setDepositData] = useState({
    amount: "",
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [depositSuccess, setDepositSuccess] = useState(false)

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Instant deposit" },
    { id: "bank", name: "Bank Transfer", icon: Banknote, description: "1-2 business days" },
    { id: "digital", name: "Digital Wallet", icon: Smartphone, description: "Apple Pay, Google Pay" },
  ]

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate Square payment processing
    setTimeout(() => {
      setIsLoading(false)
      setDepositSuccess(true)
      setTimeout(() => setDepositSuccess(false), 3000)
    }, 2000)
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Deposit Funds 💰</h1>
          <p className="text-gray-600">Add real money to your Money Buddy wallet using Square payments</p>
        </div>

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

        {/* Payment Method Selection */}
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
          <CardHeader>
            <CardTitle className="text-purple-700">Choose Payment Method</CardTitle>
            <CardDescription>Select how you'd like to deposit funds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    depositData.paymentMethod === method.id
                      ? "border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50"
                      : "border-gray-200 hover:border-purple-200"
                  }`}
                  onClick={() => setDepositData({ ...depositData, paymentMethod: method.id })}
                >
                  <div className="flex items-center space-x-3">
                    <method.icon className="h-6 w-6 text-purple-600" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                    {depositData.paymentMethod === method.id && (
                      <Badge className="bg-purple-100 text-purple-800">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deposit Form */}
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-700">
              <CreditCard className="h-5 w-5" />
              <span>Deposit Details</span>
            </CardTitle>
            <CardDescription>Powered by Square - Secure payment processing</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDeposit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Deposit Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Enter amount to deposit"
                  value={depositData.amount}
                  onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                  className="border-purple-200 focus:border-purple-400 text-lg font-semibold"
                  required
                />
                <p className="text-sm text-green-600 font-medium">✅ No deposit fees - Free with MonkeyBank!</p>
              </div>

              {depositData.paymentMethod === "card" && (
                <div className="space-y-4 p-4 border-2 border-purple-200 rounded-lg bg-white/50">
                  <h4 className="font-medium text-purple-700">Card Information</h4>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={depositData.cardNumber}
                      onChange={(e) => setDepositData({ ...depositData, cardNumber: e.target.value })}
                      className="border-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={depositData.expiryDate}
                        onChange={(e) => setDepositData({ ...depositData, expiryDate: e.target.value })}
                        className="border-purple-200 focus:border-purple-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={depositData.cvv}
                        onChange={(e) => setDepositData({ ...depositData, cvv: e.target.value })}
                        className="border-purple-200 focus:border-purple-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nameOnCard">Name on Card</Label>
                    <Input
                      id="nameOnCard"
                      placeholder="John Doe"
                      value={depositData.nameOnCard}
                      onChange={(e) => setDepositData({ ...depositData, nameOnCard: e.target.value })}
                      className="border-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-800">Secure Payment Processing</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• Powered by Square - Industry-leading security</p>
                      <p>• PCI DSS compliant payment processing</p>
                      <p>• Your card information is encrypted and secure</p>
                      <p>• Instant deposits to your Money Buddy wallet</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 text-white border-0 py-3 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Processing Deposit..." : `Deposit $${depositData.amount || "0.00"} 🐵`}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Deposits */}
        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
          <CardHeader>
            <CardTitle className="text-blue-700">Recent Deposits</CardTitle>
            <CardDescription>Your latest MonkeyBank deposits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-white/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Card Deposit</p>
                    <p className="text-sm text-gray-500">January 15, 2024</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+$500.00</p>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-white/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Bank Transfer</p>
                    <p className="text-sm text-gray-500">January 12, 2024</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+$1,200.00</p>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-white/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Apple Pay</p>
                    <p className="text-sm text-gray-500">January 10, 2024</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+$250.00</p>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
