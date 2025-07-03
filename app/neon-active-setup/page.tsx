"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  RefreshCw,
  ExternalLink,
  Copy,
  Zap,
  ArrowRight,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function NeonActiveSetupPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connectionString, setConnectionString] = useState("")
  const [step, setStep] = useState(1)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-neon-connection")
      const result = await response.json()
      setStatus(result)

      if (result.success) {
        setStep(3) // Skip to success step
      } else if (result.needsSetup) {
        setStep(2) // Go to setup step
      }
    } catch (error) {
      setStatus({
        success: false,
        error: "Failed to test connection",
        details: error instanceof Error ? error.message : "Unknown error",
      })
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const generateEnvFile = () => {
    if (!connectionString.trim()) {
      alert("Please enter your connection string first!")
      return
    }

    const envContent = `# Neon Database Configuration
# Project: neon-emerald-queen (ACTIVE)
# Generated: ${new Date().toLocaleString()}

# Primary connection string (required)
DATABASE_URL=${connectionString}

# Additional Neon environment variables (optional)
POSTGRES_URL=${connectionString}
POSTGRES_PRISMA_URL=${connectionString.replace("?", "?pgbouncer=true&connect_timeout=15&")}
DATABASE_URL_UNPOOLED=${connectionString}
POSTGRES_URL_NON_POOLING=${connectionString}

# Individual components (extracted from connection string)
POSTGRES_HOST=${connectionString.match(/@([^:/]+)/)?.[1] || "your-host"}
POSTGRES_USER=${connectionString.match(/\/\/([^:]+):/)?.[1] || "your-username"}
POSTGRES_PASSWORD=${connectionString.match(/:([^@]+)@/)?.[1] || "your-password"}
POSTGRES_DATABASE=${connectionString.match(/\/([^?]+)/)?.[1] || "neondb"}

# Other environment variables (keep existing ones)
# Add your other environment variables below this line`

    navigator.clipboard.writeText(envContent)
    alert("Environment file content copied to clipboard! Paste it into your .env.local file.")
  }

  useEffect(() => {
    testConnection()
  }, [])

  if (loading && !status) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Testing Active Database...</h2>
            <p className="text-white/80">Connecting to neon-emerald-queen</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <Zap className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Neon Database Setup</h1>
          <p className="text-white/90">Project: "neon-emerald-queen" - Now Active! 🎉</p>
        </div>

        {/* Step Progress */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= stepNum ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && <div className="w-8 h-1 bg-gray-300 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Database Status */}
        {step === 1 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Zap className="h-6 w-6" />
                Database is Active!
              </CardTitle>
              <CardDescription>
                Great! Your Neon database "neon-emerald-queen" is now active and ready to use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-100">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  ✅ Your database is no longer suspended and is ready for connections!
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold">Current Status:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>✅ Database is active (no longer suspended)</li>
                  <li>✅ Compute units are allocated (.25 ↔ 2 CU)</li>
                  <li>✅ Ready to accept connections</li>
                  <li>⚠️ Need to configure connection in your app</li>
                </ul>
              </div>

              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Get Connection String
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
              <CardDescription>Get your database credentials from the active Neon console</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Database className="h-4 w-4" />
                <AlertDescription>
                  <strong>Your database is active!</strong> You can now get the connection string without any delays.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-semibold">Follow these steps:</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>
                    <strong>Click "Connect" button:</strong> In your Neon console (top right corner)
                  </li>
                  <li>
                    <strong>Copy the connection string:</strong> It looks like:
                    <code className="block bg-gray-100 p-2 mt-1 text-xs rounded break-all">
                      postgresql://username:password@ep-neon-emerald-queen.us-east-2.aws.neon.tech/neondb?sslmode=require
                    </code>
                  </li>
                  <li>
                    <strong>Paste it below:</strong> We'll generate your .env.local file
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <Label htmlFor="connection-string">Paste Your Connection String:</Label>
                <Textarea
                  id="connection-string"
                  placeholder="postgresql://username:password@ep-neon-emerald-queen.us-east-2.aws.neon.tech/neondb?sslmode=require"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  className="font-mono text-xs"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={generateEnvFile} disabled={!connectionString.trim()} className="flex-1">
                  Generate .env.local File
                  <Copy className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild variant="outline">
                  <a
                    href="https://console.neon.tech/app/projects/neon-emerald-queen"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Neon Console <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>

              {connectionString.trim() && (
                <Button onClick={() => setStep(3)} className="w-full" variant="outline">
                  I've Added the Connection String to .env.local
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Test Connection */}
        {step === 3 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-6 w-6" />
                Test Your Connection
              </CardTitle>
              <CardDescription>Verify your Money Buddy app can connect to the active database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status?.success ? (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-100">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-800">
                      🎉 Successfully connected to your active Neon database!
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Database Info:</h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Project:</strong> {status.projectName}
                        </div>
                        <div>
                          <strong>Status:</strong> <Badge variant="default">{status.projectStatus}</Badge>
                        </div>
                        <div>
                          <strong>Database:</strong> {status.database}
                        </div>
                        <div>
                          <strong>Host:</strong> {status.host}
                        </div>
                        <div>
                          <strong>Response Time:</strong> {status.responseTime}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Tables Status:</h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Existing:</strong> {status.tables?.count || 0} tables
                        </div>
                        <div>
                          <strong>Missing:</strong> {status.tables?.missing?.length || 0} tables
                        </div>
                        {status.tables?.existingNames?.map((table: string) => (
                          <div key={table} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <code className="text-xs">{table}</code>
                            <span className="text-xs text-gray-500">({status.tables?.counts?.[table] || 0} rows)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {status.needsSetup && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Setup Required:</strong> Some tables are missing. Create them to start using Money
                        Buddy.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    <strong>Connection Failed:</strong> {status?.error}
                    <br />
                    <strong>Details:</strong> {status?.details}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button onClick={testConnection} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Test Connection
                </Button>

                {status?.success && status?.needsSetup && (
                  <Button asChild>
                    <a href="/setup-neon-database">Create Missing Tables</a>
                  </Button>
                )}

                {status?.success && !status?.needsSetup && (
                  <Button asChild>
                    <a href="/dashboard">Go to Dashboard</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline">
            <a
              href="https://console.neon.tech/app/projects/neon-emerald-queen"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Neon Console <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/api/test-neon-connection" target="_blank" rel="noreferrer">
              Test API Endpoint
            </a>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
