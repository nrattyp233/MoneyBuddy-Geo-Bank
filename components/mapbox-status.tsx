"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, ExternalLink, RefreshCw } from "lucide-react"

interface MapboxStatus {
  hasToken: boolean
  isValidFormat: boolean
  isWorking: boolean
  error?: string
  isLoading: boolean
}

export function MapboxStatus() {
  const [status, setStatus] = useState<MapboxStatus>({
    hasToken: false,
    isValidFormat: false,
    isWorking: false,
    isLoading: true,
  })

  const checkMapboxStatus = async () => {
    setStatus((prev) => ({ ...prev, isLoading: true, error: undefined }))

    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

      // Token presence / placeholder / format check
      if (
        !token ||
        !token.startsWith("pk.") ||
        token.includes("your_mapbox_access_token_here") ||
        token.match(/<.*MAPBOX.*TOKEN.*>/i)
      ) {
        setStatus({
          hasToken: !!token,
          isValidFormat: token?.startsWith("pk.") ?? false,
          isWorking: false,
          isLoading: false,
          error: "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is missing or still the sample value.",
        })
        return
      }

      // Test token by making API call
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${token}`)

      if (response.ok) {
        setStatus({
          hasToken: true,
          isValidFormat: true,
          isWorking: true,
          isLoading: false,
        })
      } else {
        let errorMessage = `API returned ${response.status}: ${response.statusText}`

        if (response.status === 401) {
          errorMessage = "Token is invalid or expired. Please check your Mapbox account."
        } else if (response.status === 403) {
          errorMessage = "Token doesn't have the required permissions for geocoding API."
        }

        setStatus({
          hasToken: true,
          isValidFormat: true,
          isWorking: false,
          isLoading: false,
          error: errorMessage,
        })
      }
    } catch (error) {
      setStatus({
        hasToken: true,
        isValidFormat: true,
        isWorking: false,
        isLoading: false,
        error: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  useEffect(() => {
    checkMapboxStatus()
  }, [])

  const getStatusIcon = () => {
    if (status.isLoading) {
      return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
    }

    if (status.isWorking) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }

    if (!status.hasToken || !status.isValidFormat) {
      return <XCircle className="h-5 w-5 text-red-500" />
    }

    return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }

  const getStatusText = () => {
    if (status.isLoading) return "Checking Mapbox configuration..."
    if (status.isWorking) return "Mapbox is configured and working correctly"
    if (!status.hasToken) return "Mapbox token not found"
    if (!status.isValidFormat) return "Invalid Mapbox token format"
    return "Mapbox token found but not working"
  }

  const getStatusColor = () => {
    if (status.isLoading) return "border-blue-200 bg-blue-50"
    if (status.isWorking) return "border-green-200 bg-green-50"
    if (!status.hasToken || !status.isValidFormat) return "border-red-200 bg-red-50"
    return "border-yellow-200 bg-yellow-50"
  }

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>Mapbox Integration Status</span>
        </CardTitle>
        <CardDescription>Status of your Mapbox configuration for geofenced transfers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          <span className={`font-bold ${status.isWorking ? "text-green-600" : "text-red-600"}`}>{getStatusText()}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {status.hasToken ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Token Present</span>
          </div>

          <div className="flex items-center space-x-2">
            {status.isValidFormat ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Valid Format</span>
          </div>

          <div className="flex items-center space-x-2">
            {status.isWorking ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">API Working</span>
          </div>
        </div>

        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Error Details:</p>
            <p className="text-sm text-red-600">{status.error}</p>
          </div>
        )}

        {!status.isWorking && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">How to fix:</p>
              <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                <li>Go to your Mapbox account dashboard</li>
                <li>Create a new access token or copy an existing one</li>
                <li>Add it to your environment variables as NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</li>
                <li>Restart your development server</li>
              </ol>
            </div>

            <div className="flex space-x-2">
              <Button onClick={checkMapboxStatus} disabled={status.isLoading} size="sm" variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${status.isLoading ? "animate-spin" : ""}`} />
                Recheck Status
              </Button>

              <Button
                onClick={() => window.open("https://account.mapbox.com/access-tokens/", "_blank")}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Get Token
              </Button>
            </div>
          </div>
        )}

        {status.isWorking && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">✅ Ready to use!</p>
            <p className="text-sm text-green-700">
              Your Mapbox integration is working correctly. You can now create geofenced transfers with custom drawn
              circles.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
