"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Send, MapPin, Clock, AlertCircle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function TransferPage() {
  const [transferData, setTransferData] = useState({
    recipient: "",
    amount: "",
    memo: "",
    useGeofence: false,
    useTimeRestriction: false,
    timeLimit: "24",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTransferData({
      ...transferData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setTransferData({
      ...transferData,
      [name]: checked,
    })
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate transfer process
    setTimeout(() => {
      setIsLoading(false)
      alert("Transfer initiated successfully!")
    }, 2000)
  }

  const transactionFee = Number.parseFloat(transferData.amount) * 0.02 || 0

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Send Money</h1>
          <p className="text-gray-600">Transfer funds with optional restrictions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Transfer Details</span>
            </CardTitle>
            <CardDescription>Enter recipient information and transfer amount via Money Buddy</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransfer} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Email or Phone</Label>
                <Input
                  id="recipient"
                  name="recipient"
                  placeholder="john@example.com or +1234567890"
                  value={transferData.recipient}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={transferData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo">Memo (Optional)</Label>
                <Textarea
                  id="memo"
                  name="memo"
                  placeholder="What's this for?"
                  value={transferData.memo}
                  onChange={handleInputChange}
                />
              </div>

              {/* Restrictions */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Transfer Restrictions</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <Label>Geofencing</Label>
                    </div>
                    <p className="text-sm text-gray-500">Restrict where the recipient can receive funds</p>
                  </div>
                  <Switch
                    checked={transferData.useGeofence}
                    onCheckedChange={(checked) => handleSwitchChange("useGeofence", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <Label>Time Restriction</Label>
                    </div>
                    <p className="text-sm text-gray-500">Set a time limit for fund collection</p>
                  </div>
                  <Switch
                    checked={transferData.useTimeRestriction}
                    onCheckedChange={(checked) => handleSwitchChange("useTimeRestriction", checked)}
                  />
                </div>

                {transferData.useTimeRestriction && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="timeLimit">Time Limit (hours)</Label>
                    <Input
                      id="timeLimit"
                      name="timeLimit"
                      type="number"
                      min="1"
                      max="168"
                      value={transferData.timeLimit}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>

              {/* Fee Information */}
              {transferData.amount && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-yellow-800">Money Buddy Transaction Fee</h4>
                      <div className="text-sm text-yellow-700 space-y-1">
                        <p>Transfer Amount: ${Number.parseFloat(transferData.amount).toFixed(2)}</p>
                        <p>Money Buddy Fee (2%): ${transactionFee.toFixed(2)}</p>
                        <p className="font-medium">
                          Total Deducted: ${(Number.parseFloat(transferData.amount) + transactionFee).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Send Money"}
                </Button>
                {(transferData.useGeofence || transferData.useTimeRestriction) && (
                  <Button type="button" variant="outline" className="flex items-center space-x-2 bg-transparent">
                    <span>Configure Restrictions</span>
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
