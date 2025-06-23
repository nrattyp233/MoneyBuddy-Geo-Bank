"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Lock, Unlock, TrendingUp, AlertTriangle, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import NotificationService from "@/lib/notification-service"

interface LockedAccount {
  id: string
  accountName: string
  lockedAmount: number
  lockDurationMonths: number
  interestRate: number
  lockedAt: string
  unlockDate: string
  status: "active" | "withdrawn" | "matured"
  earlyWithdrawalFeeRate: number
  projectedEarnings: number
  currentValue: number
}

export default function SavingsPage() {
  const [lockedAccounts, setLockedAccounts] = useState<LockedAccount[]>([
    {
      id: "1",
      accountName: "Emergency Fund",
      lockedAmount: 5000,
      lockDurationMonths: 6,
      interestRate: 0.02,
      lockedAt: "2024-01-01T00:00:00Z",
      unlockDate: "2024-07-01T00:00:00Z",
      status: "active",
      earlyWithdrawalFeeRate: 0.05,
      projectedEarnings: 50,
      currentValue: 5025,
    },
    {
      id: "2",
      accountName: "Vacation Savings",
      lockedAmount: 2000,
      lockDurationMonths: 3,
      interestRate: 0.02,
      lockedAt: "2024-02-01T00:00:00Z",
      unlockDate: "2024-05-01T00:00:00Z",
      status: "matured",
      earlyWithdrawalFeeRate: 0.05,
      projectedEarnings: 10,
      currentValue: 2010,
    },
  ])

  const [newLockData, setNewLockData] = useState({
    accountName: "",
    amount: "",
    duration: "",
  })

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [walletBalance] = useState(15420.5)

  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [router])

  useEffect(() => {
    const userId = localStorage.getItem("userEmail") || "demo-user"

    // Check for locked account maturity notifications
    NotificationService.checkLockedAccountMaturity(lockedAccounts, userId)
  }, [lockedAccounts])

  const lockDurationOptions = [
    { value: "3", label: "3 Months", rate: 0.015 },
    { value: "6", label: "6 Months", rate: 0.02 },
    { value: "9", label: "9 Months", rate: 0.025 },
    { value: "12", label: "12 Months", rate: 0.03 },
    { value: "18", label: "18 Months", rate: 0.035 },
    { value: "24", label: "24 Months", rate: 0.04 },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLockData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleDurationChange = (value: string) => {
    setNewLockData((prev) => ({
      ...prev,
      duration: value,
    }))
  }

  const calculateProjectedEarnings = (amount: number, duration: number, rate: number) => {
    return (amount * rate * duration) / 12
  }

  const calculateTimeProgress = (lockedAt: string, unlockDate: string) => {
    const now = new Date()
    const locked = new Date(lockedAt)
    const unlock = new Date(unlockDate)
    const totalTime = unlock.getTime() - locked.getTime()
    const elapsed = now.getTime() - locked.getTime()
    return Math.min(100, Math.max(0, (elapsed / totalTime) * 100))
  }

  const getDaysRemaining = (unlockDate: string) => {
    const now = new Date()
    const unlock = new Date(unlockDate)
    const diffTime = unlock.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const handleCreateLockedAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const amount = Number.parseFloat(newLockData.amount)
    const duration = Number.parseInt(newLockData.duration)

    if (!newLockData.accountName || !amount || !duration) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (amount > walletBalance) {
      setError("Insufficient wallet balance")
      setIsLoading(false)
      return
    }

    if (amount < 100) {
      setError("Minimum lock amount is $100")
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const selectedOption = lockDurationOptions.find((opt) => opt.value === newLockData.duration)
      const interestRate = selectedOption?.rate || 0.02

      const unlockDate = new Date()
      unlockDate.setMonth(unlockDate.getMonth() + duration)

      const newAccount: LockedAccount = {
        id: Date.now().toString(),
        accountName: newLockData.accountName,
        lockedAmount: amount,
        lockDurationMonths: duration,
        interestRate,
        lockedAt: new Date().toISOString(),
        unlockDate: unlockDate.toISOString(),
        status: "active",
        earlyWithdrawalFeeRate: 0.05,
        projectedEarnings: calculateProjectedEarnings(amount, duration, interestRate),
        currentValue: amount,
      }

      setLockedAccounts((prev) => [...prev, newAccount])
      setSuccess(`Successfully locked $${amount.toLocaleString()} for ${duration} months!`)
      setNewLockData({ accountName: "", amount: "", duration: "" })
      setShowCreateForm(false)
    } catch (err) {
      setError("Failed to create locked account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEarlyWithdrawal = async (accountId: string) => {
    const account = lockedAccounts.find((acc) => acc.id === accountId)
    if (!account) return

    const penaltyFee = account.lockedAmount * account.earlyWithdrawalFeeRate
    const netAmount = account.currentValue - penaltyFee

    const confirmed = window.confirm(
      `Early withdrawal will incur a ${(account.earlyWithdrawalFeeRate * 100).toFixed(1)}% penalty fee of $${penaltyFee.toFixed(2)}.\n\nYou will receive: $${netAmount.toFixed(2)}\nPenalty fee: $${penaltyFee.toFixed(2)} (sent to admin)\n\nDo you want to proceed?`,
    )

    if (confirmed) {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setLockedAccounts((prev) =>
          prev.map((acc) => (acc.id === accountId ? { ...acc, status: "withdrawn" as const } : acc)),
        )

        // Notify about fee collection
        const userId = localStorage.getItem("userEmail") || "demo-user"
        NotificationService.notifyFeeCollection("early_withdrawal", penaltyFee, account.lockedAmount, userId)

        setSuccess(
          `Early withdrawal completed. $${netAmount.toFixed(2)} returned to wallet. $${penaltyFee.toFixed(2)} penalty fee collected.`,
        )
      } catch (err) {
        setError("Failed to process early withdrawal. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleMaturedWithdrawal = async (accountId: string) => {
    const account = lockedAccounts.find((acc) => acc.id === accountId)
    if (!account) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setLockedAccounts((prev) =>
        prev.map((acc) => (acc.id === accountId ? { ...acc, status: "withdrawn" as const } : acc)),
      )

      setSuccess(
        `Successfully withdrawn $${account.currentValue.toFixed(2)} including $${account.projectedEarnings.toFixed(2)} in earnings!`,
      )
    } catch (err) {
      setError("Failed to process withdrawal. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const totalLocked = lockedAccounts
    .filter((acc) => acc.status === "active")
    .reduce((sum, acc) => sum + acc.lockedAmount, 0)

  const totalEarnings = lockedAccounts.reduce((sum, acc) => sum + acc.projectedEarnings, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Lock className="h-6 w-6 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Locked Savings</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Locked</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalLocked.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across {lockedAccounts.filter((acc) => acc.status === "active").length} accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Interest on locked funds</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${walletBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Available for locking</p>
            </CardContent>
          </Card>
        </div>

        {/* Create New Locked Account */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Create Locked Savings Account</CardTitle>
                <CardDescription>Lock funds for a predetermined period and earn interest</CardDescription>
              </div>
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                {showCreateForm ? "Cancel" : "New Lock"}
              </Button>
            </div>
          </CardHeader>

          {showCreateForm && (
            <CardContent>
              <form onSubmit={handleCreateLockedAccount} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      name="accountName"
                      placeholder="e.g., Emergency Fund"
                      value={newLockData.accountName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount to Lock ($)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="100"
                      max={walletBalance}
                      placeholder="0.00"
                      value={newLockData.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Lock Duration</Label>
                    <Select value={newLockData.duration} onValueChange={handleDurationChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {lockDurationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label} ({(option.rate * 100).toFixed(1)}% APY)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newLockData.amount && newLockData.duration && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Lock Summary:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Amount to lock:</span>
                        <span className="font-medium ml-2">
                          ${Number.parseFloat(newLockData.amount).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium ml-2">{newLockData.duration} months</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Interest rate:</span>
                        <span className="font-medium ml-2">
                          {(
                            (lockDurationOptions.find((opt) => opt.value === newLockData.duration)?.rate || 0) * 100
                          ).toFixed(1)}
                          % APY
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Projected earnings:</span>
                        <span className="font-medium ml-2 text-green-600">
                          $
                          {calculateProjectedEarnings(
                            Number.parseFloat(newLockData.amount),
                            Number.parseInt(newLockData.duration),
                            lockDurationOptions.find((opt) => opt.value === newLockData.duration)?.rate || 0,
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 inline mr-2" />
                      Early withdrawal incurs a 5% penalty fee sent to admin account.
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Creating Lock..." : "Lock Funds"}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Existing Locked Accounts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Your Locked Accounts</h2>

          {lockedAccounts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No locked accounts yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first locked savings account to start earning interest.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>Create Locked Account</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lockedAccounts.map((account) => {
                const progress = calculateTimeProgress(account.lockedAt, account.unlockDate)
                const daysRemaining = getDaysRemaining(account.unlockDate)
                const isMatured = account.status === "matured" || daysRemaining === 0

                return (
                  <Card key={account.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            {account.accountName}
                            <Badge
                              variant={
                                account.status === "active"
                                  ? "default"
                                  : account.status === "matured"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="ml-2"
                            >
                              {account.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {account.lockDurationMonths} months • {(account.interestRate * 100).toFixed(1)}% APY
                          </CardDescription>
                        </div>
                        {account.status === "active" && (
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {isMatured ? "Ready to withdraw" : `${daysRemaining} days left`}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Locked Amount</div>
                          <div className="text-lg font-semibold">${account.lockedAmount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Current Value</div>
                          <div className="text-lg font-semibold text-green-600">
                            ${account.currentValue.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Projected Earnings</div>
                          <div className="text-lg font-semibold text-green-600">
                            +${account.projectedEarnings.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Unlock Date</div>
                          <div className="text-sm font-medium">{new Date(account.unlockDate).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {account.status === "active" && (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          <div className="flex space-x-2">
                            {isMatured ? (
                              <Button
                                onClick={() => handleMaturedWithdrawal(account.id)}
                                disabled={isLoading}
                                className="flex-1"
                              >
                                <Unlock className="h-4 w-4 mr-2" />
                                Withdraw
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                onClick={() => handleEarlyWithdrawal(account.id)}
                                disabled={isLoading}
                                className="flex-1"
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Early Withdrawal (5% fee)
                              </Button>
                            )}
                          </div>
                        </>
                      )}

                      {account.status === "withdrawn" && (
                        <div className="text-center py-2">
                          <Badge variant="outline">Funds withdrawn</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
