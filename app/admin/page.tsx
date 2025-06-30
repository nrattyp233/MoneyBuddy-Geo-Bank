"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MapboxStatus } from "@/components/mapbox-status"
import { SquareStatus } from "@/components/square-status"
import { MoneyBuddyLogo } from "@/components/money-buddy-logo"
import { Settings, Database, CreditCard, Bot, Shield, Users, DollarSign } from "lucide-react"

export default function AdminPage() {
  const integrationStatus = [
    {
      name: "Square Payments",
      status: process.env.SQUARE_ACCESS_TOKEN ? "configured" : "pending",
      description: "Real money processing",
      icon: CreditCard,
    },
    {
      name: "Database",
      status: process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "pending",
      description: "User data and transactions",
      icon: Database,
    },
    {
      name: "Gemini AI",
      status: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "configured" : "pending",
      description: "Money Buddy Assistant",
      icon: Bot,
    },
  ]

  const stats = [
    { label: "Total Users", value: "1,247", change: "+12%", icon: Users },
    { label: "Total Transactions", value: "$45,678", change: "+8%", icon: DollarSign },
    { label: "Fees Collected", value: "$913.56", change: "+15%", icon: CreditCard },
    { label: "Locked Savings", value: "$123,456", change: "+22%", icon: Shield },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <MoneyBuddyLogo size="lg" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Money Buddy Admin</h1>
            <p className="text-gray-600">System configuration and monitoring dashboard</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{stat.value}</div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                      {stat.change}
                    </Badge>
                  </div>
                  <stat.icon className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Square Configuration */}
        <SquareStatus />

        {/* Mapbox Configuration */}
        <MapboxStatus />

        {/* Integration Status */}
        <Card className="border-2 border-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Integration Status</span>
            </CardTitle>
            <CardDescription>Monitor the status of Money Buddy's key integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {integrationStatus.map((integration, index) => (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-lg ${
                    integration.status === "configured"
                      ? "border-green-200 bg-green-50"
                      : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <integration.icon className="h-6 w-6 text-purple-600" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-500">{integration.description}</p>
                    </div>
                    <Badge
                      className={
                        integration.status === "configured"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {integration.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">SSL Certificate</span>
                  <Badge className="bg-green-100 text-green-800">Valid</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">2FA Enabled Users</span>
                  <Badge className="bg-blue-100 text-blue-800">89%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Failed Login Attempts</span>
                  <Badge className="bg-green-100 text-green-800">Low</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Square Webhook Status</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-cyan-100 bg-gradient-to-br from-cyan-50/50 to-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Users (24h)</span>
                  <Badge className="bg-green-100 text-green-800">342</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">New Registrations</span>
                  <Badge className="bg-blue-100 text-blue-800">23</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Support Tickets</span>
                  <Badge className="bg-yellow-100 text-yellow-800">5</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Payment Success Rate</span>
                  <Badge className="bg-green-100 text-green-800">98.7%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
