import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, MapPin, Clock, Bot, Lock, CreditCard } from "lucide-react"
import Link from "next/link"
import { MoneyBuddyLogo } from "@/components/money-buddy-logo"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-lime-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      {/* Header */}
      <header className="border-b bg-white/20 backdrop-blur-sm border-white/30 relative z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <MoneyBuddyLogo size="md" />
            <span className="text-2xl font-bold text-white drop-shadow-lg">Money Buddy</span>
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20 font-medium">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-lime-500 hover:bg-lime-600 text-white border border-lime-400 shadow-lg backdrop-blur-sm font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <MoneyBuddyLogo size="xl" className="animate-bounce" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-2xl filter">Smart Banking with Money Buddy 🐵</h1>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto drop-shadow-lg font-medium">
            Your friendly financial companion! Send real money with geofencing and time restrictions. Lock away savings
            with time-based accounts. Experience the future of secure digital banking powered by PayPal payments.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white shadow-xl backdrop-blur-sm font-semibold transform hover:scale-105 transition-all duration-300"
              >
                Start Banking with Money Buddy 🐵
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-2 border-purple-300 text-purple-100 hover:bg-purple-400/20 bg-transparent backdrop-blur-sm font-semibold"
              >
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white/20 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white drop-shadow-2xl">Powerful Features</h2>
          <p className="text-center text-white mb-12 drop-shadow-lg font-medium text-lg">
            Real money transactions with your trusted Money Buddy
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-white/30 hover:border-white/50 transition-all duration-300 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm hover:shadow-xl group">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <MapPin className="h-6 w-6 text-purple-700" />
                </div>
                <CardTitle className="text-purple-900 font-bold">Mapbox Geofencing</CardTitle>
                <CardDescription className="text-gray-700 font-medium">
                  Draw precise areas on interactive maps to restrict where recipients can collect real money
                </CardDescription>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-lime-500/20 text-lime-700 text-xs font-bold rounded-full border border-lime-500/30">
                    Location-Based
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/30 hover:border-white/50 transition-all duration-300 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm hover:shadow-xl group">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <Clock className="h-6 w-6 text-purple-700" />
                </div>
                <CardTitle className="text-purple-900 font-bold">Time Restrictions</CardTitle>
                <CardDescription className="text-gray-700 font-medium">
                  Set time limits for fund transfers with automatic returns using PayPal processing
                </CardDescription>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-lime-500/20 text-lime-700 text-xs font-bold rounded-full border border-lime-500/30">
                    Smart Timing
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/30 hover:border-white/50 transition-all duration-300 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm hover:shadow-xl group">
              <CardHeader>
                <div className="w-12 h-12 bg-lime-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <Lock className="h-6 w-6 text-lime-700" />
                </div>
                <CardTitle className="text-purple-900 font-bold">Locked Savings</CardTitle>
                <CardDescription className="text-gray-700 font-medium">
                  Lock real funds for 3, 6, or 9 months with competitive interest rates
                </CardDescription>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-lime-500/20 text-lime-700 text-xs font-bold rounded-full border border-lime-500/30">
                    High Interest
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/30 hover:border-white/50 transition-all duration-300 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm hover:shadow-xl group">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <CreditCard className="h-6 w-6 text-purple-700" />
                </div>
                <CardTitle className="text-purple-900 font-bold">PayPal Payments</CardTitle>
                <CardDescription className="text-gray-700 font-medium">
                  Secure real money processing with instant deposits and withdrawals
                </CardDescription>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-lime-500/20 text-lime-700 text-xs font-bold rounded-full border border-lime-500/30">
                    Secure & Fast
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/30 hover:border-white/50 transition-all duration-300 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm hover:shadow-xl group">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <Bot className="h-6 w-6 text-purple-700" />
                </div>
                <CardTitle className="text-purple-900 font-bold">Money Buddy AI</CardTitle>
                <CardDescription className="text-gray-700 font-medium">
                  Get help with banking tasks using your friendly Gemini-powered assistant
                </CardDescription>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-lime-500/20 text-lime-700 text-xs font-bold rounded-full border border-lime-500/30">
                    AI Powered
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/30 hover:border-white/50 transition-all duration-300 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm hover:shadow-xl group">
              <CardHeader>
                <div className="w-12 h-12 bg-lime-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <Shield className="h-6 w-6 text-lime-700" />
                </div>
                <CardTitle className="text-purple-900 font-bold">Bank-Grade Security</CardTitle>
                <CardDescription className="text-gray-700 font-medium">
                  Multi-factor authentication and encrypted real money transactions
                </CardDescription>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-lime-500/20 text-lime-700 text-xs font-bold rounded-full border border-lime-500/30">
                    Ultra Secure
                  </span>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white/10 backdrop-blur-sm relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <MoneyBuddyLogo size="lg" className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-2xl">Ready to Make Money Management Fun? 💰</h2>
          <p className="text-white mb-8 max-w-2xl mx-auto drop-shadow-lg font-medium text-lg">
            Join thousands of users who trust Money Buddy for secure, intelligent money management with real-world
            payments and your friendly financial companion.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-semibold px-8 py-4 shadow-xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
              >
                Start Your Money Buddy Journey
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-purple-300 text-purple-100 hover:bg-purple-400/20 hover:text-purple-100 font-semibold px-8 py-4 bg-transparent backdrop-blur-sm"
              >
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/20 backdrop-blur-sm text-white py-12 border-t border-white/30 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <MoneyBuddyLogo size="sm" />
            <span className="text-xl font-bold text-white drop-shadow-lg">Money Buddy</span>
          </div>
          <p className="text-white/90 font-medium">
            © 2024 Money Buddy. All rights reserved. Your friendly financial companion! 🐵
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <span className="text-sm text-white/80 hover:text-lime-300 cursor-pointer transition-colors font-medium">
              Privacy Policy
            </span>
            <span className="text-sm text-white/80 hover:text-lime-300 cursor-pointer transition-colors font-medium">
              Terms of Service
            </span>
            <span className="text-sm text-white/80 hover:text-lime-300 cursor-pointer transition-colors font-medium">
              Support
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
