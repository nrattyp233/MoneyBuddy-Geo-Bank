"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, PiggyBank, Send, MapPin, MessageCircle, Sparkles, Zap } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { supabase, getUserById, getUserTransactions, type User, type Transaction } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface UserData extends User {
  isLoggedIn: boolean
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load user data from Supabase
    const loadUserData = async () => {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.log("No authenticated user found, redirecting to login")
          router.push("/auth/login")
          return
        }

        // Get user data from database
        const dbUser = await getUserById(user.id)
        
        if (!dbUser) {
          console.error("User not found in database")
          router.push("/auth/login")
          return
        }

        // Get user transactions
        const userTransactions = await getUserTransactions(user.id, 3)

        setUserData({
          ...dbUser,
          isLoggedIn: true,
        })
        setTransactions(userTransactions)
        
        console.log("User data loaded:", dbUser)
      } catch (error) {
        console.error("Error loading user data:", error)
        router.push("/auth/login")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-medium text-lg drop-shadow-lg">Loading your Money Buddy dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-white font-medium text-lg drop-shadow-lg">Unable to load user data. Please try logging in again.</p>
            <Button 
              onClick={() => router.push("/auth/login")}
              className="mt-4 bg-white/20 hover:bg-white/30 text-white"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Extract first name from full name
  const firstName = userData.name.split(' ')[0] || "Friend"

  return (
    <DashboardLayout>
      <div className="space-y-8 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-32 h-32 bg-lime-400/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-40 left-20 w-40 h-40 bg-blue-400/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        {/* Welcome Header */}
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white drop-shadow-2xl">
                Welcome back, {firstName}!<span className="text-lime-300 ml-2">🐵</span>
              </h1>
              <p className="text-white/95 text-xl font-medium drop-shadow-lg">
                Your Money Buddy is ready to help you manage your finances
              </p>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm shadow-2xl transform hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-2xl font-bold text-purple-900">Current Balance</CardTitle>
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-900 mb-2">
                ${userData.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-gray-700 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-lime-500" />
                Ready for transactions
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm shadow-2xl transform hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-2xl font-bold text-purple-900">Savings Account</CardTitle>
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-900 mb-2">
                ${userData.savings_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-gray-700 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-lime-500" />
                Earning interest
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm shadow-2xl relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-purple-900 flex items-center">
              <Zap className="h-6 w-6 mr-2 text-lime-500" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-700 font-medium text-lg">
              What would you like to do today with Money Buddy?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/transfer">
                <Button className="w-full h-24 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex flex-col items-center space-y-2">
                    <Send className="h-6 w-6" />
                    <span>Send Money</span>
                  </div>
                </Button>
              </Link>

              <Link href="/transfer/geofence">
                <Button className="w-full h-24 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex flex-col items-center space-y-2">
                    <MapPin className="h-6 w-6" />
                    <span>Geofence Transfer</span>
                  </div>
                </Button>
              </Link>

              <Link href="/deposit">
                <Button className="w-full h-24 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex flex-col items-center space-y-2">
                    <DollarSign className="h-6 w-6" />
                    <span>Deposit</span>
                  </div>
                </Button>
              </Link>

              <Link href="/chat">
                <Button className="w-full h-24 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex flex-col items-center space-y-2">
                    <MessageCircle className="h-6 w-6" />
                    <span>AI Assistant</span>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm shadow-2xl relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-purple-900">Recent Activity</CardTitle>
            <CardDescription className="text-gray-700 font-medium">
              Your latest Money Buddy transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-lime-50 to-green-50 border-2 border-lime-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center">
                        <Send className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-purple-900">
                          {transaction.type === 'transfer' ? `Transfer to ${transaction.recipient_email}` : 
                           transaction.type === 'deposit' ? 'Deposit' : 
                           transaction.type === 'withdrawal' ? 'Withdrawal' : transaction.type}
                        </p>
                        <p className="text-sm text-gray-600">{transaction.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-900">
                        {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-gray-600">{new Date(transaction.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 font-medium">No recent transactions found.</p>
                  <p className="text-sm text-gray-500 mt-2">Start by making a deposit or transfer!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
