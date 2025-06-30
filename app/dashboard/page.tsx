"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, PiggyBank, Send, MapPin, MessageCircle, Sparkles, Zap } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"

interface UserData {
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  balance: number
  savingsBalance: number
  registeredAt: string
  lastLogin?: string
  isLoggedIn: boolean
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user data from storage
    const loadUserData = () => {
      try {
        // Try localStorage first
        let storedUser = localStorage.getItem("moneyBuddyUser")

        if (!storedUser) {
          // Try sessionStorage as backup
          storedUser = sessionStorage.getItem("moneyBuddyUser")
        }

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUserData(parsedUser)
          console.log("User data loaded:", parsedUser)
        } else {
          // Fallback: try individual fields
          const firstName = localStorage.getItem("userFirstName") || "Demo"
          const lastName = localStorage.getItem("userLastName") || "User"
          const email = localStorage.getItem("userEmail") || "demo@moneybuddy.com"

          const fallbackUser: UserData = {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            email,
            balance: 1250.75,
            savingsBalance: 5000.0,
            registeredAt: new Date().toISOString(),
            isLoggedIn: true,
          }

          setUserData(fallbackUser)
          // Save the fallback data
          localStorage.setItem("moneyBuddyUser", JSON.stringify(fallbackUser))
          console.log("Fallback user data created:", fallbackUser)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        // Ultimate fallback
        const defaultUser: UserData = {
          firstName: "Money",
          lastName: "Buddy",
          fullName: "Money Buddy",
          email: "user@moneybuddy.com",
          balance: 1250.75,
          savingsBalance: 5000.0,
          registeredAt: new Date().toISOString(),
          isLoggedIn: true,
        }
        setUserData(defaultUser)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

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
                Welcome back, {userData?.firstName || "Friend"}!<span className="text-lime-300 ml-2">🐵</span>
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
                ${userData?.balance?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "1,250.75"}
              </div>
              <p className="text-gray-700 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-lime-500" />
                +2.5% from last month
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
                ${userData?.savingsBalance?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "5,000.00"}
              </div>
              <p className="text-gray-700 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-lime-500" />
                +5.2% APY interest
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
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-lime-50 to-green-50 border-2 border-lime-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center">
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-purple-900">Sent to Sarah Johnson</p>
                    <p className="text-sm text-gray-600">Geofenced transfer • Central Park</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-900">-$125.00</p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-purple-900">Square Deposit</p>
                    <p className="text-sm text-gray-600">Direct deposit from employer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-900">+$2,500.00</p>
                  <p className="text-sm text-gray-600">Yesterday</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <PiggyBank className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-purple-900">Savings Interest</p>
                    <p className="text-sm text-gray-600">Monthly interest payment</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-900">+$21.67</p>
                  <p className="text-sm text-gray-600">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
