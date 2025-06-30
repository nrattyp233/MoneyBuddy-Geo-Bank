"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, CreditCard, MapPin, Loader2 } from "lucide-react"

interface SquareTestResult {
  success: boolean
  configuration?: {
    access_token: string
    application_id: string
    location_id: string
    environment: string
    webhook_key: string
  }
  location_id?: string
  environment?: string
  ready_for_payments?: boolean
  error?: string
  missing_variables?: string[]
}

export default function TestSquarePage() {
  const [testResult, setTestResult] = useState<SquareTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testSquareConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/square/test-connection")
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: "Failed to connect to Square API",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testDeposit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/square/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 10.0,
          cardNumber: "4111111111111111", // Test card number
          expiryDate: "12/25",
          cvv: "123",
          cardholderName: "Test User",
          userEmail: "test@example.com",
        }),
      })
      const result = await response.json()
      console.log("Deposit test result:", result)
      alert(result.success ? "Deposit test successful!" : `Deposit test failed: ${result.error}`)
    } catch (error) {
      alert("Deposit test failed: Network error")
    } finally {
      setIsLoading(false)
    }
  }

  const testWithdrawal = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/square/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 5.0,
          method: "instant",
          userEmail: "test@example.com",
        }),
      })
      const result = await response.json()
      console.log("Withdrawal test result:", result)
      alert(result.success ? "Withdrawal test successful!" : `Withdrawal test failed: ${result.error}`)
    } catch (error) {
      alert("Withdrawal test failed: Network error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Square Integration Test</h1>
        <p className="text-gray-600">Test your Square payment processing configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Square Configuration Test</span>
          </CardTitle>
          <CardDescription>Verify all Square API credentials are properly configured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testSquareConnection} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              "Test Square Connection"
            )}
          </Button>

          {testResult && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connection Successful
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Connection Failed
                  </Badge>
                )}
              </div>

              {testResult.configuration && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium">Configuration Status:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Access Token: {testResult.configuration.access_token}</div>
                    <div>Application ID: {testResult.configuration.application_id}</div>
                    <div>Location ID: {testResult.configuration.location_id}</div>
                    <div>Environment: {testResult.configuration.environment}</div>
                    <div>Webhook Key: {testResult.configuration.webhook_key}</div>
                  </div>
                </div>
              )}

              {testResult.location_id && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Location ID Configured</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Location ID: <code className="bg-blue-100 px-1 rounded">{testResult.location_id}</code>
                  </p>
                  <p className="text-sm text-blue-700">
                    Environment: <code className="bg-blue-100 px-1 rounded">{testResult.environment}</code>
                  </p>
                </div>
              )}

              {testResult.missing_variables && testResult.missing_variables.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Missing Configuration:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {testResult.missing_variables.map((variable) => (
                      <li key={variable}>• {variable}</li>
                    ))}
                  </ul>
                </div>
              )}

              {testResult.error && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-700">{testResult.error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {testResult?.ready_for_payments && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Processing Tests</CardTitle>
            <CardDescription>Test actual deposit and withdrawal processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={testDeposit} disabled={isLoading} variant="outline">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Test $10 Deposit
              </Button>
              <Button onClick={testWithdrawal} disabled={isLoading} variant="outline">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                Test $5 Withdrawal
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              <p>
                <strong>Note:</strong> These tests use sandbox/demo data. No real money will be processed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
