"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, CheckCircle, XCircle, AlertTriangle, ExternalLink, RefreshCw, Copy } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { supabase } from "@/lib/supabase"

interface ConnectionTest {
  status: "testing" | "success" | "error"
  message: string
  details?: any
}

interface TableInfo {
  table_name: string
  row_count: number
}

export default function SupabaseTestPage() {
  const [connectionTest, setConnectionTest] = useState<ConnectionTest>({
    status: "testing",
    message: "Initializing connection test...",
  })
  const [projectInfo, setProjectInfo] = useState<any>(null)
  const [tables, setTables] = useState<TableInfo[]>([])
  const [sampleData, setSampleData] = useState<any>({})
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    runConnectionTest()
  }, [])

  async function runConnectionTest() {
    setTesting(true)
    setConnectionTest({ status: "testing", message: "Testing Supabase connection..." })

    try {
      // Test 1: Basic connection
      const { data: testData, error: testError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .limit(1)

      if (testError) {
        setConnectionTest({
          status: "error",
          message: "Failed to connect to Supabase",
          details: testError,
        })
        setTesting(false)
        return
      }

      // Test 2: Get project info from URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const projectId = supabaseUrl?.split("//")[1]?.split(".")[0]

      setProjectInfo({
        url: supabaseUrl,
        projectId: projectId,
        region: supabaseUrl?.includes("supabase.co") ? "US East" : "Unknown",
      })

      // Test 3: List all tables
      const { data: tablesData, error: tablesError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")

      if (tablesError) {
        console.error("Error fetching tables:", tablesError)
      } else {
        // Get row counts for each table
        const tableInfo: TableInfo[] = []
        for (const table of tablesData || []) {
          try {
            const { count, error: countError } = await supabase
              .from(table.table_name)
              .select("*", { count: "exact", head: true })

            if (!countError) {
              tableInfo.push({
                table_name: table.table_name,
                row_count: count || 0,
              })
            }
          } catch (error) {
            console.error(`Error counting rows in ${table.table_name}:`, error)
            tableInfo.push({
              table_name: table.table_name,
              row_count: -1, // -1 indicates error
            })
          }
        }
        setTables(tableInfo)
      }

      // Test 4: Get sample data from key tables
      const sampleQueries = [
        { table: "users", limit: 3 },
        { table: "transactions", limit: 5 },
        { table: "geofences", limit: 5 },
        { table: "savings_locks", limit: 3 },
      ]

      const samples: any = {}
      for (const query of sampleQueries) {
        try {
          const { data, error } = await supabase.from(query.table).select("*").limit(query.limit)

          if (!error && data) {
            samples[query.table] = data
          }
        } catch (error) {
          console.error(`Error fetching sample data from ${query.table}:`, error)
        }
      }
      setSampleData(samples)

      setConnectionTest({
        status: "success",
        message: "Successfully connected to your Supabase database!",
        details: {
          tablesFound: tablesData?.length || 0,
          projectId: projectId,
        },
      })
    } catch (error) {
      setConnectionTest({
        status: "error",
        message: "Unexpected error during connection test",
        details: error,
      })
    } finally {
      setTesting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getSupabaseUrl = () => {
    const projectId = projectInfo?.projectId
    return projectId ? `https://supabase.com/dashboard/project/${projectId}` : "https://supabase.com/dashboard"
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supabase Connection Test</h1>
            <p className="text-gray-600">Verify your database connection and check what's in your Supabase project</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={runConnectionTest} disabled={testing} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${testing ? "animate-spin" : ""}`} />
              Test Again
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href={getSupabaseUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Supabase
              </a>
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {connectionTest.status === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : connectionTest.status === "error" ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
              )}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={connectionTest.status === "error" ? "border-red-200 bg-red-50" : ""}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-medium">{connectionTest.message}</AlertDescription>
            </Alert>

            {connectionTest.details && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Connection Details:</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(connectionTest.details, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Information */}
        {projectInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Your Supabase Project
              </CardTitle>
              <CardDescription>Information about your connected Supabase instance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Project ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{projectInfo.projectId}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(projectInfo.projectId)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Database URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono truncate">{projectInfo.url}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(projectInfo.url)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ This is your actual Supabase project! You can access it directly at{" "}
                  <a
                    href={getSupabaseUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    supabase.com/dashboard
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Tables Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>Tables found in your Supabase database</CardDescription>
          </CardHeader>
          <CardContent>
            {tables.length === 0 ? (
              <div className="text-center py-8">
                <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tables Found</h3>
                <p className="text-gray-600">
                  Your database appears to be empty. Run the setup scripts to create tables.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <div key={table.table_name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{table.table_name}</h3>
                      <Badge variant={table.row_count > 0 ? "default" : "secondary"}>
                        {table.row_count === -1 ? "Error" : `${table.row_count} rows`}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {table.row_count === 0
                        ? "Empty table"
                        : table.row_count === -1
                          ? "Could not count rows"
                          : `Contains ${table.row_count} record${table.row_count === 1 ? "" : "s"}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sample Data */}
        {Object.keys(sampleData).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sample Data</CardTitle>
              <CardDescription>Recent records from your database tables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(sampleData).map(([tableName, data]) => (
                <div key={tableName}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    {tableName}
                    <Badge variant="outline">{(data as any[]).length} records</Badge>
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">✅ If Connection Successful:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Your app is connected to your real Supabase database</li>
                <li>You can create geofences and they'll be stored in your database</li>
                <li>Visit the Supabase dashboard to see data in real-time</li>
                <li>Run the SQL scripts if you need to create missing tables</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">❌ If Connection Failed:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Check your environment variables in .env.local</li>
                <li>Verify your Supabase project is active</li>
                <li>Make sure your API keys haven't expired</li>
                <li>Check the Supabase dashboard for any issues</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
