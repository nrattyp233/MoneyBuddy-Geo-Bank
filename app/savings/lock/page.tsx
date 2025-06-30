"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Lock, Calendar, AlertTriangle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function LockSavingsPage() {
  const [lockData, setLockData] = useState({
    amount: "",
    duration: "3",
    purpose: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const lockOptions = [
    { value: "3", label: "3 Months", rate: "2.5%", penalty: "1%" },
    { value: "6", label: "6 Months", rate: "3.0%", penalty: "1.5%" },
    { value: "9", label: "9 Months", rate: "3.5%", penalty: "2%" },
    { value: "12", label: "12 Months", rate: "4.0%", penalty: "2.5%" },
  ]

  const selectedOption = lockOptions.find((opt) => opt.value === lockData.duration)
  const lockAmount = Number.parseFloat(lockData.amount) || 0
  const estimatedEarnings =
    lockAmount * (Number.parseFloat(selectedOption?.rate || "0") / 100) * (Number.parseInt(lockData.duration) / 12)
  const earlyWithdrawalPenalty = lockAmount * (Number.parseFloat(selectedOption?.penalty || "0") / 100)

  const handleLockSavings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate locking process
    setTimeout(() => {
      setIsLoading(false)
      alert(`Successfully locked $${lockAmount.toFixed(2)} for ${lockData.duration} months with Money Buddy!`)
    }, 2000)
  }

  const getUnlockDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + Number.parseInt(lockData.duration))
    return date.toLocaleDateString()
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lock Savings</h1>
          <p className="text-gray-600">Secure your funds with time-locked savings accounts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Create Locked Savings Account</span>
            </CardTitle>
            <CardDescription>Lock your funds for a fixed period to earn higher interest rates</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLockSavings} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Lock ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="100"
                  placeholder="Minimum $100"
                  value={lockData.amount}
                  onChange={(e) =>
                    setLockData({
                      ...lockData,
                      amount: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-4">
                <Label>Lock Duration & Interest Rate</Label>
                <RadioGroup
                  value={lockData.duration}
                  onValueChange={(value) =>
                    setLockData({
                      ...lockData,
                      duration: value,
                    })
                  }
                >
                  {lockOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="flex-1">
                        <Label htmlFor={option.value} className="flex items-center justify-between cursor-pointer">
                          <div>
                            <span className="font-medium">{option.label}</span>
                            <p className="text-sm text-gray-500">Early withdrawal penalty: {option.penalty}</p>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {option.rate} APY
                          </Badge>
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose (Optional)</Label>
                <Input
                  id="purpose"
                  placeholder="e.g., Emergency fund, Vacation savings"
                  value={lockData.purpose}
                  onChange={(e) =>
                    setLockData({
                      ...lockData,
                      purpose: e.target.value,
                    })
                  }
                />
              </div>

              {/* Summary */}
              {lockAmount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-blue-900 flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Lock Summary</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700">Lock Amount:</p>
                      <p className="font-medium">${lockAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Duration:</p>
                      <p className="font-medium">{selectedOption?.label}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Unlock Date:</p>
                      <p className="font-medium">{getUnlockDate()}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Est. Earnings:</p>
                      <p className="font-medium text-green-600">+${estimatedEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-yellow-800">Important Information</h4>
                    <div className="text-sm text-yellow-700 space-y-1">
                      <p>• Funds will be locked until the maturity date</p>
                      <p>• Early withdrawal is possible with a penalty fee of ${earlyWithdrawalPenalty.toFixed(2)}</p>
                      <p>• Penalty fees are sent to the admin account</p>
                      <p>• Interest is calculated daily and paid at maturity</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? "Locking Funds..."
                  : `Lock $${lockAmount.toFixed(2)} for ${selectedOption?.label} with Money Buddy`}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Current Locked Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Your Locked Accounts</CardTitle>
            <CardDescription>Manage your existing locked savings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Emergency Fund</p>
                  <p className="text-sm text-gray-500">Locked until March 15, 2024</p>
                  <Badge variant="secondary" className="mt-1">
                    6 Months • 3.0% APY
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-medium">$5,000.00</p>
                  <p className="text-sm text-green-600">+$75.00 earned</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Early Withdrawal
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
