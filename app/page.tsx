"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/stack-auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Banknote, MapPin, MessageCircle, Shield, Zap, Loader2 } from "lucide-react"
import { MoneyBuddyLogo } from "@/components/money-buddy-logo"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (user && !isLoading) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-lime-500 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white font-medium text-lg drop-shadow-lg">Loading Money Buddy...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-lime-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MoneyBuddyLogo className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold text-white">Money Buddy</h1>
                <p className="text-white/80 text-sm">AI Banking Assistant</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/auth/stack-login")}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Banking Made
              <span className="block text-lime-300">Intelligent</span>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Experience the future of banking with AI-powered assistance, location-based transfers, and smart financial
              management. Your money, smarter than ever. 🐵
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/auth/stack-login")}
                size="lg"
                className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-4 px-8 text-lg shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => router.push("/demo")}
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 font-bold py-4 px-8 text-lg backdrop-blur-sm"
              >
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features</h3>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Everything you need for modern banking, powered by artificial intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white">
              <CardHeader>
                <div className="w-12 h-12 bg-lime-500 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">AI Chat Assistant</CardTitle>
                <CardDescription className="text-white/70">
                  Get instant help with your banking questions from our intelligent AI assistant
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Geofenced Transfers</CardTitle>
                <CardDescription className="text-white/70">
                  Send money that can only be collected at specific locations for added security
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Banknote className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Smart Savings</CardTitle>
                <CardDescription className="text-white/70">
                  Lock your savings with time-based goals and earn rewards for reaching milestones
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Bank-Level Security</CardTitle>
                <CardDescription className="text-white/70">
                  Your data is protected with enterprise-grade encryption and security measures
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Instant Transfers</CardTitle>
                <CardDescription className="text-white/70">
                  Send and receive money instantly with real-time notifications and confirmations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <MoneyBuddyLogo className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Money Buddy AI</CardTitle>
                <CardDescription className="text-white/70">
                  Your personal financial companion that learns your habits and helps you save
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-16 text-center">
          <Card className="max-w-2xl mx-auto border-2 border-white/20 bg-white/10 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
              <p className="text-white/80 text-lg mb-6">
                Join thousands of users who are already banking smarter with Money Buddy
              </p>
              <Button
                onClick={() => router.push("/auth/stack-login")}
                size="lg"
                className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-4 px-8 text-lg shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <MoneyBuddyLogo className="w-8 h-8" />
              <span className="text-white font-semibold">Money Buddy</span>
            </div>
            <p className="text-white/60 text-sm">© 2024 Money Buddy. Secure banking powered by Stack Auth.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
