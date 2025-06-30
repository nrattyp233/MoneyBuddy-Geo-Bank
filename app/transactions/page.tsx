"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Send, Plus, MapPin, Clock, CalendarIcon, Search, Filter } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { format } from "date-fns"

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  const transactions = [
    {
      id: "TXN001",
      type: "sent",
      amount: 250.0,
      recipient: "john.smith@email.com",
      sender: "you",
      date: "2024-01-15T10:30:00",
      status: "completed",
      memo: "Lunch payment",
      restrictions: [],
      fee: 5.0,
    },
    {
      id: "TXN002",
      type: "sent",
      amount: 100.0,
      recipient: "sarah.johnson@email.com",
      sender: "you",
      date: "2024-01-14T15:45:00",
      status: "pending",
      memo: "Birthday gift",
      restrictions: ["geofence"],
      fee: 2.0,
      geofence: "Downtown area",
    },
    {
      id: "TXN003",
      type: "received",
      amount: 75.5,
      recipient: "you",
      sender: "mike.wilson@email.com",
      date: "2024-01-13T09:15:00",
      status: "completed",
      memo: "Shared expenses",
      restrictions: [],
      fee: 0,
    },
    {
      id: "TXN004",
      type: "sent",
      amount: 500.0,
      recipient: "emma.davis@email.com",
      sender: "you",
      date: "2024-01-12T14:20:00",
      status: "expired",
      memo: "Rent payment",
      restrictions: ["time", "geofence"],
      fee: 10.0,
      timeLimit: "24 hours",
      geofence: "Apartment complex",
    },
    {
      id: "TXN005",
      type: "received",
      amount: 1200.0,
      recipient: "you",
      sender: "company.payroll@business.com",
      date: "2024-01-10T08:00:00",
      status: "completed",
      memo: "Salary payment",
      restrictions: [],
      fee: 0,
    },
    {
      id: "TXN006",
      type: "sent",
      amount: 50.0,
      recipient: "alex.brown@email.com",
      sender: "you",
      date: "2024-01-09T19:30:00",
      status: "completed",
      memo: "Movie tickets",
      restrictions: ["time"],
      fee: 1.0,
      timeLimit: "6 hours",
    },
  ]

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.memo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalSent = transactions
    .filter((t) => t.type === "sent" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalReceived = transactions
    .filter((t) => t.type === "received" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalFees = transactions.filter((t) => t.type === "sent").reduce((sum, t) => sum + t.fee, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Money Buddy Transaction History</h1>
          <p className="text-gray-600">View and manage all your Money Buddy transactions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">-${totalSent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+${totalReceived.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
              <Badge variant="secondary">2%</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalFees.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Transaction fees paid</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Money Buddy Transactions</CardTitle>
            <CardDescription>
              {filteredTransactions.length} of {transactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${transaction.type === "received" ? "bg-green-100" : "bg-blue-100"}`}
                    >
                      {transaction.type === "received" ? (
                        <Plus className="h-4 w-4 text-green-600" />
                      ) : (
                        <Send className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">
                          {transaction.type === "received" ? "From" : "To"}{" "}
                          {transaction.type === "received" ? transaction.sender : transaction.recipient}
                        </p>
                        <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">Money Buddy: {transaction.memo}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-400">
                          {format(new Date(transaction.date), "MMM dd, yyyy • h:mm a")}
                        </p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-400">ID: {transaction.id}</p>
                      </div>
                      {transaction.restrictions.length > 0 && (
                        <div className="flex space-x-1 mt-2">
                          {transaction.restrictions.includes("geofence") && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {transaction.geofence || "Geofenced"}
                            </Badge>
                          )}
                          {transaction.restrictions.includes("time") && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {transaction.timeLimit || "Time Limited"}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${transaction.type === "received" ? "text-green-600" : "text-gray-900"}`}
                    >
                      {transaction.type === "received" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </p>
                    {transaction.fee > 0 && <p className="text-xs text-gray-500">Fee: ${transaction.fee.toFixed(2)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
