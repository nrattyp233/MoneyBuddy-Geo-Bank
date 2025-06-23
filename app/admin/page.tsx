"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, DollarSign, TrendingUp, Users, Activity, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const [adminStats] = useState({
    totalFeesCollected: 2847.32,
    transactionFees: 2456.78,
    earlyWithdrawalFees: 390.54,
    totalUsers: 1247,
    totalTransactions: 8934,
    monthlyGrowth: 12.5,
  })

  const [recentFeeTransactions] = useState([
    {
      id: "1",
      type: "transaction_fee",
      amount: 5.0,
      originalAmount: 250.0,
      userId: "user_123",
      date: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      type: "early_withdrawal_fee",
      amount: 125.0,
      originalAmount: 2500.0,
      userId: "user_456",
      date: "2024-01-14T15:45:00Z",
    },
    {
      id: "3",
      type: "transaction_fee",
      amount: 20.0,
      originalAmount: 1000.0,
      userId: "user_789",
      date: "2024-01-13T09:15:00Z",
    },
  ])

  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userEmail = localStorage.getItem("userEmail")

    // Check if user is admin (first registered user)
    if (!isAuthenticated || userEmail !== "demo@bank.com") {
      router.push("/dashboard")
    }
  }, [router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Activity className="h-6 w-6 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <Badge variant="secondary" className="ml-3">
              Admin Account
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${adminStats.totalFeesCollected.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transaction Fees</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${adminStats.transactionFees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">2% on all transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Early Withdrawal Fees</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${adminStats.earlyWithdrawalFees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">5% penalty fees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{adminStats.monthlyGrowth}% this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Fee Transactions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Fee Collections</CardTitle>
                  <CardDescription>Latest fees collected from users</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFeeTransactions.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={fee.type === "transaction_fee" ? "default" : "secondary"} className="text-xs">
                          {fee.type === "transaction_fee" ? "Transaction" : "Early Withdrawal"}
                        </Badge>
                        <span className="text-sm font-medium">User {fee.userId.slice(-3)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(fee.date)}</p>
                      <p className="text-xs text-gray-400">Original: ${fee.originalAmount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+${fee.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{fee.type === "transaction_fee" ? "2%" : "5%"} fee</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fee Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Breakdown</CardTitle>
              <CardDescription>Distribution of collected fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Transaction Fees (2%)</span>
                  <div className="text-right">
                    <div className="font-semibold">${adminStats.transactionFees.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {((adminStats.transactionFees / adminStats.totalFeesCollected) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Early Withdrawal Fees (5%)</span>
                  <div className="text-right">
                    <div className="font-semibold">${adminStats.earlyWithdrawalFees.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {((adminStats.earlyWithdrawalFees / adminStats.totalFeesCollected) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Collected</span>
                  <span className="text-green-600">${adminStats.totalFeesCollected.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Fee Structure:</h4>
                <ul className="text-sm space-y-1">
                  <li>• 2% fee on all money transfers</li>
                  <li>• 5% penalty on early withdrawals from locked accounts</li>
                  <li>• Free deposits to wallet</li>
                  <li>• All fees automatically sent to admin account</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
            <CardDescription>Administrative tools and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export All Transactions
              </Button>
              <Button variant="outline" className="justify-start">
                <Users className="h-4 w-4 mr-2" />
                User Management
              </Button>
              <Button variant="outline" className="justify-start">
                <Activity className="h-4 w-4 mr-2" />
                System Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
