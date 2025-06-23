"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Wallet,
  Send,
  Receipt,
  MapPin,
  Clock,
  Bot,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  Lock,
  Activity,
  Plus,
  Minus,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import dynamic from "next/dynamic"

// Dynamically import components that use localStorage
const NotificationCenter = dynamic(() => import("@/components/notification-center"), {
  ssr: false,
  loading: () => <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />,
})

export default function Dashboard() {
  const [balance, setBalance] = useState(0)
  const [showBalance, setShowBalance] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [recentTransactions] = useState([
    { id: "1", type: "received", amount: 500, from: "John Doe", date: "2024-01-15", status: "completed" },
    {
      id: "2",
      type: "sent",
      amount: 250,
      to: "Jane Smith",
      date: "2024-01-14",
      status: "completed",
      restrictions: ["geofence"],
    },
    {
      id: "3",
      type: "sent",
      amount: 1000,
      to: "Mike Johnson",
      date: "2024-01-13",
      status: "pending",
      restrictions: ["time", "geofence"],
    },
  ])
  const [externalTransactions, setExternalTransactions] = useState([])
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // Only run on client side after mounting
    const checkAuth = async () => {
      try {
        const authStatus = localStorage.getItem("isAuthenticated")
        const email = localStorage.getItem("userEmail") || ""

        setIsAuthenticated(!!authStatus)
        setUserEmail(email)

        if (!authStatus) {
          router.push("/auth/login")
          return
        }

        // Load user data
        await loadWalletBalance(email)
        await loadExternalTransactions(email)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [isMounted, router])

  const loadWalletBalance = async (userId: string) => {
    try {
      const stored = localStorage.getItem(`walletBalance_${userId}`)
      setBalance(stored ? Number.parseFloat(stored) : 15420.5)
    } catch (error) {
      console.error("Error loading wallet balance:", error)
      setBalance(15420.5)
    }
  }

  const loadExternalTransactions = async (userId: string) => {
    try {
      // Dynamically import PaymentProcessor only on client side
      const { default: PaymentProcessor } = await import("@/lib/payment-processor")
      const external = PaymentProcessor.getExternalTransactions(userId)
      setExternalTransactions(external.slice(0, 3))
    } catch (error) {
      console.error("Error loading external transactions:", error)
      setExternalTransactions([])
    }
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("userEmail")
      router.push("/auth/login")
    } catch (error) {
      console.error("Error during logout:", error)
      router.push("/auth/login")
    }
  }

  // Show loading state during hydration
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Redirect if not authenticated (client-side only)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-xl">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="relative w-10 h-10 mr-3">
                <Image src="/monkey-mascot.png" alt="Money Buddy Mascot" fill className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Money Buddy</h1>
                <p className="text-xs text-white/70">Geo Bank</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter userId={userEmail || "demo-user"} />
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              {userEmail === "demo@moneybuddy.com" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Activity className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/10">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Balance Card - WHITE BACKGROUND */}
        <Card className="mb-8 bg-white border-gray-200 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-gray-900 flex items-center">
                  <Wallet className="h-6 w-6 mr-2 text-lime-500" />
                  Wallet Balance
                </CardTitle>
                <CardDescription className="text-gray-600">Your current available balance</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="text-gray-600 hover:bg-gray-100"
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-lime-600 mb-4">
              {showBalance ? `$${balance.toLocaleString()}` : "••••••"}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/send">
                <Button className="w-full btn-accent text-white font-semibold">
                  <Send className="h-4 w-4 mr-2" />
                  Send Money
                </Button>
              </Link>
              <Link href="/deposit">
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
              </Link>
              <Link href="/withdraw">
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Minus className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </Link>
              <Link href="/payment-methods">
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Receipt className="h-4 w-4 mr-2" />
                  Payment Methods
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions - WHITE BACKGROUND */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900">Recent Activity</CardTitle>
                <CardDescription className="text-gray-600">Your latest transactions and transfers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* External Transactions */}
                  {externalTransactions.map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.transactionType === "deposit" ? "bg-lime-100" : "bg-red-100"
                          }`}
                        >
                          {transaction.transactionType === "deposit" ? (
                            <Plus className="h-4 w-4 text-lime-600" />
                          ) : (
                            <Minus className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.transactionType === "deposit" ? "Deposit" : "Withdrawal"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.initiatedAt).toLocaleDateString()}
                          </p>
                          {transaction.transactionType === "withdrawal" && (
                            <p className="text-xs text-gray-400">Fee: ${transaction.feeAmount.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction.transactionType === "deposit" ? "text-lime-600" : "text-red-600"
                          }`}
                        >
                          {transaction.transactionType === "deposit" ? "+" : "-"}${transaction.amount.toFixed(2)}
                        </p>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : transaction.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            transaction.status === "completed"
                              ? "bg-lime-100 text-lime-700 border-lime-200"
                              : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : ""
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {/* Internal Transactions */}
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "received" ? "bg-lime-100" : "bg-purple-100"
                          }`}
                        >
                          {transaction.type === "received" ? (
                            <Receipt className="h-4 w-4 text-lime-600" />
                          ) : (
                            <Send className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.type === "received" ? `From ${transaction.from}` : `To ${transaction.to}`}
                          </p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                          {transaction.type === "sent" && (
                            <p className="text-xs text-gray-400">Fee: ${(transaction.amount * 0.02).toFixed(2)} (2%)</p>
                          )}
                          {transaction.restrictions && (
                            <div className="flex space-x-1 mt-1">
                              {transaction.restrictions.includes("geofence") && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-purple-100 text-purple-700 border-purple-200"
                                >
                                  <MapPin className="h-3 w-3 mr-1" />
                                  Geo
                                </Badge>
                              )}
                              {transaction.restrictions.includes("time") && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  Time
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${transaction.type === "received" ? "text-lime-600" : "text-gray-900"}`}
                        >
                          {transaction.type === "received" ? "+" : "-"}${transaction.amount}
                        </p>
                        {transaction.type === "sent" && (
                          <p className="text-xs text-gray-500">Net: ${(transaction.amount * 0.98).toFixed(2)}</p>
                        )}
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : transaction.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            transaction.status === "completed"
                              ? "bg-lime-100 text-lime-700 border-lime-200"
                              : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : ""
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - WHITE BACKGROUND */}
          <div className="space-y-6">
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/send" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send with Restrictions
                  </Button>
                </Link>
                <Link href="/transactions" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Transaction History
                  </Button>
                </Link>
                <Link href="/ai-assistant" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    AI Money Buddy
                  </Button>
                </Link>
                <Link href="/savings" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Locked Savings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900">Security Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">2FA Enabled</span>
                    <Badge className="bg-lime-100 text-lime-700 border-lime-200">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Biometric Login</span>
                    <Badge className="bg-lime-100 text-lime-700 border-lime-200">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Transaction PIN</span>
                    <Badge className="bg-lime-100 text-lime-700 border-lime-200">Set</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
