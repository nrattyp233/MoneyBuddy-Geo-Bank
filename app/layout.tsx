import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Money Buddy - Geo Bank | Smart Location-Based Banking",
  description:
    "Your friendly financial companion for smart, secure banking with geofencing, time restrictions, and AI assistance. Send money with location-based controls and advanced security features.",
  keywords: "banking, geofencing, location-based payments, AI assistant, secure banking, money transfer",
  authors: [{ name: "Money Buddy Team" }],
  creator: "Money Buddy - Geo Bank",
  publisher: "Money Buddy - Geo Bank",
  robots: "index, follow",
  openGraph: {
    title: "Money Buddy - Geo Bank",
    description: "Your friendly financial companion for smart, location-based banking",
    type: "website",
    locale: "en_US",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
