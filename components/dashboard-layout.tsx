"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  Home,
  Send,
  MapPin,
  DollarSign,
  PiggyBank,
  MessageCircle,
  Settings,
  LogOut,
  User,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { MoneyBuddyLogo } from "@/components/money-buddy-logo"
import { supabase, getUserById, type User as DbUser } from "@/lib/supabase"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<DbUser | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if user is authenticated
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          router.push("/auth/login")
          return
        }

        // Get user data from database
        const dbUser = await getUserById(authUser.id)
        
        if (!dbUser) {
          console.error("User not found in database")
          router.push("/auth/login")
          return
        }

        setUser(dbUser)
        setBalance(dbUser.balance)
      } catch (error) {
        console.error("Error loading user data:", error)
        router.push("/auth/login")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Send Money", href: "/transfer", icon: Send },
    { name: "Geofence Transfer", href: "/transfer/geofence", icon: MapPin },
    { name: "Deposit", href: "/deposit", icon: DollarSign },
    { name: "Withdraw", href: "/withdraw", icon: TrendingUp },
    { name: "Savings", href: "/savings", icon: PiggyBank },
    { name: "AI Assistant", href: "/chat", icon: MessageCircle },
    { name: "Transactions", href: "/transactions", icon: Send },
    { name: "Profile", href: "/profile", icon: User },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium text-lg drop-shadow-lg">Loading Money Buddy...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-white font-medium text-lg drop-shadow-lg mb-4">Please sign in to continue</p>
          <Button onClick={() => router.push("/auth/login")} className="bg-white/20 hover:bg-white/30 text-white">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  // Extract first name from full name
  const firstName = user.name.split(' ')[0] || "User"

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/20 px-6 pb-4 backdrop-blur-sm border-r border-white/20">
          <div className="flex h-16 shrink-0 items-center">
            <MoneyBuddyLogo size="md" />
            <span className="ml-3 text-xl font-bold text-white drop-shadow-lg">Money Buddy</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                          pathname === item.href
                            ? "bg-white/20 text-white"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white/80">Current Balance</span>
                    <Badge className="bg-lime-400/20 text-lime-300 border-lime-400/30">Live</Badge>
                  </div>
                  <div className="text-2xl font-bold text-white">${balance.toLocaleString()}</div>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-black/20 px-4 py-4 shadow-sm backdrop-blur-sm border-b border-white/20 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="text-white hover:bg-white/10" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-gradient-primary border-white/20">
            <div className="flex items-center mb-6">
              <MoneyBuddyLogo size="md" />
              <span className="ml-3 text-xl font-bold text-white drop-shadow-lg">Money Buddy</span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                        pathname === item.href
                          ? "bg-white/20 text-white"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex-1 text-sm font-semibold leading-6 text-white">Money Buddy</div>
        <div className="text-right">
          <div className="text-sm font-medium text-white/80">Balance</div>
          <div className="text-lg font-bold text-white">${balance.toLocaleString()}</div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
          <div className="flex h-16 items-center gap-x-4 border-b border-white/20 bg-black/20 px-4 shadow-sm backdrop-blur-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="relative flex flex-1 items-center">
                <div className="text-white font-medium">
                  Welcome back, <span className="font-bold">{firstName}</span>! 🐵
                </div>
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-white/20 hover:bg-white/30">
                      <User className="h-4 w-4 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-white/30">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
