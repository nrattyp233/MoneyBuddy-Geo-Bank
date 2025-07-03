"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/stack-auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogIn, ArrowRight, Loader2 } from "lucide-react"
import { MoneyBuddyLogo } from "@/components/money-buddy-logo"

export default function StackLoginPage() {
  const { user, isLoading, signIn } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Redirect if already logged in
    if (user && !isLoading) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  const handleSignIn = async () => {
    setSigningIn(true)
    try {
      await signIn()
      // Successful login will trigger redirect via useEffect
    } catch (error) {
      console.error("Sign in error:", error)
      setSigningIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-lime-500 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white font-medium text-lg drop-shadow-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-lime-500 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-md border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <MoneyBuddyLogo className="w-16 h-16" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-purple-900 flex items-center justify-center">
              <LogIn className="h-8 w-8 mr-2 text-lime-500" />
              Welcome to Money Buddy
            </CardTitle>
            <CardDescription className="text-gray-700 font-medium text-lg mt-2">
              Sign in with your account to access AI banking 🐵
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-bold py-4 text-lg shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            <div className="flex items-center justify-center">
              {signingIn ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In with Google
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </div>
          </Button>

          <div className="text-center pt-4">
            <p className="text-gray-600 text-sm">Secure authentication powered by Stack Auth</p>
            <p className="text-gray-500 text-xs mt-1">Your banking data is protected and encrypted</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
