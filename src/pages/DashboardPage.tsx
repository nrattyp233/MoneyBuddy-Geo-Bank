import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingUp,
  PiggyBank,
  Send,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react"
import { supabase, getUserById, getUserTransactions, type User as DbUser, type Transaction } from "@/lib/supabase"

export default function DashboardPage() {
  const [user, setUser] = useState<DbUser | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!supabase) {
          console.error("Supabase not connected")
          navigate("/auth/login")
          return
        }

        // Check authentication
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          navigate("/auth/login")
          return
        }

        // Get user data
        const dbUser = await getUserById(authUser.id)
        if (!dbUser) {
          console.error("User not found in database")
          navigate("/auth/login")
          return
        }

        setUser(dbUser)

        // Get recent transactions
        const userTransactions = await getUserTransactions(authUser.id, 5)
        setTransactions(userTransactions)

      } catch (error) {
        console.error("Error loading dashboard data:", error)
        navigate("/auth/login")
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [navigate])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-medium text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-white font-medium text-lg mb-4">Unable to load user data</p>
            <Button onClick={() => navigate("/auth/login")} className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white">
              Return to Login
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="h-4 w-4 text-green-600" />
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case "transfer":
        return <Send className="h-4 w-4 text-blue-600" />
      case "geofence_transfer":
        return <MapPin className="h-4 w-4 text-purple-600" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-2xl">
            Welcome back, {user.name.split(' ')[0]}! 🐵
          </h1>
          <p className="text-white/90 text-lg drop-shadow-lg font-medium">
            Your Money Buddy dashboard is ready for action
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Wallet Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-lime-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(user.balance)}</div>
              <p className="text-xs text-gray-600 font-medium">Available for transfers</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Savings Balance</CardTitle>
              <PiggyBank className="h-4 w-4 text-lime-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(user.savings_balance)}</div>
              <p className="text-xs text-gray-600 font-medium">Locked savings earning interest</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-lime-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(user.balance + user.savings_balance)}
              </div>
              <p className="text-xs text-gray-600 font-medium">Combined portfolio value</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={() => navigate("/deposit")}
            className="h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex flex-col items-center">
              <Plus className="h-6 w-6 mb-1" />
              <span>Deposit</span>
            </div>
          </Button>

          <Button
            onClick={() => navigate("/transfer")}
            className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex flex-col items-center">
              <Send className="h-6 w-6 mb-1" />
              <span>Send</span>
            </div>
          </Button>

          <Button
            onClick={() => navigate("/transfer/geofence")}
            className="h-20 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex flex-col items-center">
              <MapPin className="h-6 w-6 mb-1" />
              <span>Geofence</span>
            </div>
          </Button>

          <Button
            onClick={() => navigate("/savings")}
            className="h-20 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex flex-col items-center">
              <PiggyBank className="h-6 w-6 mb-1" />
              <span>Savings</span>
            </div>
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-900 font-bold">Recent Transactions</CardTitle>
            <CardDescription className="text-gray-700 font-medium">
              Your latest Money Buddy activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No transactions yet</p>
                <p className="text-gray-500 text-sm">Start by making a deposit or transfer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-white/50"
                  >
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-purple-900">
                          {transaction.description || `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-900">{formatCurrency(transaction.amount)}</p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/transactions")}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 font-medium"
                  >
                    View All Transactions
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}