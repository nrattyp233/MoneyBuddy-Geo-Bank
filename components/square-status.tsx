"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, CheckCircle, AlertCircle, ExternalLink, Shield } from "lucide-react"

export function SquareStatus() {
  const [hasAccessToken, setHasAccessToken] = useState(false)
  const [hasApplicationId, setHasApplicationId] = useState(false)
  const [environment, setEnvironment] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if Square credentials are configured
    const accessToken = process.env.SQUARE_ACCESS_TOKEN
    const applicationId = process.env.SQUARE_APPLICATION_ID
    const env = process.env.SQUARE_ENVIRONMENT || "sandbox"

    setHasAccessToken(!!accessToken && accessToken !== "your_square_access_token_here")
    setHasApplicationId(!!applicationId && applicationId !== "your_square_application_id_here")
    setEnvironment(env)
    setIsLoading(false)
  }, [])

  const isFullyConfigured = hasAccessToken && hasApplicationId
  const isProduction = environment === "production"

  if (isLoading) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
            <span className="text-gray-500">Checking Square configuration...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`border-2 ${isFullyConfigured ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Square Payment Processing</span>
          {isFullyConfigured ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Setup Required
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isFullyConfigured
            ? `Square is configured for ${isProduction ? "PRODUCTION" : "SANDBOX"} mode`
            : "Square API credentials are required for payment processing"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Configuration Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${hasAccessToken ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-sm">Access Token</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${hasApplicationId ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-sm">Application ID</span>
            </div>
          </div>

          {/* Environment Badge */}
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Environment:</span>
            <Badge variant={isProduction ? "destructive" : "secondary"}>{environment.toUpperCase()}</Badge>
          </div>

          {isFullyConfigured ? (
            <div className="space-y-3">
              <p className="text-sm text-green-700">
                ✅ Real money deposits and withdrawals enabled
                <br />✅ Credit/debit card processing active
                <br />✅ Secure payment handling configured
                <br />✅ Transaction fees and receipts available
              </p>
              {!isProduction && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Sandbox Mode:</strong> Use test card numbers for development. Switch to production when
                    ready for real transactions.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-yellow-700">
                To enable real money processing, you need to add your Square API credentials.
              </p>

              <div className="bg-white p-3 rounded border border-yellow-200 space-y-2">
                <div className="text-sm">
                  <strong>Required Environment Variables:</strong>
                </div>
                <code className="text-xs text-gray-800 block">
                  SQUARE_ACCESS_TOKEN=EAAAl...your_token_here
                  <br />
                  SQUARE_APPLICATION_ID=sandbox-sq0idb-...your_id_here
                  <br />
                  SQUARE_ENVIRONMENT=sandbox
                </code>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("https://developer.squareup.com/apps", "_blank")}
                  className="bg-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Square Developer Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("/docs/square-setup.md", "_blank")}
                  className="bg-white"
                >
                  Setup Guide
                </Button>
              </div>
            </div>
          )}

          {/* Test Card Numbers for Sandbox */}
          {isFullyConfigured && !isProduction && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Test Card Numbers (Sandbox):</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <strong>Visa:</strong> 4111 1111 1111 1111
                </div>
                <div>
                  <strong>Mastercard:</strong> 5105 1051 0510 5100
                </div>
                <div>
                  <strong>Declined:</strong> 4000 0000 0000 0002
                </div>
                <div className="text-gray-500 mt-2">Use any future expiry date and CVV</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
