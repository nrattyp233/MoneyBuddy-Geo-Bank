"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  MapPin,
  MessageCircle,
  PiggyBank,
  History,
  Plus,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/components/stack-auth-provider"

function DashboardContent() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(2500.0)
  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, type: "deposit", amount: 500, description: "Salary Deposit", date: "2024-01-15", status: "completed" },
    { id: 2, type: "transfer", amount: -25, description: "Coffee Shop", date: "2024-01-14", status: "completed" },
    { id: 3, type: "deposit", amount: 100, description: "Freelance Payment", date: "2024-01-13", status: "completed" },
    { id: 4, type: "transfer", amount: -75, description: "Grocery Store", date: "2024-01-12", status: "completed" },
  ])

  useEffect(() => {
    // Load balance from localStorage
    const savedBalance = localStorage.getItem("userBalance")
    if (savedBalance) {
      setBalance(Number.parseFloat(savedBalance))
    }
  }, [])

  const quickActions = [
    { icon: ArrowUpRight, label: "Send Money", href: "/transfer", color: "bg-blue-500" },
    { icon: ArrowDownRight, label: "Request Money", href: "/request", color: "bg-green-500" },
    { icon: MapPin, label: "Geofence Transfer", href: "/transfer/geofence", color: "bg-purple-500" },
    { icon: PiggyBank, label: "Save Money", href: "/savings/lock", color: "bg-orange-500" },
  ]

  const stats = [
    { label: "Total Balance", value: `$${balance.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
    { label: "This Month", value: "+$425.00", icon: TrendingUp, color: "text-blue-600" },
    { label: "Active Geofences", value: "3", icon: MapPin, color: "text-purple-600" },
    { label: "Savings Goals", value: "2", icon: PiggyBank, color: "text-orange-600" },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.displayName?.split(" ")[0] || "User"}! 👋
            </h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your money today</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className="text-3xl font-bold text-lime-600">${balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-2 border-white/30 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-2 border-white/30 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common banking tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex-col space-y-2 border-2 hover:border-purple-300 hover:bg-purple-50 bg-transparent"
                  onClick={() => (window.location.href = action.href)}
                >
                  <div className={`p-2 rounded-full ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="border-2 border-white/30 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "deposit" ? "bg-green-100" : "bg-blue-100"
                        }`}
                      >
                        {transaction.type === "deposit" ? (
                          <ArrowDownRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.amount > 0 ? "text-green-600" : "text-gray-900"}`}>
                        {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Transactions
              </Button>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="border-2 border-white/30 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Money Buddy AI
              </CardTitle>
              <CardDescription>Your intelligent banking assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">💡 Smart Insight</p>
                  <p className="font-medium text-gray-900">
                    You've saved 15% more this month compared to last month. Great job! 🎉
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-lime-100 to-green-100 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">🎯 Suggestion</p>
                  <p className="font-medium text-gray-900">
                    Consider setting up a geofence for your regular coffee shop to track spending.
                  </p>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                  Chat with Money Buddy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
