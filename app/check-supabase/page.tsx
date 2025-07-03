"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink, Database, Copy } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

interface TestResult {
  success: boolean
  error?: string
  details?: any
  projectInfo?: {
    url: string
    projectId: string
    region: string
  }
  tables: Array<{
    name: string
    rowCount: number
    error?: string
  }>
  requiredTables?: string[]
  missingTables?: string[]
  connectionStatus?: string
}

export default function CheckSupabasePage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runTest()
  }, [])

  async function runTest() {
    setLoading(true)
    try {
      const response = await fetch("/api/test-supabase")
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: "Failed to run test",
        details: error instanceof Error ? error.message : "Unknown error",
        tables: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getSupabaseUrl = () => {
    const projectId = testResult?.projectInfo?.projectId
    return projectId ? `https://supabase.com/dashboard/project/${projectId}` : "https://supabase.com/dashboard"
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mr-3" />
            <span className="text-lg">Testing Supabase connection...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supabase Connection Check</h1>
            <p className="text-gray-600">Verify your database connection and setup</p>
          </div>
          <Button onClick={runTest} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Test Again
          </Button>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={testResult?.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                {testResult?.success
                  ? "✅ Connected to Supabase successfully!"
                  : `❌ ${testResult?.error || "Connection failed"}`}
              </AlertDescription>
            </Alert>

            {testResult?.details && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Error Details:</h4>
                <pre className="text-sm text-red-600 whitespace-pre-wrap">
                  {typeof testResult.details === "string"
                    ? testResult.details
                    : JSON.stringify(testResult.details, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Info */}
        {testResult?.projectInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Your Supabase Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Project ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {testResult.projectInfo.projectId}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(testResult.projectInfo!.projectId)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Database URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono truncate">
                      {testResult.projectInfo.url}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(testResult.projectInfo!.url)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button asChild size="sm" variant="outline">
                  <a
                    href={getSupabaseUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Supabase Dashboard
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tables Status */}
        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>
              {testResult?.tables.length === 0
                ? "No tables found in your database"
                : `Found ${testResult?.tables.length} table(s) in your database`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testResult?.tables.length === 0 ? (
              <div className="text-center py-8">
                <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tables Found</h3>
                <p className="text-gray-600 mb-4">
                  Your database is empty. You need to run the setup scripts to create the required tables.
                </p>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Next Step:</strong> Run the SQL scripts in the <code>/scripts</code> folder to create your
                    database tables.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testResult?.tables.map((table) => (
                    <div key={table.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{table.name}</h3>
                        <Badge
                          variant={table.rowCount > 0 ? "default" : table.rowCount === 0 ? "secondary" : "destructive"}
                        >
                          {table.rowCount === -1 ? "Error" : `${table.rowCount} rows`}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {table.rowCount === 0
                          ? "Empty table"
                          : table.rowCount === -1
                            ? table.error || "Could not count rows"
                            : `Contains ${table.rowCount} record${table.rowCount === 1 ? "" : "s"}`}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Missing Tables Alert */}
                {testResult?.missingTables && testResult.missingTables.length > 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Missing Required Tables:</strong> {testResult.missingTables.join(", ")}
                      <br />
                      <span className="text-sm">Run the setup scripts to create these tables.</span>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>What This Means</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResult?.success ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-700">Connection Successful</h4>
                    <p className="text-sm text-gray-600">Your app is connected to your Supabase database.</p>
                  </div>
                </div>

                {testResult.tables.length === 0 && (
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-700">Database Setup Needed</h4>
                      <p className="text-sm text-gray-600">
                        Your database is empty. Run the SQL scripts to create tables and add sample data.
                      </p>
                    </div>
                  </div>
                )}

                {testResult.tables.length > 0 && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-700">Database Ready</h4>
                      <p className="text-sm text-gray-600">
                        Your database has tables and is ready to use. You can create geofences and transactions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-700">Connection Failed</h4>
                    <p className="text-sm text-gray-600">
                      Check your environment variables in <code>.env.local</code> and make sure they match your Supabase
                      project.
                    </p>
                  </div>
                </div>

                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Fix Steps:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                      <li>Go to your Supabase dashboard → Settings → API</li>
                      <li>Copy your Project URL and API Key</li>
                      <li>
                        Update your <code>.env.local</code> file with the correct values
                      </li>
                      <li>Restart your development server</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
