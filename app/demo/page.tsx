"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoneyBuddyLogo } from "@/components/money-buddy-logo"
import { ArrowRight, Users } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login after 5 seconds
    const timeout = setTimeout(() => {
      router.push("/auth/login")
    }, 5000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <MoneyBuddyLogo size="xl" className="animate-bounce" />
          </div>
          <div>
            <CardTitle className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Welcome to Money Buddy!
            </CardTitle>
            <CardDescription className="text-xl text-white/90 drop-shadow">
              The demo has been replaced with the real Money Buddy experience! 🐵💰
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-white/80 text-lg">
              Mock data has been removed and the application now uses real Supabase integration.
            </p>
            <p className="text-white/80">
              Create an account or sign in to experience the full Money Buddy platform with:
            </p>
            
            <div className="grid gap-2 text-left text-white/70 max-w-md mx-auto">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                <span>Real user authentication</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                <span>Secure database integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                <span>Live transaction tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                <span>Geofencing and AI features</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-xl backdrop-blur-sm font-semibold"
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
                className="w-full sm:w-auto border-2 border-lime-300 text-lime-300 hover:bg-lime-300/20 bg-transparent backdrop-blur-sm font-semibold"
              >
                Sign In
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-white/60 text-sm">
              Redirecting to login in 5 seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
