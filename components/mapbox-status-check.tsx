"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, MapPin } from "lucide-react"

export default function MapboxStatusCheck() {
  const [mapboxStatus, setMapboxStatus] = useState<{
    hasToken: boolean
    tokenValid: boolean
    isLoading: boolean
  }>({
    hasToken: false,
    tokenValid: false,
    isLoading: true,
  })

  useEffect(() => {
    checkMapboxStatus()
  }, [])

  const checkMapboxStatus = async () => {
    try {
      const response = await fetch("/api/maps/mapbox-config")
      const status = await response.json()

      setMapboxStatus({
        hasToken: status.hasToken,
        tokenValid: status.tokenValid,
        isLoading: false,
      })
    } catch (error) {
      setMapboxStatus({
        hasToken: false,
        tokenValid: false,
        isLoading: false,
      })
    }
  }

  if (mapboxStatus.isLoading) {
    return (
      <Alert className="bg-blue-500/20 border-blue-400/30">
        <MapPin className="h-4 w-4 animate-pulse" />
        <AlertDescription className="text-blue-200">Checking secure Mapbox connection...</AlertDescription>
      </Alert>
    )
  }

  if (!mapboxStatus.hasToken) {
    return (
      <Alert variant="destructive" className="bg-red-500/20 border-red-400/30">
        <XCircle className="h-4 w-4" />
        <AlertDescription className="text-red-200">
          <strong>No Mapbox Token:</strong> Add your MAPBOX_ACCESS_TOKEN to environment variables (server-side)
        </AlertDescription>
      </Alert>
    )
  }

  if (!mapboxStatus.tokenValid) {
    return (
      <Alert variant="destructive" className="bg-red-500/20 border-red-400/30">
        <XCircle className="h-4 w-4" />
        <AlertDescription className="text-red-200">
          <strong>Invalid Token:</strong> Your Mapbox token appears to be invalid. Please check your API key.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-lime-500/20 border-lime-400/30">
      <CheckCircle className="h-4 w-4" />
      <AlertDescription className="text-lime-200">
        <strong>Secure Mapbox Connected!</strong> Real maps are active with server-side token protection.
      </AlertDescription>
    </Alert>
  )
}
