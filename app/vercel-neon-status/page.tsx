"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  RefreshCw,
  ExternalLink,
  Settings,
  Cloud,
  Zap,
  Clock,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function VercelNeonStatusPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [waking, setWaking] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-vercel-neon")
      const result = await response.json()
      setStatus(result)
    } catch (error) {
      setStatus({
        success: false,
        error: "Failed to test connection",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const wakeUpDatabase = async () => {
    setWaking(true)
    try {
      const response = await fetch("/api/test-vercel-neon", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        // After waking up, test the connection again
        setTimeout(() => {
          testConnection()
        }, 1000)
      } else {
        setStatus((prev) => ({ ...prev, wakeUpError: result.error }))
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        wakeUpError: error instanceof Error ? error.message : "Unknown error",
      }))
    } finally {
      setWaking(false)
    }
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
            <h2 className="text-2xl font-bold text-white mb-2">Testing Neon Database...</h2>
            <p className="text-white/80">Checking your database connection</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <Cloud className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Neon Database Status</h1>
          <p className="text-white/90">Your "jolly-river-402" database connection</p>
        </div>

        {/* Connection Status */}
        <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status?.success ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : status?.isSuspended ? (
                <Clock className="h-6 w-6 text-yellow-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              Database Connection Status
            </CardTitle>
            <CardDescription>Your Neon database connection and activity status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.success ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-800">
                    ✅ Database is active and connected!
                    {status.wakeUpTime && (
                      <span className="block mt-1">
                        Connection time: {status.wakeUpTime}
                        {Number.parseInt(status.wakeUpTime) > 1000 && " (database was waking up)"}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Database Info:</h4>
                    <div className="text-sm space-y-1">
                      <div>
                        <strong>Project:</strong> jolly-river-402
                      </div>
                      <div>
                        <strong>Database:</strong> {status.database}
                      </div>
                      <div>
                        <strong>Version:</strong> {status.version?.split(" ")[0]}
                      </div>
                      <div>
                        <strong>Host:</strong> {status.host}
                      </div>
                      <div>
                        <strong>User:</strong> {status.user}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Connection Info:</h4>
                    <div className="space-y-1">
                      <Badge variant="default">Active</Badge>
                      <div className="text-sm">
                        <strong>Source:</strong> {status.connectionSource}
                      </div>
                      <div className="text-sm">
                        <strong>Response Time:</strong> {status.connectionTime}ms
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : status?.isSuspended || status?.needsWakeUp ? (
              <div className="space-y-4">
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Database is Suspended</strong>
                    <br />
                    Your Neon database is currently suspended to save resources. This is normal behavior.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-semibold">Why is it suspended?</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Neon automatically suspends databases after inactivity</li>
                    <li>This saves compute resources and reduces costs</li>
                    <li>The database will wake up when you connect to it</li>
                    <li>First connection may take 10-30 seconds</li>
                  </ul>
                </div>

                {status?.troubleshooting && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">What to do:</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      {status.troubleshooting.map((tip: string, index: number) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button onClick={wakeUpDatabase} disabled={waking} className="w-full" size="lg">
                  {waking ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Waking Up Database...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Wake Up Database
                    </>
                  )}
                </Button>

                {status?.wakeUpError && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">
                      <strong>Wake up failed:</strong> {status.wakeUpError}
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

            <div className="flex gap-2">
              <Button onClick={testConnection} disabled={loading} variant="outline" size="sm">
                {loading ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
                Test Again
              </Button>

              <Button asChild variant="outline" size="sm">
                <a
                  href="https://console.neon.tech/app/projects/jolly-river-402"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Neon Console <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables Status */}
        <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Environment Variables
            </CardTitle>
            <CardDescription>Available database environment variables</CardDescription>
          </CardHeader>
          <CardContent>
            {status?.availableVars && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(status.availableVars).map(([key, available]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <code className="text-xs font-mono">{key}</code>
                    <Badge variant={available ? "default" : "secondary"}>{available ? "Available" : "Missing"}</Badge>
                  </div>
                ))}
              </div>
            )}

            {!status?.success && !status?.isSuspended && (
              <Alert className="border-yellow-200 bg-yellow-50 mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Missing Environment Variables:</strong>
                  <br />
                  You need to get your Neon database credentials and add them to your .env.local file.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Database Tables Status */}
        {status?.success && (
          <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Tables ({status.tables?.count || 0})
              </CardTitle>
              <CardDescription>Required tables for Money Buddy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Existing Tables:</h4>
                  {status.tables?.existing?.length > 0 ? (
                    <div className="space-y-1">
                      {status.tables.existing.map((table: string) => (
                        <div key={table} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <code className="text-xs">{table}</code>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No tables found</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Missing Tables:</h4>
                  {status.tables?.missing?.length > 0 ? (
                    <div className="space-y-1">
                      {status.tables.missing.map((table: string) => (
                        <div key={table} className="flex items-center gap-2">
                          <XCircle className="h-3 w-3 text-red-500" />
                          <code className="text-xs">{table}</code>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">All tables exist!</p>
                  )}
                </div>
              </div>

              {status.needsSetup && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Setup Required:</strong> Some tables are missing. Create them to start using Money Buddy.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {status?.isSuspended || status?.needsWakeUp ? (
            <>
              <Button onClick={wakeUpDatabase} disabled={waking}>
                {waking ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Waking Up...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Wake Up Database
                  </>
                )}
              </Button>
              <Button asChild variant="outline">
                <a href="/use-existing-neon">Setup Environment Variables</a>
              </Button>
            </>
          ) : !status?.success ? (
            <>
              <Button asChild>
                <a href="/use-existing-neon">Setup Environment Variables</a>
              </Button>
              <Button asChild variant="outline">
                <a
                  href="https://vercel.com/mb8/v0-banking-app-features-09/settings/environment-variables"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Vercel Settings <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </>
          ) : status.needsSetup ? (
            <>
              <Button asChild>
                <a href="/setup-neon-database">Create Missing Tables</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/transfer/geofence">Try Geofence Transfer</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
