"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Send, User, DollarSign, Clock, AlertTriangle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { GeofenceMap } from "@/components/geofence-map"
import { supabase, createGeofence, createTransaction } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function GeofenceTransferPage() {
  const [transferData, setTransferData] = useState({
    recipientEmail: "",
    amount: "",
    memo: "",
    locationName: "",
    expirationHours: "24",
  })
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null)
  const [radius, setRadius] = useState(100) // meters
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
    }

    // Get user's current location as initial map location
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setMapLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          },
          (error) => {
            console.error("Error getting location:", error)
            // Set a default location (NYC)
            setMapLocation({ lat: 40.7128, lng: -74.0060 })
          }
        )
      } else {
        // Geolocation not supported, use default
        setMapLocation({ lat: 40.7128, lng: -74.0060 })
      }
    }

    getUser()
    getLocation()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTransferData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!transferData.recipientEmail.trim()) {
      newErrors.recipientEmail = "Recipient email is required"
    } else if (!/\S+@\S+\.\S+/.test(transferData.recipientEmail)) {
      newErrors.recipientEmail = "Please enter a valid email address"
    }

    if (!transferData.amount.trim()) {
      newErrors.amount = "Amount is required"
    } else if (isNaN(Number(transferData.amount)) || Number(transferData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount"
    }

    if (!transferData.locationName.trim()) {
      newErrors.locationName = "Location name is required"
    }

    if (radius <= 0) {
      newErrors.radius = "Please set a valid radius on the map"
    }

    if (!mapLocation) {
      newErrors.location = "Please select a location on the map"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!user || !mapLocation) {
      setErrors({ submit: "User not authenticated or location not selected" })
      return
    }

    setIsLoading(true)

    try {
      // Create transaction first
      const transactionData = {
        user_id: user.id,
        type: "geofence_transfer" as const,
        amount: Number(transferData.amount),
        description: `Geofence transfer to ${transferData.recipientEmail}`,
        recipient_email: transferData.recipientEmail,
        status: "pending" as const,
        fee: 0,
      }

      const transaction = await createTransaction(transactionData)

      if (!transaction) {
        setErrors({ submit: "Failed to create transaction" })
        return
      }

      // Calculate expiration date
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + Number(transferData.expirationHours))

      // Create geofence
      const geofenceData = {
        user_id: user.id,
        transaction_id: transaction.id,
        name: transferData.locationName,
        center_lat: mapLocation.lat,
        center_lng: mapLocation.lng,
        radius: radius,
        amount: Number(transferData.amount),
        recipient_email: transferData.recipientEmail,
        memo: transferData.memo || undefined,
        is_active: true,
        is_claimed: false,
        expires_at: expiresAt.toISOString(),
      }

      const geofence = await createGeofence(geofenceData)

      if (!geofence) {
        setErrors({ submit: "Failed to create geofence" })
        return
      }

      // Success! Redirect to dashboard
      router.push("/dashboard?tab=transactions")
    } catch (error) {
      console.error("Geofence transfer error:", error)
      setErrors({ submit: "Failed to create geofence transfer. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Geofence Transfer</h1>
          <p className="text-gray-600 mt-2">
            Set up a location-based transfer that can only be claimed when the recipient is at your current location.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transfer Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                Create Geofence Transfer
              </CardTitle>
              <CardDescription>
                Select a location on the map and set the geofence radius. The recipient will need to be within {radius}m of the selected location to claim this transfer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Recipient Email */}
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Recipient Email
                  </Label>
                  <Input
                    id="recipientEmail"
                    name="recipientEmail"
                    type="email"
                    placeholder="recipient@example.com"
                    value={transferData.recipientEmail}
                    onChange={handleInputChange}
                    className={errors.recipientEmail ? "border-red-500" : ""}
                  />
                  {errors.recipientEmail && (
                    <p className="text-red-500 text-sm">{errors.recipientEmail}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Amount ($)
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    value={transferData.amount}
                    onChange={handleInputChange}
                    className={errors.amount ? "border-red-500" : ""}
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-sm">{errors.amount}</p>
                  )}
                </div>

                {/* Location Name */}
                <div className="space-y-2">
                  <Label htmlFor="locationName" className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location Name
                  </Label>
                  <Input
                    id="locationName"
                    name="locationName"
                    type="text"
                    placeholder="Coffee Shop Downtown"
                    value={transferData.locationName}
                    onChange={handleInputChange}
                    className={errors.locationName ? "border-red-500" : ""}
                  />
                  {errors.locationName && (
                    <p className="text-red-500 text-sm">{errors.locationName}</p>
                  )}
                </div>

                {/* Map Component */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Select Location & Set Radius
                  </Label>
                  <GeofenceMap
                    onLocationChange={(location) => {
                      setMapLocation(location)
                      if (location.address && !transferData.locationName) {
                        setTransferData(prev => ({ ...prev, locationName: location.address!.split(',')[0] }))
                      }
                    }}
                    onRadiusChange={(newRadius) => setRadius(newRadius)}
                    initialLocation={mapLocation || undefined}
                    initialRadius={radius}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm">{errors.location}</p>
                  )}
                  {errors.radius && (
                    <p className="text-red-500 text-sm">{errors.radius}</p>
                  )}
                </div>

                {/* Expiration */}
                <div className="space-y-2">
                  <Label htmlFor="expirationHours" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Expires in (hours)
                  </Label>
                  <Input
                    id="expirationHours"
                    name="expirationHours"
                    type="number"
                    placeholder="24"
                    value={transferData.expirationHours}
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-gray-500">
                    How long the transfer will be available for claiming
                  </p>
                </div>

                {/* Memo */}
                <div className="space-y-2">
                  <Label htmlFor="memo">Memo (Optional)</Label>
                  <Textarea
                    id="memo"
                    name="memo"
                    placeholder="Thanks for lunch!"
                    value={transferData.memo}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}

                {errors.location && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors.location}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !mapLocation}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Geofence Transfer...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="h-4 w-4 mr-2" />
                      Create Geofence Transfer
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                How Geofence Transfers Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Set Location</h4>
                    <p className="text-sm text-gray-600">
                      Your current location will be used as the geofence center
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Recipient Gets Notified</h4>
                    <p className="text-sm text-gray-600">
                      They'll receive an email with instructions to claim the transfer
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Location Verification</h4>
                    <p className="text-sm text-gray-600">
                      They must be within the specified radius to claim the money
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-medium">Transfer Complete</h4>
                    <p className="text-sm text-gray-600">
                      Once claimed, the money is instantly transferred
                    </p>
                  </div>
                </div>
              </div>

              {mapLocation && (
                <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">Selected Location</h4>
                  <p className="text-sm text-green-600">
                    Lat: {mapLocation.lat.toFixed(6)}, Lng: {mapLocation.lng.toFixed(6)}
                  </p>
                  {mapLocation.address && (
                    <p className="text-sm text-green-600 mt-1">
                      {mapLocation.address}
                    </p>
                  )}
                  <p className="text-xs text-green-500 mt-1">
                    Radius: {radius}m ✓
                  </p>
                </div>
              )}

              {!mapLocation && (
                <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-medium text-amber-800">Select Location</h4>
                  <p className="text-sm text-amber-600">
                    Click on the map or search for an address to set the geofence location
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
