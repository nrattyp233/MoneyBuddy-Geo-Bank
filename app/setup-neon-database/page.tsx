"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Database, Loader2, AlertTriangle, Users, CreditCard, MapPin, PiggyBank } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

interface TableStatus {
  name: string
  exists: boolean
  rowCount: number
  icon: any
  description: string
}

interface SetupResult {
  success: boolean
  error?: string
  details?: string
  tablesCreated?: string[]
  sampleDataCreated?: boolean
  message?: string
}

export default function SetupNeonDatabasePage() {
  const [tables, setTables] = useState<TableStatus[]>([
    { name: "users", exists: false, rowCount: 0, icon: Users, description: "User accounts and balances" },
    {
      name: "transactions",
      exists: false,
      rowCount: 0,
      icon: CreditCard,
      description: "Payment history and transfers",
    },
    { name: "geofences", exists: false, rowCount: 0, icon: MapPin, description: "Location-based money transfers" },
    { name: "savings_locks", exists: false, rowCount: 0, icon: PiggyBank, description: "Time-locked savings accounts" },
  ])

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<SetupResult | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>("Checking...")

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-neon-database")
      const data = await response.json()

      if (data.success) {
        setConnectionStatus("Connected")
        const updatedTables = tables.map((table) => {
          const existingTable = data.tables?.existing?.find((t: any) => t.name === table.name)
          return {
            ...table,
            exists: !!existingTable,
            rowCount: data.tables?.counts?.[table.name] || 0,
          }
        })
        setTables(updatedTables)
      } else {
        setConnectionStatus("Connection Failed")
        setResult({
          success: false,
          error: "Database Connection Failed",
          details: data.error || "Could not connect to your Neon database",
        })
      }
    } catch (error) {
      setConnectionStatus("Connection Error")
      setResult({
        success: false,
        error: "Connection Test Failed",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const createTables = async () => {
    setCreating(true)
    setResult(null)

    try {
      const response = await fetch("/api/setup-neon-tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Refresh table status
        await checkDatabaseStatus()
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Setup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setCreating(false)
    }
  }

  const allTablesExist = tables.every((table) => table.exists)
  const hasData = tables.some((table) => table.rowCount > 0)

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <Database className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Database Setup</h1>
          <p className="text-white/90">Create tables and sample data for Money Buddy</p>
        </div>

        {/* Connection Status */}
        <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Connection Status
            </CardTitle>
            <CardDescription>Status: {connectionStatus}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking database connection...</span>
              </div>
            ) : connectionStatus === "Connected" ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  Successfully connected to your Neon database
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  Could not connect to database. Please check your environment variables.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Tables Status */}
        <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Database Tables
            </CardTitle>
            <CardDescription>Required tables for Money Buddy to function</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tables.map((table) => {
                const Icon = table.icon
                return (
                  <div
                    key={table.name}
                    className={`p-4 rounded-lg border-2 ${
                      table.exists ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`h-5 w-5 ${table.exists ? "text-green-600" : "text-gray-400"}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold">{table.name}</h4>
                        <p className="text-sm text-gray-600">{table.description}</p>
                      </div>
                      {table.exists ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="text-sm">
                      <span className={`font-medium ${table.exists ? "text-green-800" : "text-gray-600"}`}>
                        {table.exists ? `${table.rowCount} rows` : "Not created"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-4 border-t">
              {allTablesExist ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-800">
                    <strong>Database Ready!</strong> All required tables exist.
                    {hasData ? " Sample data is available." : " You can add sample data if needed."}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-blue-200 bg-blue-50">
                  <Database className="h-4 w-4" />
                  <AlertDescription className="text-blue-800">
                    <strong>Setup Required:</strong> Some tables are missing. Click "Create Database Tables" to set up
                    your database.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Setup Actions */}
        <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Setup Actions</CardTitle>
            <CardDescription>Create tables and sample data for your Money Buddy app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={createTables}
              disabled={creating || connectionStatus !== "Connected"}
              className="w-full"
              size="lg"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Tables...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  {allTablesExist ? "Recreate Database Tables" : "Create Database Tables"}
                </>
              )}
            </Button>

            {connectionStatus !== "Connected" && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-yellow-800">
                  Database connection required before creating tables. Please check your environment variables.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Setup Result */}
        {result && (
          <Card className={`border-2 ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${result.success ? "text-green-800" : "text-red-800"}`}>
                {result.success ? <CheckCircle className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                {result.success ? "Setup Successful!" : "Setup Failed"}
              </CardTitle>
              <CardDescription>
                {result.success ? "Your database is ready to use" : "There was an issue setting up your database"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.success ? (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-100">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-800">
                      <strong>Tables Created:</strong> {result.tablesCreated?.join(", ") || "All required tables"}
                      <br />
                      <strong>Sample Data:</strong>{" "}
                      {result.sampleDataCreated ? "Demo user and test geofence created" : "No sample data"}
                      <br />
                      <strong>Status:</strong> {result.message || "Database setup complete"}
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-3">
                    <Button asChild>
                      <a href="/dashboard">Go to Dashboard</a>
                    </Button>
                    <Button asChild variant="outline">
                      <a href="/transfer/geofence">Try Geofence Transfer</a>
                    </Button>
                  </div>
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

        {/* Next Steps */}
        {allTablesExist && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">🎉 Ready to Use Money Buddy!</CardTitle>
              <CardDescription>Your database is set up and ready</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                  <a href="/dashboard" className="flex flex-col items-center gap-2">
                    <Users className="h-6 w-6" />
                    <span>Dashboard</span>
                    <span className="text-xs text-gray-600">View your account</span>
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                  <a href="/transfer/geofence" className="flex flex-col items-center gap-2">
                    <MapPin className="h-6 w-6" />
                    <span>Geofence Transfer</span>
                    <span className="text-xs text-gray-600">Location-based payments</span>
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                  <a href="/transactions" className="flex flex-col items-center gap-2">
                    <CreditCard className="h-6 w-6" />
                    <span>Transactions</span>
                    <span className="text-xs text-gray-600">Payment history</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
