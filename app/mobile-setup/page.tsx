"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Smartphone, RefreshCw } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function MobileSetupPage() {
  const [step, setStep] = useState(1)
  const [testResult, setTestResult] = useState<any>(null)
  const [setupResult, setSetupResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runConnectionTest = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-supabase")
      const result = await response.json()
      setTestResult(result)
      if (result.success) {
        setStep(3) // Skip to success step
      } else {
        setStep(2) // Go to troubleshooting
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: "Failed to test connection",
        details: error instanceof Error ? error.message : "Unknown error",
      })
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const runDatabaseSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/setup-database", { method: "POST" })
      const result = await response.json()
      setSetupResult(result)

      if (result.success) {
        setStep(4) // Complete
        // Re-run connection test to update table info
        setTimeout(runConnectionTest, 1000)
      } else {
        alert("Database setup failed: " + result.error)
      }
    } catch (error) {
      alert("Setup failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <div className="text-center">
          <Smartphone className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold">Mobile Setup Assistant</h1>
          <p className="text-gray-600">Let me handle the setup for you</p>
        </div>

        {/* Step 1: Initial Setup */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Test Your Connection</CardTitle>
              <CardDescription>I'll check if your Supabase database is connected properly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Make sure you've updated your .env.local file with the correct Supabase credentials before testing.
                </AlertDescription>
              </Alert>

              <Button onClick={runConnectionTest} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  "Test Supabase Connection"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Connection Failed */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Connection Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {testResult?.error}
                  <br />
                  <strong>Details:</strong> {testResult?.details}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold">To Fix This:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Make sure you copied the correct Supabase credentials to your .env.local file</li>
                  <li>Restart your development server (stop and run npm run dev again)</li>
                  <li>Check that your Supabase project is active in the dashboard</li>
                </ol>
              </div>

              <Button onClick={runConnectionTest} variant="outline" className="w-full bg-transparent">
                Test Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Connection Success, Setup Database */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Connection Successful!
              </CardTitle>
              <CardDescription>Connected to project: {testResult?.projectInfo?.projectId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Your app is successfully connected to Supabase!</AlertDescription>
              </Alert>

              {testResult?.needsSetup && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Database Setup Needed</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Your database is empty. I'll create the required tables for Money Buddy.
                    </p>
                    <p className="text-xs text-gray-500">Missing tables: {testResult.missingTables?.join(", ")}</p>
                  </div>

                  <Button onClick={runDatabaseSetup} disabled={loading} className="w-full" size="lg">
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Setting Up Database...
                      </>
                    ) : (
                      "Create Database Tables"
                    )}
                  </Button>
                </div>
              )}

              {!testResult?.needsSetup && (
                <div className="space-y-4">
                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Your database is already set up and ready to use!</AlertDescription>
                  </Alert>

                  <Button onClick={() => setStep(4)} className="w-full">
                    Continue to App
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Setup Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Money Buddy is now fully connected to your Supabase database and ready to use!
                </AlertDescription>
              </Alert>

              {setupResult && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Setup Results:</h4>
                  <div className="text-sm space-y-1">
                    {setupResult.results?.map((result: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{result}</span>
                      </div>
                    ))}
                    {setupResult.errors?.map((error: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <XCircle className="h-3 w-3 text-red-500" />
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <Button asChild>
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/transfer/geofence">Try Geofence Transfer</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/check-supabase">View Database Status</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Status Display */}
        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <span className={testResult.success ? "text-green-600" : "text-red-600"}>
                    {testResult.success ? "✅ Connected" : "❌ Failed"}
                  </span>
                </div>
                {testResult.projectInfo && (
                  <div className="flex justify-between">
                    <span>Project ID:</span>
                    <span className="font-mono text-xs">{testResult.projectInfo.projectId}</span>
                  </div>
                )}
                {testResult.tables && (
                  <div className="flex justify-between">
                    <span>Tables:</span>
                    <span>{testResult.tables.filter((t: any) => t.exists).length} found</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
