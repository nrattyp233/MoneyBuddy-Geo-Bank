"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bot, Send, User, Wallet, MapPin, Lock, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

interface Message {
  id: number
  type: "user" | "bot"
  content: string
  timestamp: Date
  suggestions?: string[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your Money Buddy AI assistant powered by Gemini. I can help you with transfers, account management, geofencing, locked savings, and more. How can I help you manage your money today?",
      timestamp: new Date(),
      suggestions: [
        "Check my balance",
        "Send money with geofencing",
        "Lock savings account",
        "View recent transactions",
      ],
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const quickActions = [
    { icon: Wallet, label: "Balance", query: "What's my current balance?" },
    { icon: Send, label: "Transfer", query: "How do I send money?" },
    { icon: MapPin, label: "Geofencing", query: "Explain geofenced transfers" },
    { icon: Lock, label: "Savings", query: "How do locked savings work?" },
    { icon: Clock, label: "Time Limits", query: "Set up time restrictions" },
  ]

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(message)
      setMessages((prev) => [...prev, botResponse])
      setIsLoading(false)
    }, 1500)
  }

  const generateBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase()

    let response = ""
    let suggestions: string[] = []

    if (lowerMessage.includes("balance")) {
      response =
        "Your current wallet balance is $12,450.75 and your locked savings total $5,000.00. Your emergency fund is earning 3.0% APY and will unlock on March 15, 2024."
      suggestions = ["Transfer money", "Lock more savings", "View transaction history"]
    } else if (lowerMessage.includes("geofenc") || lowerMessage.includes("location")) {
      response =
        "Geofenced transfers allow you to restrict where recipients can collect funds. You can draw circles on a map to define allowed areas. If the recipient isn't in the geofenced area, the funds automatically return to you after the time limit expires."
      suggestions = ["Create geofenced transfer", "View geofence tutorial", "Set time restrictions"]
    } else if (lowerMessage.includes("lock") || lowerMessage.includes("savings")) {
      response =
        "Locked savings accounts let you secure funds for 3, 6, 9, or 12 months with higher interest rates. Early withdrawal is possible but incurs a penalty fee. Current rates: 3 months (2.5%), 6 months (3.0%), 9 months (3.5%), 12 months (4.0%)."
      suggestions = ["Lock new savings", "View locked accounts", "Calculate earnings"]
    } else if (lowerMessage.includes("transfer") || lowerMessage.includes("send")) {
      response =
        "You can send money instantly with optional restrictions. All transfers have a 2% transaction fee. You can add geofencing to restrict pickup locations, set time limits for collection, or use both restrictions together."
      suggestions = ["Send money now", "Add geofencing", "Set time limits"]
    } else if (lowerMessage.includes("fee") || lowerMessage.includes("cost")) {
      response =
        "Money Buddy charges a 2% fee on all transfers, which goes to the admin account. Deposits are free. Early withdrawal from locked savings incurs penalty fees: 3 months (1%), 6 months (1.5%), 9 months (2%), 12 months (2.5%)."
      suggestions = ["View fee schedule", "Calculate transfer cost", "Lock savings"]
    } else {
      response =
        "I can help you with account management, transfers, geofencing, locked savings, transaction history, and security features. What would you like to know more about?"
      suggestions = ["Check balance", "Send money", "Lock savings", "View transactions"]
    }

    return {
      id: Date.now(),
      type: "bot",
      content: response,
      timestamp: new Date(),
      suggestions,
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const handleQuickAction = (query: string) => {
    handleSendMessage(query)
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Money Buddy Assistant</h1>
          <p className="text-gray-600">Get help with your banking needs using your friendly Money Buddy AI</p>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-16 flex flex-col items-center space-y-1 bg-transparent"
                  onClick={() => handleQuickAction(action.query)}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="h-96">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <span>Chat with Money Buddy Assistant</span>
              <Badge variant="secondary">Powered by Gemini</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === "bot" && <Bot className="h-4 w-4 mt-0.5 text-blue-600" />}
                      {message.type === "user" && <User className="h-4 w-4 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length > 0 && messages[messages.length - 1].suggestions && !isLoading && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Suggested actions:</p>
                <div className="flex flex-wrap gap-2">
                  {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                    <Button key={index} variant="outline" size="sm" onClick={() => handleSuggestionClick(suggestion)}>
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Ask me anything about your banking..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputMessage)}
                disabled={isLoading}
              />
              <Button onClick={() => handleSendMessage(inputMessage)} disabled={isLoading || !inputMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
