"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Copy, Database, Key, Loader2, AlertTriangle, ExternalLink } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

interface ConnectionResult {
  success: boolean
  error?: string
  details?: string
  connectionTime?: number
  database?: string
  version?: string
  user?: string
  host?: string
  projectName?: string
  tables?: {
    existing: Array<{ name: string; columns: number }>
    missing: string[]
    count: number
    counts: Record<string, number>
  }
  needsSetup?: boolean
}

export default function NeonQuickSetupPage() {
  const [connectionString, setConnectionString] = useState("")
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<ConnectionResult | null>(null)
  const [envContent, setEnvContent] = useState("")

  const testConnection = async () => {
    if (!connectionString.trim()) {
      alert("Please enter a connection string")
      return
    }

    setTesting(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-connection-string", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionString: connectionString.trim() }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        generateEnvContent(connectionString.trim())
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setTesting(false)
    }
  }

  const generateEnvContent = (connStr: string) => {
    const content = `# Neon Database Configuration
# Generated from your connection string

# Primary connection string (required)
DATABASE_URL=${connStr}

# Additional environment variables for compatibility
POSTGRES_URL=${connStr}
POSTGRES_PRISMA_URL=${connStr}&pgbouncer=true&connect_timeout=15
DATABASE_URL_UNPOOLED=${connStr}
POSTGRES_URL_NON_POOLING=${connStr}

# Individual components (extracted from connection string)
${extractConnectionComponents(connStr)}`

    setEnvContent(content)
  }

  const extractConnectionComponents = (connStr: string) => {
    try {
      const url = new URL(connStr)
      return `POSTGRES_HOST=${url.hostname}
POSTGRES_USER=${url.username}
POSTGRES_PASSWORD=${url.password}
POSTGRES_DATABASE=${url.pathname.slice(1)}`
    } catch {
      return `# Could not extract individual components
# The DATABASE_URL above should be sufficient`
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const isValidConnectionString = (str: string) => {
    return str.startsWith("postgresql://") && str.includes("@") && str.includes("neon.tech")
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <Key className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Quick Neon Setup</h1>
          <p className="text-white/90">Enter your Neon connection string to get started</p>
        </div>

        {/* Step 1: Enter Connection String */}
        <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Enter Your Neon Connection String
            </CardTitle>
            <CardDescription>
              Paste the PostgreSQL connection string from your neon-emerald-queen project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="connection-string">Connection String</Label>
              <Textarea
                id="connection-string"
                placeholder="postgresql://username:password@ep-neon-emerald-queen.us-east-2.aws.neon.tech/neondb?sslmode=require"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                className="font-mono text-sm"
                rows={3}
              />
              <p className="text-xs text-gray-600">
                Should start with <code>postgresql://</code> and contain <code>neon.tech</code>
              </p>
            </div>

            {connectionString && !isValidConnectionString(connectionString) && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-yellow-800">
                  This doesn't look like a valid Neon connection string. Make sure it starts with{" "}
                  <code>postgresql://</code> and contains <code>neon.tech</code>
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={testConnection}
              disabled={testing || !connectionString.trim() || !isValidConnectionString(connectionString)}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>

            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <strong>Where to find your connection string:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>
                  Go to{" "}
                  <a
                    href="https://console.neon.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Neon Console <ExternalLink className="inline h-3 w-3" />
                  </a>
                </li>
                <li>Select your "neon-emerald-queen" project</li>
                <li>Click "Connect" button</li>
                <li>Copy the connection string (starts with postgresql://)</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Connection Test Result */}
        {result && (
          <Card className={`border-2 ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${result.success ? "text-green-800" : "text-red-800"}`}>
                {result.success ? <CheckCircle className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                {result.success ? "Connection Successful!" : "Connection Failed"}
              </CardTitle>
              <CardDescription>
                {result.success
                  ? `Connected to ${result.projectName || "your database"} in ${result.connectionTime}ms`
                  : "There was an issue connecting to your database"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.success ? (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-100">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-800">
                      <strong>Database Info:</strong>
                      <br />• Project: {result.projectName}
                      <br />• Database: {result.database}
                      <br />• User: {result.user}
                      <br />• Response Time: {result.connectionTime}ms
                    </AlertDescription>
                  </Alert>

                  {result.tables && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Database Tables:</h4>
                      {result.tables.existing.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {result.tables.existing.map((table) => (
                            <div key={table.name} className="p-2 bg-white rounded border text-sm">
                              <strong>{table.name}</strong>
                              <br />
                              <span className="text-gray-600">
                                {result.tables?.counts[table.name] || 0} rows, {table.columns} columns
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No tables found - we'll create them for you!</p>
                      )}

                      {result.tables.missing.length > 0 && (
                        <Alert className="border-blue-200 bg-blue-50">
                          <Database className="h-4 w-4" />
                          <AlertDescription className="text-blue-800">
                            <strong>Missing Tables:</strong> {result.tables.missing.join(", ")}
                            <br />
                            We'll create these tables for Money Buddy to work properly.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Alert className="border-red-200 bg-red-100">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    <strong>Error:</strong> {result.error}
                    <br />
                    <strong>Details:</strong> {result.details}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Environment Variables */}
        {result?.success && envContent && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Copy className="h-6 w-6" />
                Environment Variables
              </CardTitle>
              <CardDescription>Add these to your .env.local file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea value={envContent} readOnly className="font-mono text-xs bg-white border h-48 resize-none" />
                <Button
                  onClick={() => copyToClipboard(envContent)}
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy All
                </Button>
              </div>

              <Alert className="border-blue-200 bg-blue-100">
                <Database className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  <strong>Next Steps:</strong>
                  <br />
                  1. Copy the environment variables above
                  <br />
                  2. Add them to your .env.local file
                  <br />
                  3. Restart your development server (npm run dev)
                  <br />
                  4. {result.needsSetup ? "Create database tables" : "Start using Money Buddy!"}
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                {result.needsSetup ? (
                  <Button asChild>
                    <a href="/setup-neon-database">Create Database Tables</a>
                  </Button>
                ) : (
                  <Button asChild>
                    <a href="/dashboard">Go to Dashboard</a>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <a href="/api/test-neon-connection">Test Again</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Need Help?
            </CardTitle>
            <CardDescription>Common issues and solutions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h5 className="font-semibold text-sm mb-2">Connection String Format</h5>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  postgresql://user:pass@host/db?sslmode=require
                </code>
                <p className="text-xs mt-2 text-gray-600">
                  Should contain your username, password, host (ending in neon.tech), and database name
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h5 className="font-semibold text-sm mb-2">Common Issues</h5>
                <ul className="text-xs space-y-1 list-disc list-inside text-gray-600">
                  <li>Make sure the connection string is complete</li>
                  <li>Check that your Neon project is active</li>
                  <li>Verify you have the correct credentials</li>
                  <li>Ensure SSL mode is included (?sslmode=require)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
