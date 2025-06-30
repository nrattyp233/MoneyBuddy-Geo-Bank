"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoneyBuddyLogo } from "@/components/money-buddy-logo"
import { MapPin, Lock, CreditCard, Bot, Shield, Clock, DollarSign, Users, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-primary p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <MoneyBuddyLogo size="xl" className="animate-bounce" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">Money Buddy Demo</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow">
            Your friendly financial companion! Experience smart banking with geofencing, locked savings, and AI
            assistance. 🐵💰
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/login">
              <Button
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-xl backdrop-blur-sm"
              >
                Try Money Buddy
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-lime-300 text-lime-300 hover:bg-lime-300/20 bg-transparent backdrop-blur-sm"
              >
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard Preview */}
          <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Smart Dashboard</CardTitle>
              <CardDescription className="text-white/80">
                Beautiful overview of your finances with real-time balance tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-sm text-white/80">Wallet Balance</span>
                  <span className="font-bold text-white">$12,450.75</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-sm text-white/80">Locked Savings</span>
                  <span className="font-bold text-white">$5,000.00</span>
                </div>
                <Badge className="bg-lime-400/20 text-lime-300 border-lime-400/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  All systems operational
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Mapbox Geofencing */}
          <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Mapbox Geofencing</CardTitle>
              <CardDescription className="text-white/80">
                Draw precise areas on interactive maps to restrict money transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-24 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <MapPin className="h-8 w-8 text-white" />
                  <span className="ml-2 text-white font-medium">Interactive Map</span>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="text-xs border-white/30 text-white/80">
                    <MapPin className="h-3 w-3 mr-1" />
                    Zone 1: 1km radius
                  </Badge>
                  <Badge variant="outline" className="text-xs border-white/30 text-white/80">
                    <Clock className="h-3 w-3 mr-1" />
                    24h limit
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Square Payments */}
          <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-lime-400/20 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                <CreditCard className="h-6 w-6 text-lime-300" />
              </div>
              <CardTitle className="text-white">Square Payments</CardTitle>
              <CardDescription className="text-white/80">
                Secure real money processing with instant deposits and withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-lime-300" />
                  <span className="text-sm text-white/80">PCI DSS Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-lime-300" />
                  <span className="text-sm text-white/80">Instant Deposits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-lime-300" />
                  <span className="text-sm text-white/80">Bank Withdrawals</span>
                </div>
                <Badge className="bg-lime-400/20 text-lime-300 border-lime-400/30">2.9% + 30¢ per transaction</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Locked Savings */}
          <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Locked Savings</CardTitle>
              <CardDescription className="text-white/80">
                Time-locked accounts with competitive interest rates and early withdrawal penalties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">3 months</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    2.5% APY
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">6 months</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    3.0% APY
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">12 months</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    4.0% APY
                  </Badge>
                </div>
                <div className="mt-3 p-2 bg-yellow-400/20 border border-yellow-400/30 rounded text-xs text-yellow-200 backdrop-blur-sm">
                  Early withdrawal penalties apply
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-lime-400/20 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                <Bot className="h-6 w-6 text-lime-300" />
              </div>
              <CardTitle className="text-white">Money Buddy AI</CardTitle>
              <CardDescription className="text-white/80">
                Gemini-powered assistant to help with banking tasks and questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-white/80">
                    "Hi! I'm your Money Buddy AI. I can help with transfers, savings, and more! 🐵"
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs border-white/30 text-white/80">
                    Check balance
                  </Badge>
                  <Badge variant="outline" className="text-xs border-white/30 text-white/80">
                    Send money
                  </Badge>
                  <Badge variant="outline" className="text-xs border-white/30 text-white/80">
                    Lock savings
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Admin Dashboard</CardTitle>
              <CardDescription className="text-white/80">
                Monitor integrations, user activity, and system health in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Total Users</span>
                  <Badge className="bg-white/20 text-white border-white/30">1,247</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Fees Collected</span>
                  <Badge className="bg-lime-400/20 text-lime-300 border-lime-400/30">$913.56</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">System Status</span>
                  <Badge className="bg-lime-400/20 text-lime-300 border-lime-400/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Features List */}
        <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-white text-2xl drop-shadow-lg">
              Complete Money Buddy Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-lime-300" />
                <span className="text-sm text-white/80">User Authentication & Profiles</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-lime-300" />
                <span className="text-sm text-white/80">Real Money Deposits (Square)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-lime-300" />
                <span className="text-sm text-white/80">Bank Account Withdrawals</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-lime-300" />
                <span className="text-sm text-white/80">Mapbox Geofenced Transfers</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-lime-300" />
                <span className="text-sm text-white/80">Time-Restricted Transfers</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-lime-300" />
                <span className="text-sm text-white/80">Locked Savings Accounts</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-lime-300" />
                <span className="text-sm text-white/80">Interest Rate Calculations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-lime-300" />
                <span className="text-sm text-white/80">Transaction History</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-lime-300" />
                <span className="text-sm text-white/80">Gemini AI Assistant</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-lime-300" />
                <span className="text-sm text-white/80">Admin Dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-lime-300" />
                <span className="text-sm text-white/80">Purple/Blue Gradient Theme</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-lime-300" />
                <span className="text-sm text-white/80">Custom Monkey Mascot</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">Ready to Experience Money Buddy?</h2>
          <p className="text-white/90 max-w-2xl mx-auto drop-shadow">
            Download the code, deploy to Vercel, or explore the demo pages to see your friendly financial companion in
            action!
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-xl backdrop-blur-sm"
              >
                <Users className="h-5 w-5 mr-2" />
                View Dashboard
              </Button>
            </Link>
            <Link href="/transfer/geofence">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-lime-300 text-lime-300 hover:bg-lime-300/20 bg-transparent backdrop-blur-sm"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Try Geofencing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
