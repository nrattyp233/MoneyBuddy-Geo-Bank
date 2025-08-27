import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  DollarSign, 
  PiggyBank, 
  Shield, 
  Smartphone,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { MoneyBuddyLogo } from "@/components/money-buddy-logo"

export default function DemoPage() {
  const [countdown, setCountdown] = useState(5)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate("/auth/login")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-lime-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MoneyBuddyLogo size="xl" className="animate-bounce" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl">
            Money Buddy Demo 🐵
          </h1>
          <p className="text-xl text-white/90 mb-6 drop-shadow-lg font-medium">
            Experience the future of location-based banking and smart savings
          </p>
          
          {/* Auto-redirect notice */}
          <Card className="max-w-md mx-auto border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Demo Mode</span>
              </div>
              <p className="text-yellow-700 text-sm mb-3">
                Mock data has been removed for production readiness. 
                Redirecting to login in <span className="font-bold">{countdown}</span> seconds...
              </p>
              <Button 
                onClick={() => navigate("/auth/login")}
                className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-semibold"
              >
                Go to Login Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature Showcase */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-purple-700" />
              </div>
              <CardTitle className="text-purple-900 font-bold">Geofence Transfers</CardTitle>
              <CardDescription className="text-gray-700 font-medium">
                Send money that can only be claimed at specific locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Interactive map drawing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">GPS verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Automatic refunds</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-lime-500/20 rounded-lg flex items-center justify-center mb-4">
                <PiggyBank className="h-6 w-6 text-lime-700" />
              </div>
              <CardTitle className="text-purple-900 font-bold">Time-Locked Savings</CardTitle>
              <CardDescription className="text-gray-700 font-medium">
                Lock funds for higher interest rates with early withdrawal penalties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">3-12 month terms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">2.5% - 4.0% APY</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Compound interest</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-700" />
              </div>
              <CardTitle className="text-purple-900 font-bold">Secure Payments</CardTitle>
              <CardDescription className="text-gray-700 font-medium">
                PayPal integration with bank-grade security and encryption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">PayPal & Venmo support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Instant deposits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Buyer protection</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-4">
                Ready to Start Your Money Buddy Journey? 🚀
              </h2>
              <p className="text-gray-700 mb-6 font-medium">
                Create your account to access real geofence transfers, time-locked savings, 
                and AI-powered financial assistance.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => navigate("/auth/register")}
                  className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-semibold px-6 py-3 shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center">
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </Button>
                <Button
                  onClick={() => navigate("/auth/login")}
                  variant="outline"
                  className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold px-6 py-3"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}