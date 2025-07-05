import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, MapPin, Clock, Bot, Lock, CreditCard } from "lucide-react"
import Link from "next/link"
import { MoneyBuddyLogo } from "@/components/money-buddy-logo"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <header className="border-b bg-black/20 backdrop-blur-sm border-white/20">
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
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg backdrop-blur-sm font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <MoneyBuddyLogo size="xl" className="animate-bounce" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-2xl filter">Smart Banking with Money Buddy</h1>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto drop-shadow-lg font-medium">
            Your friendly financial companion! Send real money with geofencing and time restrictions. Lock away savings
            with time-based accounts. Experience the future of secure digital banking powered by Square payments.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-xl backdrop-blur-sm font-semibold"
              >
                Start Banking with Money Buddy 🐵
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-2 border-lime-300 text-lime-200 hover:bg-lime-400/20 bg-transparent backdrop-blur-sm font-semibold"
              >
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white drop-shadow-2xl">Powerful Features</h2>
          <p className="text-center text-white mb-12 drop-shadow-lg font-medium text-lg">
            Real money transactions with your trusted Money Buddy
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-white/30 hover:border-white/50 transition-all duration-300 bg-white/15 backdrop-blur-sm hover:shadow-xl group">
              <CardHeader>
                <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white font-bold drop-shadow-lg">Mapbox Geofencing</CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Draw precise areas on interactive maps to restrict where recipients can collect real money
                </CardDescription>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-lime-400/30 text-lime-200 text-xs font-bold rounded-full border border-lime-400/50">
                    Location-Based
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/30 hover:border-white/50 transition-all duration-300 bg-white/15 backdrop-blur-sm hover:shadow-xl group">
              <CardHeader>
                <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white font-bold drop-shadow-lg">Time Restrictions</CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Set time limits for fund transfers with automatic returns using Square processing
                </CardDescription>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-lime-400/30 text-lime-200 text-xs font-bold rounded-full border border-lime-400/50">
                    Smart Timing
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/30 hover:border-white/50 transition-all duration-300 bg-white/15 backdrop-blur-sm hover:shadow-xl group">
              <CardHeader>
                <div className="w-12 h-12 bg-lime-400/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <Lock className="h-6 w-6 text-lime-200" />
                </div>
                <CardTitle className="text-white font-bold drop-shadow-lg">Locked Savings</CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Lock real funds for 3, 6, or 9 months with competitive interest rates
                </CardDescription>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-lime-400/30 text-lime-200 text-xs font-bold rounded-full border border-lime-400/50">
                    High Interest
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/30 hover:border-white/50 transition-all duration-300 bg-white/15 backdrop-blur-sm hover:shadow-xl group">
              <CardHeader>
                <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white font-bold drop-shadow-lg">Square Payments</CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Secure real money processing with instant deposits and withdrawals
                </CardDescription>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-lime-400/30 text-lime-200 text-xs font-bold rounded-full border border-lime-400/50">
                    Secure & Fast
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/30 hover:border-white/50 transition-all duration-300 bg-white/15 backdrop-blur-sm hover:shadow-xl group">
              <CardHeader>
                <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white font-bold drop-shadow-lg">Money Buddy AI</CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Get help with banking tasks using your friendly Gemini-powered assistant
                </CardDescription>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-lime-400/30 text-lime-200 text-xs font-bold rounded-full border border-lime-400/50">
                    AI Powered
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-white/30 hover:border-white/50 transition-all duration-300 bg-white/15 backdrop-blur-sm hover:shadow-xl group">
              <CardHeader>
                <div className="w-12 h-12 bg-lime-400/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <Shield className="h-6 w-6 text-lime-200" />
                </div>
                <CardTitle className="text-white font-bold drop-shadow-lg">Bank-Grade Security</CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Multi-factor authentication and encrypted real money transactions
                </CardDescription>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-lime-400/30 text-lime-200 text-xs font-bold rounded-full border border-lime-400/50">
                    Ultra Secure
                  </span>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black/10 backdrop-blur-sm relative overflow-hidden">
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
                className="bg-white/20 text-white hover:bg-white/30 font-semibold px-8 py-4 shadow-xl backdrop-blur-sm border border-white/30"
              >
                Start Your Money Buddy Journey
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-lime-300 text-lime-200 hover:bg-lime-400/20 hover:text-lime-100 font-semibold px-8 py-4 bg-transparent backdrop-blur-sm"
              >
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm text-white py-12 border-t border-white/20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <MoneyBuddyLogo size="sm" />
            <span className="text-xl font-bold text-white drop-shadow-lg">Money Buddy</span>
          </div>
          <p className="text-white/80 font-medium">
            © 2024 Money Buddy. All rights reserved. Your friendly financial companion! 🐵
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <span className="text-sm text-white/70 hover:text-lime-300 cursor-pointer transition-colors font-medium">
              Privacy Policy
            </span>
            <span className="text-sm text-white/70 hover:text-lime-300 cursor-pointer transition-colors font-medium">
              Terms of Service
            </span>
            <span className="text-sm text-white/70 hover:text-lime-300 cursor-pointer transition-colors font-medium">
              Support
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
