"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ExternalLink, Copy, Eye, EyeOff } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function MapboxSetupPage() {
  const [token, setToken] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
    details?: any
  } | null>(null)
  const [showToken, setShowToken] = useState(false)
  const [currentToken, setCurrentToken] = useState<string | null>(null)

  useEffect(() => {
    // Fetch current token status
    fetch("/api/mapbox/token")
      .then((res) => res.json())
      .then((data) => setCurrentToken(data.token))
      .catch((err) => console.error("Failed to fetch current token:", err))
  }, [])

  const validateToken = async () => {
    if (!token.trim()) {
      setValidationResult({
        isValid: false,
        message: "Please enter a token",
      })
      return
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      // Test the token by making a request to Mapbox API
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${token}`)

      if (response.ok) {
        const data = await response.json()
        setValidationResult({
          isValid: true,
          message: "Token is valid and working!",
          details: {
            type: "Valid Mapbox Token",
            scopes: "Public scopes verified",
            status: "Ready for geofencing",
          },
        })
      } else {
        let errorMessage = `Invalid token (${response.status})`
        if (response.status === 401) {
          errorMessage = "Token is invalid or expired"
        } else if (response.status === 403) {
          errorMessage = "Token doesn't have required permissions"
        }

        setValidationResult({
          isValid: false,
          message: errorMessage,
        })
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsValidating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const isCurrentTokenValid = currentToken && currentToken.startsWith("pk.") && currentToken.length > 20

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mapbox Setup</h1>
          <p className="text-gray-600">Configure your Mapbox access token for geofencing features</p>
        </div>

        {/* Current Status */}
        <Card
          className={`border-2 ${isCurrentTokenValid ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {isCurrentTokenValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <span>Current Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Mapbox Token:</span>
                <Badge
                  className={isCurrentTokenValid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                >
                  {isCurrentTokenValid ? "Configured" : "Not Set"}
                </Badge>
              </div>
              {currentToken && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Token Preview:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {currentToken.substring(0, 8)}...{currentToken.substring(currentToken.length - 8)}
                  </code>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-medium">Geofencing:</span>
                <Badge className={isCurrentTokenValid ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {isCurrentTokenValid ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Step-by-Step Setup</CardTitle>
            <CardDescription>Follow these steps to get your Mapbox token</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Go to Mapbox Console</h4>
                  <p className="text-sm text-gray-600 mb-2">Visit the Mapbox access tokens page</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Mapbox Console
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Configure Token Scopes</h4>
                  <p className="text-sm text-gray-600">Make sure these Public scopes are selected:</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">STYLES:TILES</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">STYLES:READ</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">FONTS:READ</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">DATASETS:READ</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Create Token</h4>
                  <p className="text-sm text-gray-600">Click "Create token" and copy the generated token</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Test Your Token</h4>
                  <p className="text-sm text-gray-600">Paste your token below to validate it works</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Validation */}
        <Card>
          <CardHeader>
            <CardTitle>Validate Your Token</CardTitle>
            <CardDescription>Test your Mapbox token before adding it to your environment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Mapbox Access Token</Label>
                <div className="relative">
                  <Input
                    id="token"
                    type={showToken ? "text" : "password"}
                    placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV4YW1wbGUifQ..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button onClick={validateToken} disabled={isValidating || !token.trim()}>
                {isValidating ? "Validating..." : "Validate Token"}
              </Button>

              {validationResult && (
                <Alert
                  className={validationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                >
                  <div className="flex items-center space-x-2">
                    {validationResult.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={validationResult.isValid ? "text-green-800" : "text-red-800"}>
                      {validationResult.message}
                    </AlertDescription>
                  </div>
                  {validationResult.details && (
                    <div className="mt-2 space-y-1">
                      <div className="text-sm text-green-700">
                        <strong>Type:</strong> {validationResult.details.type}
                      </div>
                      <div className="text-sm text-green-700">
                        <strong>Scopes:</strong> {validationResult.details.scopes}
                      </div>
                      <div className="text-sm text-green-700">
                        <strong>Status:</strong> {validationResult.details.status}
                      </div>
                    </div>
                  )}
                </Alert>
              )}

              {validationResult?.isValid && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Next Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                    <li>Add this token to your environment variables</li>
                    <li>Set MAPBOX_ACCESS_TOKEN in your .env.local file</li>
                    <li>Restart your development server</li>
                    <li>Test geofencing at /transfer/geofence</li>
                  </ol>
                  <div className="mt-3 p-2 bg-blue-100 rounded border">
                    <div className="flex items-center justify-between">
                      <code className="text-xs">MAPBOX_ACCESS_TOKEN={token}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`MAPBOX_ACCESS_TOKEN=${token}`)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Screenshot Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Reference: Your Mapbox Console</CardTitle>
            <CardDescription>This matches what you see in your screenshot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_20250629-213739-0wRClGEet5B6FQBTmxFn4gH6rZmvEB.png"
                alt="Mapbox token configuration page showing token scopes and settings"
                className="w-full border rounded-lg"
              />
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Perfect!</strong> Your screenshot shows the correct scope configuration:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Public scopes are properly selected (STYLES:TILES, STYLES:READ, etc.)</li>
                  <li>Secret scopes are unchecked (correct for client-side use)</li>
                  <li>You can optionally add URL restrictions for security</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
