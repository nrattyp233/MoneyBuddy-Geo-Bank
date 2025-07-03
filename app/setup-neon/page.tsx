"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, AlertTriangle, Database, ExternalLink, Copy, RefreshCw, ArrowRight } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function SetupNeonPage() {
  const [step, setStep] = useState(1)
  const [connectionString, setConnectionString] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [envContent, setEnvContent] = useState("")

  const generateEnvContent = () => {
    const content = `# Neon Database Configuration
DATABASE_URL=${connectionString}
POSTGRES_URL=${connectionString}
POSTGRES_PRISMA_URL=${connectionString}
DATABASE_URL_UNPOOLED=${connectionString.replace("?sslmode=require", "?sslmode=require&pgbouncer=true&connect_timeout=15")}`

    setEnvContent(content)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const testConnection = async () => {
    if (!connectionString) {
      alert("Please enter your connection string first")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/test-neon-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionString,
        }),
      })

      const result = await response.json()
      setTestResult(result)

      if (result.success) {
        generateEnvContent()
        setStep(4) // Success step
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <Database className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Setup Neon Database</h1>
          <p className="text-white/90">Connect your serverless PostgreSQL database</p>
        </div>

        {/* Step Progress */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= stepNum ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 4 && <div className="w-8 h-1 bg-gray-300 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Create Neon Project */}
        {step === 1 && (
          <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Step 1: Create Neon Database</CardTitle>
              <CardDescription>First, let's create a new Neon serverless PostgreSQL database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Neon provides serverless PostgreSQL that's perfect for Next.js applications with automatic scaling.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-semibold">Follow these steps:</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>
                    <strong>Go to Neon:</strong> Visit{" "}
                    <a
                      href="https://console.neon.tech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      console.neon.tech <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <strong>Sign up or Sign in:</strong> Create an account with GitHub, Google, or email
                  </li>
                  <li>
                    <strong>Create New Project:</strong> Click "Create Project" or "New Project"
                  </li>
                  <li>
                    <strong>Project Settings:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Name: "Money Buddy" (or any name you prefer)</li>
                      <li>PostgreSQL Version: Latest (15+)</li>
                      <li>Region: Choose closest to your users</li>
                      <li>Plan: Free tier is perfect for development</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Create Database:</strong> Click "Create Project" and wait for initialization
                  </li>
                </ol>
              </div>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tip:</strong> Neon automatically creates a database and provides connection pooling for
                  optimal performance!
                </AlertDescription>
              </Alert>

              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                I've Created My Neon Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Get Connection String */}
        {step === 2 && (
          <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Step 2: Get Your Connection String</CardTitle>
              <CardDescription>Now let's get the database connection string from your Neon project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">In your Neon Console:</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>
                    <strong>Go to Dashboard:</strong> You should see your new project dashboard
                  </li>
                  <li>
                    <strong>Find Connection Details:</strong> Look for "Connection Details" or "Connect" section
                  </li>
                  <li>
                    <strong>Select Database:</strong> Choose your main database (usually named after your project)
                  </li>
                  <li>
                    <strong>Copy Connection String:</strong> Look for "Connection string" and copy the full URL
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>
                        Should start with: <code className="bg-gray-100 px-1 rounded">postgresql://</code>
                      </li>
                      <li>Contains your username, password, host, and database name</li>
                      <li>
                        Ends with: <code className="bg-gray-100 px-1 rounded">?sslmode=require</code>
                      </li>
                    </ul>
                  </li>
                </ol>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Example format:</strong>
                  <br />
                  <code className="text-xs">
                    postgresql://username:password@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
                  </code>
                </AlertDescription>
              </Alert>

              <Button onClick={() => setStep(3)} className="w-full" size="lg">
                I Have My Connection String
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Enter Connection String */}
        {step === 3 && (
          <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Step 3: Enter Your Connection String</CardTitle>
              <CardDescription>Paste your Neon database connection string</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="connectionString">Neon Connection String</Label>
                  <Textarea
                    id="connectionString"
                    placeholder="postgresql://username:password@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
                    value={connectionString}
                    onChange={(e) => setConnectionString(e.target.value)}
                    className="font-mono text-xs"
                    rows={3}
                  />
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Make sure to copy the entire connection string including the password and SSL parameters.
                </AlertDescription>
              </Alert>

              <Button onClick={testConnection} disabled={loading || !connectionString} className="w-full" size="lg">
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>

              {testResult && !testResult.success && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Connection Failed:</strong> {testResult.error}
                    <br />
                    <strong>Details:</strong> {testResult.details}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success & Environment Setup */}
        {step === 4 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-6 w-6" />
                Connection Successful!
              </CardTitle>
              <CardDescription>
                Your Neon database is connected. Now let's update your environment file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-100">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  ✅ Successfully connected to your Neon database!
                  <br />
                  Database: {testResult?.database}
                  <br />
                  Version: {testResult?.version}
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-2">Update Your .env.local File</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Copy this content and replace the database section in your .env.local file:
                </p>

                <div className="relative">
                  <Textarea value={envContent} readOnly className="font-mono text-xs bg-gray-50" rows={6} />
                  <Button
                    onClick={() => copyToClipboard(envContent)}
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Next Steps:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Copy the environment variables above</li>
                    <li>Paste them into your .env.local file (replace the database section)</li>
                    <li>Save the file</li>
                    <li>Restart your development server (stop and run npm run dev)</li>
                    <li>Create database tables</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button asChild>
                  <a href="/setup-neon-database">Setup Database Tables</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/setup-results">Check Status</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
