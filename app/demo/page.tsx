"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoneyBuddyLogo } from "@/components/money-buddy-logo"
import { ArrowRight, Users, CheckCircle, Shield, DollarSign, MapPin, Clock, Bot, CreditCard } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-lime-500 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <Card className="w-full max-w-2xl border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <MoneyBuddyLogo size="xl" className="animate-bounce" />
          </div>
          <div>
            <CardTitle className="text-4xl font-bold text-purple-900 mb-4">
              Welcome to Money Buddy!
            </CardTitle>
            <CardDescription className="text-xl text-gray-700">
              Welcome to the Money Buddy demo! 🐵💰
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-700 text-lg">
              Experience the full Money Buddy platform with real features and integrations.
            </p>
            <p className="text-gray-700">
              Create an account or sign in to experience the full Money Buddy platform with:
            </p>
            
            <div className="grid gap-2 text-left text-gray-600 max-w-md mx-auto">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
                <span>Real user authentication</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
                <span>Secure database integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
                <span>Live transaction tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
                <span>Geofencing and AI features</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white shadow-xl backdrop-blur-sm font-semibold transform hover:scale-105 transition-all duration-300"
              >
                <Users className="h-5 w-5 mr-2" />
                Create Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-purple-400 text-purple-700 hover:bg-purple-400/20 bg-transparent backdrop-blur-sm font-semibold"
              >
                Sign In
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
