"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PiggyBank, Lock, TrendingUp, Calendar, DollarSign, Target, Plus, ArrowRight } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function SavingsPage() {
  const [savingsData, setSavingsData] = useState<{
    totalSavings: number
    activeLocks: any[]
    savingsGoals: any[]
    monthlyEarnings: number
  }>({
    totalSavings: 0,
    activeLocks: [],
    savingsGoals: [],
    monthlyEarnings: 0
  })
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Load savings data
        loadSavingsData(user.id)
      }
    }
    getCurrentUser()
  }, [])

  const loadSavingsData = async (userId: string) => {
    try {
      // Get locked savings accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('account_type', 'savings')
        .eq('is_locked', true)

      if (accountsError) {
        console.error('Error loading savings accounts:', accountsError)
      }

      // Calculate total savings and earnings
      const totalLocked = accounts?.reduce((sum, account) => sum + parseFloat(account.balance), 0) || 0
      const monthlyEarnings = accounts?.reduce((sum, account) => {
        if (account.interest_rate) {
          const rate = parseFloat(account.interest_rate) / 100
          const monthlyRate = rate / 12
          return sum + (parseFloat(account.balance) * monthlyRate)
        }
        return sum
      }, 0) || 0

      setSavingsData({
        totalSavings: totalLocked,
        activeLocks: accounts || [],
        savingsGoals: [], // Could be extended with a goals table
        monthlyEarnings: monthlyEarnings
      })
    } catch (error) {
      console.error('Error loading savings data:', error)
    }
  }

  const mockSavingsGoals = [
    { id: 1, title: "Emergency Fund", target: 5000, current: 2500, deadline: "2025-12-31" },
    { id: 2, title: "Vacation", target: 2000, current: 800, deadline: "2025-08-01" },
    { id: 3, title: "New Car", target: 15000, current: 3200, deadline: "2026-06-01" }
  ]

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Savings Hub 💰</h1>
          <p className="text-gray-600">Grow your money with smart savings and time-locked accounts</p>
        </div>

        {/* Savings Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <PiggyBank className="h-5 w-5" />
                <span>Total Savings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">
                ${savingsData.totalSavings.toFixed(2)}
              </div>
              <p className="text-sm text-green-600 mt-1">Across all locked accounts</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-700">
                <TrendingUp className="h-5 w-5" />
                <span>Monthly Earnings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">
                ${savingsData.monthlyEarnings.toFixed(2)}
              </div>
              <p className="text-sm text-blue-600 mt-1">Interest earned per month</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <Lock className="h-5 w-5" />
                <span>Active Locks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-800">
                {savingsData.activeLocks.length}
              </div>
              <p className="text-sm text-purple-600 mt-1">Time-locked savings accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/savings/lock">
            <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50/50 to-red-50/50 hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Lock className="h-8 w-8 text-orange-600" />
                    <div>
                      <h3 className="font-semibold text-orange-800">Lock Savings</h3>
                      <p className="text-sm text-orange-600">Earn up to 4% APY with time locks</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-2 border-gray-100 bg-gradient-to-br from-gray-50/50 to-slate-50/50 opacity-75">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target className="h-8 w-8 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Savings Goals</h3>
                    <p className="text-sm text-gray-600">Set and track savings targets</p>
                  </div>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Locked Savings */}
        {savingsData.activeLocks.length > 0 && (
          <Card className="border-2 border-green-100">
            <CardHeader>
              <CardTitle className="text-green-700">Your Locked Savings</CardTitle>
              <CardDescription>Active time-locked savings accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savingsData.activeLocks.map((account: any, index: number) => (
                  <div key={account.id || index} className="border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-green-600" />
                        <span className="font-medium">${parseFloat(account.balance).toFixed(2)}</span>
                        {account.interest_rate && (
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            {account.interest_rate}% APY
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        Unlocks: {account.lock_end_date ? new Date(account.lock_end_date).toLocaleDateString() : 'No end date'}
                      </span>
                    </div>
                    {account.purpose && (
                      <p className="text-sm text-gray-600 mb-2">Purpose: {account.purpose}</p>
                    )}
                    {account.interest_rate && (
                      <div className="text-xs text-green-600">
                        Monthly earnings: ${(parseFloat(account.balance) * parseFloat(account.interest_rate) / 100 / 12).toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Savings Goals Preview */}
        <Card className="border-2 border-purple-100">
          <CardHeader>
            <CardTitle className="text-purple-700">Savings Goals Preview</CardTitle>
            <CardDescription>Track your progress towards financial goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSavingsGoals.map((goal) => (
                <div key={goal.id} className="border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{goal.title}</h4>
                    <span className="text-sm text-gray-600">
                      ${goal.current} / ${goal.target}
                    </span>
                  </div>
                  <Progress 
                    value={(goal.current / goal.target) * 100} 
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{Math.round((goal.current / goal.target) * 100)}% complete</span>
                    <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Badge variant="secondary" className="text-purple-700">
                Full goals feature coming soon!
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        {savingsData.activeLocks.length === 0 && (
          <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
            <CardHeader>
              <CardTitle className="text-blue-700">Start Saving with Money Buddy</CardTitle>
              <CardDescription>
                Lock your money for a fixed period and earn guaranteed interest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">How it works:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• Choose an amount to lock away</p>
                    <p>• Select a time period (3-12 months)</p>
                    <p>• Earn guaranteed interest (up to 4% APY)</p>
                    <p>• Access your funds when the lock expires</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">Benefits:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• Higher interest than regular savings</p>
                    <p>• Helps you avoid impulse spending</p>
                    <p>• Guaranteed returns (not market-dependent)</p>
                    <p>• Flexible lock periods to fit your goals</p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Link href="/savings/lock">
                  <Button className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white transform hover:scale-105 transition-all duration-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Start Your First Savings Lock
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
