"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoneyBuddyLogo } from "@/components/money-buddy-logo"
import {
  Banknote,
  Shield,
  Smartphone,
  MapPin,
  MessageCircle,
  TrendingUp,
  ArrowRight,
  LogIn,
  UserPlus,
  Sparkles,
  Lock,
  Globe,
} from "lucide-react"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    const userFullName = localStorage.getItem("userFullName")

    if (authStatus === "true" && userFullName) {
      setIsAuthenticated(true)
      setUserName(userFullName)
    }
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/auth/register")
    }
  }

  const features = [
    {
      icon: <Banknote className="h-8 w-8 text-lime-500" />,
      title: "Smart Banking",
      description: "Manage your money with AI-powered insights and automated savings",
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      title: "Bank-Level Security",
      description: "Your funds are protected with enterprise-grade encryption and fraud detection",
    },
    {
      icon: <MapPin className="h-8 w-8 text-purple-500" />,
      title: "Geofenced Transfers",
      description: "Send money to specific locations with our innovative geofencing technology",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-orange-500" />,
      title: "AI Assistant",
      description: "Get personalized financial advice from your Money Buddy AI companion",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-500" />,
      title: "Smart Savings",
      description: "Automated savings goals with competitive interest rates and time locks",
    },
    {
      icon: <Smartphone className="h-8 w-8 text-pink-500" />,
      title: "Mobile First",
      description: "Beautiful, responsive design that works perfectly on all your devices",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-lime-500">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <MoneyBuddyLogo size={48} />
            <span className="text-2xl font-bold text-white">Money Buddy</span>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-white/90 font-medium">Welcome back, {userName}!</span>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/auth/login")}
                  className="text-white hover:bg-white/20"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push("/auth/register")}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <MoneyBuddyLogo size={120} />
            </div>

            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Banking Platform
            </Badge>

            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Your Smart
              <span className="block bg-gradient-to-r from-lime-300 to-lime-500 bg-clip-text text-transparent">
                Money Buddy
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the future of banking with AI-powered insights, geofenced transfers, and smart savings. Your
              personal financial companion that grows with you. 🐵💰
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-bold px-8 py-4 text-lg shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/demo")}
                className="border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg"
              >
                <Globe className="h-5 w-5 mr-2" />
                View Demo
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {feature.icon}
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/80 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-2 border-white/30 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Lock className="h-16 w-16 text-lime-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Bank-Grade Security</h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Your money and data are protected with the same security standards used by major banks. 256-bit
                encryption, fraud detection, and secure authentication keep your finances safe.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Shield className="h-4 w-4 mr-2" />
                  FDIC Insured
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <Lock className="h-4 w-4 mr-2" />
                  256-bit Encryption
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Fraud Detection
                </Badge>
              </div>
            </CardContent>
          </Card>
        </main>

        <footer className="text-center py-8 text-white/70">
          <p>&copy; 2024 Money Buddy. All rights reserved. Made with 💚 for smarter banking.</p>
        </footer>
      </div>
    </div>
  )
}
