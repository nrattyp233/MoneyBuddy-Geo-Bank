"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, MapPin, Clock, Bot, Zap, Lock, Globe, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
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
                <p className="text-xs text-white/80">Geo Bank</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="btn-accent text-white font-semibold">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative w-32 h-32 mx-auto mb-8 mascot-bounce">
            <Image src="/monkey-mascot.png" alt="Money Buddy Mascot" fill className="object-contain drop-shadow-2xl" />
          </div>

          <h1 className="text-6xl font-bold text-white mb-6">
            Meet Your
            <span className="block gradient-text bg-gradient-to-r from-lime-300 to-lime-500 bg-clip-text text-transparent">
              Money Buddy
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            The smartest way to send money with geofencing, time restrictions, and AI-powered assistance. Your friendly
            financial companion for secure, location-based payments.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="btn-accent text-white font-semibold px-8 py-4 text-lg">
                <Wallet className="h-5 w-5 mr-2" />
                Start Banking
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg glass-effect text-white border-white/30 hover:bg-white/10"
              >
                Try Demo
              </Button>
            </Link>
          </div>

          <div className="mt-8">
            <Badge className="bg-lime-500/20 text-lime-300 border-lime-400/30 px-4 py-2">
              <Bot className="h-4 w-4 mr-2" />
              Powered by Gemini AI
            </Badge>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Revolutionary Banking Features</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Experience banking like never before with our advanced restriction system and AI-powered assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-gradient border-purple-500/30 hover:border-lime-400/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <MapPin className="h-10 w-10 text-lime-400 mb-4" />
                <CardTitle className="text-white">Geofencing Magic</CardTitle>
                <CardDescription className="text-white/70">
                  Set location-based restrictions on your payments. Recipients must be in specified areas to receive
                  funds.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• Draw custom geofence areas on map</li>
                  <li>• Automatic fund return if outside area</li>
                  <li>• Perfect for business payments</li>
                  <li>• Real-time location verification</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-gradient border-purple-500/30 hover:border-lime-400/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <Clock className="h-10 w-10 text-lime-400 mb-4" />
                <CardTitle className="text-white">Time-Based Controls</CardTitle>
                <CardDescription className="text-white/70">
                  Schedule when payments can be collected with precise time windows and automatic expiration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• Set collection time windows</li>
                  <li>• Automatic fund return on expiry</li>
                  <li>• Business hours restrictions</li>
                  <li>• Event-specific payments</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-gradient border-purple-500/30 hover:border-lime-400/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <Bot className="h-10 w-10 text-lime-400 mb-4" />
                <CardTitle className="text-white">AI Money Buddy</CardTitle>
                <CardDescription className="text-white/70">
                  Get instant help with transactions, account management, and banking questions from our Gemini-powered
                  AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• 24/7 intelligent support</li>
                  <li>• Transaction guidance</li>
                  <li>• Account insights</li>
                  <li>• Security recommendations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-gradient border-purple-500/30 hover:border-lime-400/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <Lock className="h-10 w-10 text-lime-400 mb-4" />
                <CardTitle className="text-white">Fort Knox Security</CardTitle>
                <CardDescription className="text-white/70">
                  Multi-layer security with 2FA, biometric authentication, and transaction monitoring.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• Two-factor authentication</li>
                  <li>• Biometric login</li>
                  <li>• Transaction PIN protection</li>
                  <li>• Real-time fraud detection</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-gradient border-purple-500/30 hover:border-lime-400/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <Zap className="h-10 w-10 text-lime-400 mb-4" />
                <CardTitle className="text-white">Lightning Transfers</CardTitle>
                <CardDescription className="text-white/70">
                  Lightning-fast money transfers with real-time processing and immediate notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• Real-time processing</li>
                  <li>• Instant notifications</li>
                  <li>• Low transaction fees</li>
                  <li>• Global reach</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-gradient border-purple-500/30 hover:border-lime-400/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <Globe className="h-10 w-10 text-lime-400 mb-4" />
                <CardTitle className="text-white">Global Access</CardTitle>
                <CardDescription className="text-white/70">
                  Access your account anywhere in the world with our secure, cloud-based platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• Multi-currency support</li>
                  <li>• International transfers</li>
                  <li>• Mobile-first design</li>
                  <li>• Cross-platform sync</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Image src="/monkey-mascot.png" alt="Money Buddy Mascot" fill className="object-contain" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Meet Your Money Buddy?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Money Buddy for their smart, location-based banking needs.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="btn-accent text-white font-semibold px-8 py-4">
                <Sparkles className="h-5 w-5 mr-2" />
                Create Free Account
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 glass-effect text-white border-white/30 hover:bg-white/10"
              >
                Try Demo Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="relative w-8 h-8 mr-2">
                  <Image src="/monkey-mascot.png" alt="Money Buddy Mascot" fill className="object-contain" />
                </div>
                <div>
                  <span className="text-lg font-bold">Money Buddy</span>
                  <p className="text-xs text-white/60">Geo Bank</p>
                </div>
              </div>
              <p className="text-white/60">Your friendly financial companion for smart, location-based banking.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-white/60">
                <li>Geofencing</li>
                <li>Time Restrictions</li>
                <li>AI Assistant</li>
                <li>Advanced Security</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-white/60">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>API Documentation</li>
                <li>Status Page</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-white/60">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Security</li>
                <li>Compliance</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2024 Money Buddy - Geo Bank. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
