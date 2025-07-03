"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, MapPin, DollarSign, Users, Clock, CheckCircle, ExternalLink, RefreshCw } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { supabase, type Geofence, type Transaction } from "@/lib/supabase"

interface DatabaseStats {
  totalGeofences: number
  activeGeofences: number
  claimedGeofences: number
  totalAmount: number
  totalTransactions: number
}

export default function SupabaseDashboardPage() {
  const [stats, setStats] = useState<DatabaseStats>({
    totalGeofences: 0,
    activeGeofences: 0,
    claimedGeofences: 0,
    totalAmount: 0,
    totalTransactions: 0,
  })
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "error" | "checking">("checking")

  useEffect(() => {
    loadDashboardData()
    checkConnection()
  }, [])

  async function checkConnection() {
    try {
      setConnectionStatus("checking")
      const { data, error } = await supabase.from("geofences").select("count").limit(1)

      if (error) {
        console.error("Supabase connection error:", error)
        setConnectionStatus("error")
      } else {
        setConnectionStatus("connected")
      }
    } catch (error) {
      console.error("Connection check failed:", error)
      setConnectionStatus("error")
    }
  }

  async function loadDashboardData() {
    try {
      setLoading(true)

      // Load all geofences
      const { data: allGeofences, error: geofenceError } = await supabase
        .from("geofences")
        .select("*")
        .order("created_at", { ascending: false })

      if (geofenceError) {
        console.error("Error loading geofences:", geofenceError)
        return
      }

      // Load all transactions
      const { data: allTransactions, error: transactionError } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      if (transactionError) {
        console.error("Error loading transactions:", transactionError)
      }

      // Calculate stats
      const totalGeofences = allGeofences?.length || 0
      const activeGeofences = allGeofences?.filter((g) => g.is_active && !g.is_claimed).length || 0
      const claimedGeofences = allGeofences?.filter((g) => g.is_claimed).length || 0
      const totalAmount = allGeofences?.reduce((sum, g) => sum + (g.amount || 0), 0) || 0
      const totalTransactions = allTransactions?.length || 0

      setStats({
        totalGeofences,
        activeGeofences,
        claimedGeofences,
        totalAmount,
        totalTransactions,
      })

      setGeofences(allGeofences || [])
      setTransactions(allTransactions || [])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function refreshData() {
    setRefreshing(true)
    await loadDashboardData()
    await checkConnection()
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supabase Dashboard</h1>
            <p className="text-gray-600">Monitor your Money Buddy database and geofencing system</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "error"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              />
              <span className="text-sm font-medium">
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "error"
                    ? "Connection Error"
                    : "Checking..."}
              </span>
            </div>
            <Button onClick={refreshData} disabled={refreshing} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button asChild size="sm" variant="outline">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Supabase
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Geofences</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGeofences}</div>
              <p className="text-xs text-muted-foreground">Location-based transfers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Geofences</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeGeofences}</div>
              <p className="text-xs text-muted-foreground">Ready to be claimed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claimed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.claimedGeofences}</div>
              <p className="text-xs text-muted-foreground">Successfully collected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">In all geofences</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">Total processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="geofences" className="space-y-4">
          <TabsList>
            <TabsTrigger value="geofences">Geofences ({geofences.length})</TabsTrigger>
            <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="geofences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Geofences Database
                </CardTitle>
                <CardDescription>All location-based transfers in your Supabase database</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading geofences...</span>
                  </div>
                ) : geofences.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Geofences Found</h3>
                    <p className="text-gray-600">Create your first geofence to see data here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {geofences.map((geofence) => (
                      <div key={geofence.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{geofence.name}</h3>
                              <Badge variant={geofence.is_active ? "default" : "secondary"}>
                                {geofence.is_active ? "Active" : "Inactive"}
                              </Badge>
                              {geofence.is_claimed && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Claimed
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <strong>Amount:</strong> {formatCurrency(geofence.amount)}
                              </div>
                              <div>
                                <strong>Radius:</strong> {geofence.radius}m
                              </div>
                              <div>
                                <strong>Recipient:</strong> {geofence.recipient_email}
                              </div>
                              <div>
                                <strong>Location:</strong> {geofence.center_lat.toFixed(4)},{" "}
                                {geofence.center_lng.toFixed(4)}
                              </div>
                              {geofence.memo && (
                                <div className="col-span-2">
                                  <strong>Memo:</strong> {geofence.memo}
                                </div>
                              )}
                              <div className="col-span-2 flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                <span>Created: {formatDate(geofence.created_at)}</span>
                              </div>
                              {geofence.claimed_at && (
                                <div className="col-span-2 flex items-center gap-1 text-xs text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Claimed: {formatDate(geofence.claimed_at)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Transactions Database
                </CardTitle>
                <CardDescription>Recent transactions in your Supabase database</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading transactions...</span>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
                    <p className="text-gray-600">Process your first transaction to see data here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold capitalize">{transaction.type}</h3>
                              <Badge
                                variant={
                                  transaction.status === "completed"
                                    ? "default"
                                    : transaction.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {transaction.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <strong>Amount:</strong> {formatCurrency(transaction.amount)}
                              </div>
                              <div>
                                <strong>Fee:</strong> {formatCurrency(transaction.fee)}
                              </div>
                              <div>
                                <strong>Description:</strong> {transaction.description}
                              </div>
                              {transaction.recipient_email && (
                                <div>
                                  <strong>Recipient:</strong> {transaction.recipient_email}
                                </div>
                              )}
                              {transaction.square_payment_id && (
                                <div>
                                  <strong>Square ID:</strong> {transaction.square_payment_id}
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                <span>Created: {formatDate(transaction.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
