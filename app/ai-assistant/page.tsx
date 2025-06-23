"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your Money Buddy AI assistant! 🐵 I can help you with account information, transaction history, security settings, and answer questions about our smart banking features. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      // Simulate AI response with banking-specific logic
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const aiResponse = generateAIResponse(inputMessage)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I'm having trouble processing your request right now. Please try again later or contact customer support.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("balance") || input.includes("money") || input.includes("account")) {
      return "Your current wallet balance is $15,420.50. You have 3 pending transactions and 2 completed transactions this week. Would you like me to show you more details about any specific transactions?"
    }

    if (input.includes("send") || input.includes("transfer")) {
      return "To send money with Money Buddy, you can use our advanced transfer system with optional restrictions:\n\n• **Geofencing**: Set a location where the recipient must be to receive funds\n• **Time Restrictions**: Set specific time windows for fund collection\n• **Standard Transfer**: Send money instantly without restrictions\n\nWould you like me to guide you through creating a new transfer?"
    }

    if (input.includes("security") || input.includes("safe") || input.includes("protect")) {
      return "Your Money Buddy account security status:\n\n✅ Two-Factor Authentication: Enabled\n✅ Biometric Login: Active\n✅ Transaction PIN: Set\n✅ Daily Limit: $10,000\n✅ Monthly Limit: $50,000\n\nAll security features are properly configured. Is there a specific security setting you'd like to modify?"
    }

    if (input.includes("geofence") || input.includes("location") || input.includes("map")) {
      return "Geofencing is one of Money Buddy's coolest features! 🗺️ Here's how it works:\n\n1. When sending money, enable geofence restriction\n2. Use the map to select a center point and radius\n3. The recipient must be within that area to receive funds\n4. If they're outside the area, funds are automatically returned to you\n\nThis feature is perfect for ensuring payments are collected at specific locations like offices, stores, or events."
    }

    if (input.includes("time") || input.includes("schedule") || input.includes("when")) {
      return "Time restrictions let you control when recipients can collect funds:\n\n• Set start and end times for fund availability\n• Perfect for business hours or event-specific payments\n• Funds automatically return if not collected within the time window\n• Can be combined with geofencing for maximum control\n\nWould you like to learn how to set up time-restricted transfers?"
    }

    if (input.includes("help") || input.includes("support") || input.includes("problem")) {
      return "I'm your Money Buddy and I'm here to help! 🐵 I can assist you with:\n\n🏦 **Account Management**: Balance, transactions, history\n💸 **Smart Transfers**: Send money with or without restrictions\n🔒 **Security**: 2FA, biometrics, PIN settings\n📍 **Geofencing**: Location-based payment restrictions\n⏰ **Time Limits**: Schedule when payments can be collected\n📊 **Reports**: Transaction summaries and analytics\n\nWhat specific topic would you like help with?"
    }

    if (input.includes("transaction") || input.includes("history") || input.includes("payment")) {
      return "Here's a summary of your recent Money Buddy activity:\n\n**This Week:**\n• 2 completed transfers ($750 total)\n• 3 pending transfers ($1,750 total)\n• 1 geofence-restricted transfer\n• 1 time-restricted transfer\n\n**Security Notes:**\n• All transactions verified with 2FA\n• No suspicious activity detected\n• All restrictions functioning properly\n\nWould you like detailed information about any specific transaction?"
    }

    // Default response
    return "I understand you're asking about Money Buddy's banking services! 🐵 I can help you with account management, sending money with restrictions, security settings, transaction history, and more. Could you please be more specific about what you'd like to know or do?"
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4 text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="relative w-8 h-8 mr-3">
              <Image src="/monkey-mascot.png" alt="Money Buddy Mascot" fill className="object-contain" />
            </div>
            <h1 className="text-xl font-bold text-white">AI Money Buddy</h1>
            <Badge className="ml-3 bg-lime-500/20 text-lime-300 border-lime-400/30">Powered by Gemini</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="h-[600px] flex flex-col card-gradient border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Chat with AI Money Buddy</CardTitle>
            <CardDescription className="text-white/70">
              Ask questions about your account, transactions, or banking features
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "bg-white/10 text-white border border-white/20"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === "assistant" && (
                        <div className="relative w-5 h-5 mt-0.5 flex-shrink-0">
                          <Image src="/monkey-mascot.png" alt="Money Buddy" fill className="object-contain" />
                        </div>
                      )}
                      {message.role === "user" && <User className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-white/60"}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="relative w-5 h-5">
                        <Image src="/monkey-mascot.png" alt="Money Buddy" fill className="object-contain" />
                      </div>
                      <Loader2 className="h-4 w-4 animate-spin text-lime-400" />
                      <span className="text-white/80">Money Buddy is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Money Buddy anything about your account or banking features..."
                disabled={isLoading}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="btn-accent text-white font-semibold"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="p-4 h-auto text-left justify-start glass-effect text-white border-white/30 hover:bg-white/10"
            onClick={() => setInputMessage("What is my current balance?")}
          >
            <div>
              <div className="font-medium">Check Balance</div>
              <div className="text-sm text-white/60">View account balance and recent activity</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="p-4 h-auto text-left justify-start glass-effect text-white border-white/30 hover:bg-white/10"
            onClick={() => setInputMessage("How do I send money with geofencing?")}
          >
            <div>
              <div className="font-medium">Geofencing Help</div>
              <div className="text-sm text-white/60">Learn about location-based restrictions</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="p-4 h-auto text-left justify-start glass-effect text-white border-white/30 hover:bg-white/10"
            onClick={() => setInputMessage("Show me my security settings")}
          >
            <div>
              <div className="font-medium">Security Status</div>
              <div className="text-sm text-white/60">Review account security features</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
