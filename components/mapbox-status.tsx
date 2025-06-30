"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink, AlertCircle, CheckCircle } from "lucide-react"

export function MapboxStatus() {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/mapbox/token")
      .then((res) => res.json())
      .then((data) => {
        setToken(data.token)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch Mapbox token:", err)
        setIsLoading(false)
      })
  }, [])

  const isValidToken =
    token && token.startsWith("pk.") && !token.includes("your_mapbox_token_here") && token.length > 20

  const isConfigured = Boolean(token)
  const tokenPreview = token ? `${token.substring(0, 8)}...${token.substring(token.length - 8)}` : "Not set"

  if (isLoading) {
    return (
      <Card className="border-2 border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Mapbox Configuration</span>
            <Badge className="bg-gray-100 text-gray-800">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Checking Mapbox configuration...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-2 ${isValidToken ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Mapbox Configuration</span>
          {isValidToken ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              {isConfigured ? "Invalid Token" : "Not Configured"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Mapbox powers the geofencing and location features in Money Buddy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Access Token</span>
                  <Badge className={isValidToken ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {isValidToken ? "Valid" : "Invalid/Missing"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Token Preview</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{tokenPreview}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Geofencing</span>
                  <Badge className={isValidToken ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {isValidToken ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Features</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isValidToken ? "bg-green-500" : "bg-gray-400"}`}></div>
                  <span>Interactive Maps</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isValidToken ? "bg-green-500" : "bg-gray-400"}`}></div>
                  <span>Circle Drawing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isValidToken ? "bg-green-500" : "bg-gray-400"}`}></div>
                  <span>Location Services</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isValidToken ? "bg-green-500" : "bg-gray-400"}`}></div>
                  <span>Geofenced Transfers</span>
                </div>
              </div>
            </div>
          </div>

          {!isValidToken && (
            <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-800">Setup Required</h4>
                  <p className="text-sm text-yellow-700">
                    To enable geofencing features, you need to configure your Mapbox access token.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-yellow-700 font-medium">Setup Steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
                      <li>Create a Mapbox account at mapbox.com</li>
                      <li>Generate a new access token</li>
                      <li>Add MAPBOX_ACCESS_TOKEN to your environment</li>
                      <li>Restart your application</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://account.mapbox.com/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Mapbox Account
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://docs.mapbox.com/api/overview/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Documentation
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
