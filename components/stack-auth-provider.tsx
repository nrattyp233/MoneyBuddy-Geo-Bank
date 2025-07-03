"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { stackClientApp } from "@/lib/stack-auth"

type User = Awaited<ReturnType<NonNullable<typeof stackClientApp>["getUser"]>>

interface AuthCtx {
  user: User | null
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function StackAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!stackClientApp) {
      setIsLoading(false)
      return
    }

    // Initial load
    stackClientApp
      .getUser()
      .then((u) => {
        setUser(u ?? null)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))

    // Realtime listener
    const unsub = stackClientApp.onAuthStateChanged((session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return unsub
  }, [])

  const signIn = async () => {
    if (!stackClientApp) return
    try {
      await stackClientApp.signInWithOAuth({ provider: "google" })
    } catch (error) {
      console.error("Sign in error:", error)
    }
  }

  const signOut = async () => {
    if (!stackClientApp) return
    try {
      await stackClientApp.signOut()
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
