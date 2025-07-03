"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  Database,
  Users,
  CreditCard,
  MapPin,
  PiggyBank,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"

interface TableStatus {
  name: string
  exists: boolean
  rowCount: number
  error: string | null
}

interface ConnectionResult {
  success: boolean
  message: string
  projectInfo: {
    projectId: string
    url: string
  }
  tables: TableStatus[]
  needsSetup: boolean
  missingTables: string[]
}

export default function SetupResultsPage() {
  const [result, setResult] = useState<ConnectionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/test-supabase")
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check database status")
    } finally {
      setLoading(false)
    }
  }

  const getTableIcon = (tableName: string) => {
    switch (tableName) {
      case "users":
        return <Users className="h-5 w-5" />
      case "transactions":
        return <CreditCard className="h-5 w-5" />
      case "geofences":
        return <MapPin className="h-5 w-5" />
      case "savings_locks":
        return <PiggyBank className="h-5 w-5" />
      default:
        return <Database className="h-5 w-5" />
    }
  }

  const getTableDescription = (tableName: string) => {
    switch (tableName) {
      case "users":
        return "User accounts, balances, and profile information"
      case "transactions":
        return "Money transfers, deposits, withdrawals, and payment history"
      case "geofences":
        return "Location-based money transfers and geofenced payments"
      case "savings_locks":
        return "Time-locked savings accounts with interest rates"
      default:
        return "Database table"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Checking Database Status...</h2>
            <p className="text-white/80">Verifying your Money Buddy setup</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <XCircle className="h-6 w-6" />
                Setup Check Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={checkDatabaseStatus} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!result) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="text-center py-12">
              <p>No results available</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const isFullySetup = result.success && !result.needsSetup
  const hasPartialSetup = result.success && result.tables.some((t) => t.exists)

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            {isFullySetup ? (
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                <Database className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {isFullySetup ? "Money Buddy is Ready! 🐵" : "Setup Status"}
          </h1>
          <p className="text-white/90 text-lg">
            {isFullySetup
              ? "Your database is fully configured and ready to use"
              : "Here's the current status of your Money Buddy setup"}
          </p>
        </div>

        {/* Connection Status */}
        <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              Database Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Connected" : "Failed"}
                </Badge>
              </div>
              {result.projectInfo && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Project ID:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{result.projectInfo.projectId}</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Database URL:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{result.projectInfo.url}</code>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tables Status */}
        <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Database Tables ({result.tables.filter((t) => t.exists).length}/{result.tables.length})
            </CardTitle>
            <CardDescription>Required tables for Money Buddy functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {result.tables.map((table) => (
                <div
                  key={table.name}
                  className={`p-4 rounded-lg border-2 ${
                    table.exists ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${table.exists ? "bg-green-100" : "bg-red-100"}`}>
                        {getTableIcon(table.name)}
                      </div>
                      <div>
                        <h4 className="font-semibold capitalize">{table.name.replace("_", " ")} Table</h4>
                        <p className="text-sm text-gray-600">{getTableDescription(table.name)}</p>
                        {table.error && <p className="text-sm text-red-600 mt-1">Error: {table.error}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={table.exists ? "default" : "destructive"}>
                        {table.exists ? "✅ Created" : "❌ Missing"}
                      </Badge>
                      {table.exists && <p className="text-sm text-gray-600 mt-1">{table.rowCount} records</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Setup Actions */}
        {result.needsSetup && (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Sparkles className="h-6 w-6" />
                Setup Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertDescription>
                  Some database tables are missing. You need to run the setup to create them.
                </AlertDescription>
              </Alert>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/mobile-setup">
                    Complete Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={checkDatabaseStatus}>
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Actions */}
        {isFullySetup && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-6 w-6" />
                Ready to Use!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-green-200 bg-green-100">
                <AlertDescription className="text-green-800">
                  🎉 Congratulations! Money Buddy is fully set up and ready to use. You can now send money, create
                  geofences, and manage your finances!
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/transfer/geofence">Try Geofence Transfer</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/transactions">View Transactions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Partial Setup Actions */}
        {hasPartialSetup && result.needsSetup && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Database className="h-6 w-6" />
                Partial Setup Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-blue-200 bg-blue-100">
                <AlertDescription className="text-blue-800">
                  Some tables exist but others are missing. Complete the setup to enable all features.
                </AlertDescription>
              </Alert>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/mobile-setup">
                    Complete Missing Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Use Available Features</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {result.success && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{result.tables.filter((t) => t.exists).length}</div>
                <p className="text-sm text-gray-600">Tables Created</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {result.tables.reduce((sum, t) => sum + (t.rowCount || 0), 0)}
                </div>
                <p className="text-sm text-gray-600">Total Records</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">
                  {result.tables.find((t) => t.name === "users")?.rowCount || 0}
                </div>
                <p className="text-sm text-gray-600">Users</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">
                  {result.tables.find((t) => t.name === "geofences")?.rowCount || 0}
                </div>
                <p className="text-sm text-gray-600">Geofences</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
