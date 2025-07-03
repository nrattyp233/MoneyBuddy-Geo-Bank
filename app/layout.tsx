import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { StackAuthProvider } from "@/components/stack-auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Money Buddy - AI Banking Assistant",
  description: "Your intelligent banking companion with geofenced transfers and AI chat support",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StackAuthProvider>{children}</StackAuthProvider>
      </body>
    </html>
  )
}
