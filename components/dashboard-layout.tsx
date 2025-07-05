"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Home,
  Send,
  ArrowDownToLine,
  ArrowUpFromLine,
  PiggyBank,
  History,
  User,
  MessageCircle,
  LogOut,
  Menu,
  X,
  MapPin,
} from "lucide-react"
import { MoneyBuddyLogo } from "@/components/money-buddy-logo"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState("User")
  const [userBalance, setUserBalance] = useState(2500.0)
  const router = useRouter()

  useEffect(() => {
    // Load user data from multiple sources for maximum persistence
    const loadUserData = () => {
      try {
        // Try to get from main user object first
        const userDataStr = localStorage.getItem("moneyBuddyUser") || sessionStorage.getItem("moneyBuddyUser")
        if (userDataStr) {
          const userData = JSON.parse(userDataStr)
          if (userData.fullName) {
            setUserName(userData.fullName)
            return
          }
          if (userData.firstName && userData.lastName) {
            setUserName(`${userData.firstName} ${userData.lastName}`)
            return
          }
          if (userData.firstName) {
            setUserName(userData.firstName)
            return
          }
        }

        // Fallback to individual fields
        const fullName = localStorage.getItem("userFullName")
        if (fullName) {
          setUserName(fullName)
          return
        }

        const firstName = localStorage.getItem("userFirstName")
        const lastName = localStorage.getItem("userLastName")
        if (firstName && lastName) {
          setUserName(`${firstName} ${lastName}`)
          return
        }

        if (firstName) {
          setUserName(firstName)
          return
        }

        // Final fallback - check if user is authenticated but name is missing
        const isAuth = localStorage.getItem("isAuthenticated")
        if (isAuth === "true") {
          setUserName("Money Buddy User")
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        setUserName("User")
      }
    }

    loadUserData()

    // Load balance from localStorage if available
    const savedBalance = localStorage.getItem("userBalance")
    if (savedBalance) {
      setUserBalance(Number.parseFloat(savedBalance))
    }
  }, [])

  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem("moneyBuddyUser")
    localStorage.removeItem("userFirstName")
    localStorage.removeItem("userLastName")
    localStorage.removeItem("userFullName")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userBalance")
    sessionStorage.clear()

    router.push("/auth/login")
  }

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Send, label: "Transfer", href: "/transfer" },
    { icon: MapPin, label: "Geofence Transfer", href: "/transfer/geofence" },
    { icon: ArrowDownToLine, label: "Deposit", href: "/deposit" },
    { icon: ArrowUpFromLine, label: "Withdraw", href: "/withdraw" },
    { icon: PiggyBank, label: "Savings", href: "/savings/lock" },
    { icon: History, label: "Transactions", href: "/transactions" },
    { icon: MessageCircle, label: "AI Chat", href: "/chat" },
    { icon: User, label: "Profile", href: "/profile" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-lime-500">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-sm border-r-2 border-white/30 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MoneyBuddyLogo className="w-10 h-10" />
                <div>
                  <h2 className="text-xl font-bold text-purple-900">Money Buddy</h2>
                  <p className="text-sm text-gray-600">AI Banking</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden text-purple-600 hover:bg-purple-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-purple-900 text-lg">{userName}</h3>
              <p className="text-2xl font-bold text-lime-600">${userBalance.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Available Balance</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                onClick={() => {
                  router.push(item.href)
                  setIsMobileMenuOpen(false)
                }}
                className="w-full justify-start text-purple-900 hover:bg-purple-100 hover:text-purple-800 font-medium py-3"
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/20">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 font-medium py-3"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4 lg:hidden">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-white hover:bg-white/20"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center space-x-2">
              <MoneyBuddyLogo className="w-8 h-8" />
              <span className="text-white font-bold">Money Buddy</span>
            </div>
            <div className="text-white font-bold">${userBalance.toFixed(2)}</div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
