"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Banknote, Shield, CheckCircle, AlertTriangle, Clock, DollarSign } from "lucide-react"

interface BankAccountFormProps {
  onSubmit: (bankDetails: any) => void
  isLoading: boolean
  error?: string
}

export default function BankAccountForm({ onSubmit, isLoading, error }: BankAccountFormProps) {
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    routingNumber: "",
    accountNumber: "",
    confirmAccountNumber: "",
    accountType: "checking",
    bankName: ""
  })

  const [step, setStep] = useState<'form' | 'verify' | 'complete'>('form')
  const [microDeposits, setMicroDeposits] = useState({
    amount1: "",
    amount2: ""
  })

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
      return
    }

    onSubmit(bankDetails)
  }

  const handleMicroDepositVerification = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle micro-deposit verification
    console.log("Verifying micro-deposits:", microDeposits)
    setStep('complete')
  }

  if (step === 'verify') {
    return (
      <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-700">
            <DollarSign className="h-5 w-5" />
            <span>Verify Your Bank Account</span>
          </CardTitle>
          <CardDescription>
            We've sent two small deposits to your account. Please enter the amounts to verify.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Verification Process</h4>
                  <div className="text-sm text-blue-700 space-y-1 mt-1">
                    <p>• Check your bank account for two small deposits (usually $0.01-$0.99)</p>
                    <p>• Deposits may take 1-2 business days to appear</p>
                    <p>• Enter the exact amounts below to verify your account</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleMicroDepositVerification} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount1">First Deposit Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="amount1"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.00"
                      value={microDeposits.amount1}
                      onChange={(e) => setMicroDeposits({...microDeposits, amount1: e.target.value})}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount2">Second Deposit Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="amount2"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.00"
                      value={microDeposits.amount2}
                      onChange={(e) => setMicroDeposits({...microDeposits, amount2: e.target.value})}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('form')}
                  className="flex-1"
                >
                  Back to Form
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Account"}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'complete') {
    return (
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Bank Account Verified! 🎉</h3>
              <p className="text-green-600">Your bank account is now connected and ready for ACH transfers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-green-700">
          <Banknote className="h-5 w-5" />
          <span>Connect Your Bank Account</span>
        </CardTitle>
        <CardDescription>
          Add your bank account for low-cost ACH transfers ($0.25 fee vs 2.9% card fees)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBankSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name</Label>
            <Input
              id="accountHolderName"
              placeholder="John Doe"
              value={bankDetails.accountHolderName}
              onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              placeholder="Chase Bank"
              value={bankDetails.bankName}
              onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                placeholder="123456789"
                value={bankDetails.routingNumber}
                onChange={(e) => setBankDetails({...bankDetails, routingNumber: e.target.value})}
                maxLength={9}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select 
                value={bankDetails.accountType} 
                onValueChange={(value) => setBankDetails({...bankDetails, accountType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              type="password"
              placeholder="1234567890"
              value={bankDetails.accountNumber}
              onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmAccountNumber">Confirm Account Number</Label>
            <Input
              id="confirmAccountNumber"
              type="password"
              placeholder="1234567890"
              value={bankDetails.confirmAccountNumber}
              onChange={(e) => setBankDetails({...bankDetails, confirmAccountNumber: e.target.value})}
              required
            />
            {bankDetails.accountNumber && bankDetails.confirmAccountNumber && 
             bankDetails.accountNumber !== bankDetails.confirmAccountNumber && (
              <p className="text-red-600 text-sm">Account numbers don't match</p>
            )}
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-green-800">ACH Transfer Benefits</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• <strong>Low fees:</strong> Only $0.25 per transfer (vs 2.9% + $0.30 for cards)</p>
                  <p>• <strong>Higher limits:</strong> Up to $50,000 per transaction</p>
                  <p>• <strong>Bank-grade security:</strong> Direct bank-to-bank transfers</p>
                  <p>• <strong>Processing time:</strong> 1-3 business days</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Verification Process</h4>
                <p className="text-sm text-blue-700 mt-1">
                  After submitting, we'll send two small deposits to verify your account. This process takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90 text-white"
            disabled={isLoading || bankDetails.accountNumber !== bankDetails.confirmAccountNumber}
          >
            {isLoading ? "Connecting Account..." : "Connect Bank Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
