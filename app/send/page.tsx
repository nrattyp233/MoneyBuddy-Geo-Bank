"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, MapPin, Clock, Send, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import EnhancedMapboxGeofence from "@/components/enhanced-mapbox-geofence"
import MapboxSetupGuide from "@/components/mapbox-setup-guide"
import Image from "next/image"

export default function SendMoneyPage() {
  const [formData, setFormData] = useState({
    recipient: "",
    amount: "",
    description: "",
    enableGeofence: false,
    enableTimeRestriction: false,
    startTime: "",
    endTime: "",
    geofenceCenter: null as { lat: number; lng: number } | null,
    geofenceRadius: 1000,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleGeofenceSelect = (center: { lat: number; lng: number }, radius: number) => {
    setFormData((prev) => ({
      ...prev,
      geofenceCenter: center,
      geofenceRadius: radius,
    }))
  }

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (!formData.recipient || !formData.amount) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    const amount = Number.parseFloat(formData.amount)
    const totalCost = amount * 1.02 // Include 2% fee

    // Check if user has sufficient balance including fees
    if (totalCost > 15420.5) {
      // This should be dynamic from API
      setError(`Insufficient balance. You need $${totalCost.toFixed(2)} (including 2% fee) but only have $15,420.50`)
      setIsLoading(false)
      return
    }

    try {
      const fromUserId = localStorage.getItem("userEmail") || "demo-user"
      const toUserId = formData.recipient // In real app, this would be resolved from email/phone

      // Call real API endpoint
      const response = await fetch("/api/transactions/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromUserId,
          toUserId,
          amount,
          description: formData.description || undefined,
          restrictions: {
            geofence: formData.enableGeofence
              ? {
                  center: formData.geofenceCenter,
                  radius: formData.geofenceRadius,
                }
              : undefined,
            timeWindow: formData.enableTimeRestriction
              ? {
                  startTime: formData.startTime,
                  endTime: formData.endTime,
                }
              : undefined,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send money")
      }

      setSuccess("Transaction created successfully! The recipient will be notified of any restrictions.")

      // Reset form after success
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send money. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

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
            <div className="relative w-8 h-8 mr-3">
              <Image src="/monkey-mascot.png" alt="Money Buddy Mascot" fill className="object-contain" />
            </div>
            <h1 className="text-xl font-bold text-white">Send Money</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transaction Form */}
          <Card className="card-gradient border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Transaction Details</CardTitle>
              <CardDescription className="text-white/70">Enter the recipient and amount details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMoney} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipient" className="text-white">
                    Recipient Email or Phone
                  </Label>
                  <Input
                    id="recipient"
                    name="recipient"
                    placeholder="Enter recipient's email or phone"
                    value={formData.recipient}
                    onChange={handleInputChange}
                    required
                    className="input-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white">
                    Amount ($)
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    className="input-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="What's this for?"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="textarea-white"
                  />
                </div>

                {/* Restrictions Section */}
                <div className="space-y-4 border-t border-white/20 pt-6">
                  <h3 className="text-lg font-medium text-white">Smart Restrictions</h3>

                  {/* Geofence Restriction */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center text-white">
                        <MapPin className="h-4 w-4 mr-2 text-lime-400" />
                        Geofence Restriction
                      </Label>
                      <p className="text-sm text-white/60">Recipient must be in specified area to receive funds</p>
                    </div>
                    <Switch
                      checked={formData.enableGeofence}
                      onCheckedChange={(checked) => handleSwitchChange("enableGeofence", checked)}
                    />
                  </div>

                  {/* Time Restriction */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center text-white">
                        <Clock className="h-4 w-4 mr-2 text-lime-400" />
                        Time Restriction
                      </Label>
                      <p className="text-sm text-white/60">Set time window for fund collection</p>
                    </div>
                    <Switch
                      checked={formData.enableTimeRestriction}
                      onCheckedChange={(checked) => handleSwitchChange("enableTimeRestriction", checked)}
                    />
                  </div>

                  {/* Time Restriction Inputs */}
                  {formData.enableTimeRestriction && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div className="space-y-2">
                        <Label htmlFor="startTime" className="text-white">
                          Start Time
                        </Label>
                        <Input
                          id="startTime"
                          name="startTime"
                          type="datetime-local"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className="input-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime" className="text-white">
                          End Time
                        </Label>
                        <Input
                          id="endTime"
                          name="endTime"
                          type="datetime-local"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          className="input-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-500/20 border-red-400/30">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-lime-500/20 border-lime-400/30">
                    <AlertDescription className="text-lime-200">{success}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full btn-accent text-white font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Money
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Map and Restrictions Summary */}
          <div className="space-y-6">
            {/* Geofence Map */}
            {formData.enableGeofence && (
              <Card className="card-gradient border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Set Geofence Area</CardTitle>
                  <CardDescription className="text-white/70">
                    Click on the map to set the center, then adjust the radius
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EnhancedMapboxGeofence
                    onGeofenceSelect={handleGeofenceSelect}
                    center={formData.geofenceCenter}
                    radius={formData.geofenceRadius}
                  />
                </CardContent>
              </Card>
            )}

            {/* Setup Guide */}
            {formData.enableGeofence && (
              <Card className="card-gradient border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Need Real Mapbox Maps?</CardTitle>
                  <CardDescription className="text-white/70">Currently using demo map interface</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => setShowSetupGuide(!showSetupGuide)}
                    className="w-full glass-effect text-white border-white/30 hover:bg-white/10"
                  >
                    {showSetupGuide ? "Hide" : "Show"} Setup Guide
                  </Button>
                  {showSetupGuide && (
                    <div className="mt-4">
                      <MapboxSetupGuide />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Restrictions Summary */}
            <Card className="card-gradient border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Transaction Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/80">Amount:</span>
                  <span className="font-medium text-white">
                    {formData.amount ? `$${Number.parseFloat(formData.amount).toFixed(2)}` : "$0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Transaction Fee (2%):</span>
                  <span className="font-medium text-red-300">
                    {formData.amount ? `$${(Number.parseFloat(formData.amount) * 0.02).toFixed(2)}` : "$0.00"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-2">
                  <span className="font-medium text-white">Total Deducted:</span>
                  <span className="font-medium text-white">
                    {formData.amount ? `$${(Number.parseFloat(formData.amount) * 1.02).toFixed(2)}` : "$0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Recipient Receives:</span>
                  <span className="font-medium text-lime-400">
                    {formData.amount ? `$${Number.parseFloat(formData.amount).toFixed(2)}` : "$0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Recipient:</span>
                  <span className="font-medium text-white">{formData.recipient || "Not specified"}</span>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <h4 className="font-medium mb-2 text-white">Active Restrictions:</h4>
                  <div className="space-y-2">
                    {formData.enableGeofence && (
                      <Badge className="mr-2 bg-purple-500/20 text-purple-300 border-purple-400/30">
                        <MapPin className="h-3 w-3 mr-1" />
                        Geofence ({formData.geofenceRadius}m radius)
                      </Badge>
                    )}
                    {formData.enableTimeRestriction && (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                        <Clock className="h-3 w-3 mr-1" />
                        Time Window
                      </Badge>
                    )}
                    {!formData.enableGeofence && !formData.enableTimeRestriction && (
                      <span className="text-white/60 text-sm">No restrictions applied</span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-lime-200 bg-lime-500/20 border border-lime-400/30 p-2 rounded">
                  <strong>Note:</strong> 2% transaction fee will be deducted from your wallet and sent to admin account.
                  Deposits are free.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
