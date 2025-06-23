"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Download, Send, Receipt, MapPin, Clock, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Transaction {
  id: string
  type: "sent" | "received" | "deposit" | "withdrawal"
  amount: number
  counterparty: string
  description: string
  status: "completed" | "pending" | "failed" | "expired" | "returned"
  date: string
  restrictions: string[]
  transactionHash: string
}

export default function TransactionsPage() {
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "received",
      amount: 500,
      counterparty: "John Doe",
      description: "Payment for services",
      status: "completed",
      date: "2024-01-15T10:30:00Z",
      restrictions: [],
      transactionHash: "0xabc123...def456",
    },
    {
      id: "2",
      type: "sent",
      amount: 250,
      counterparty: "Jane Smith",
      description: "Lunch payment",
      status: "completed",
      date: "2024-01-14T15:45:00Z",
      restrictions: ["geofence"],
      transactionHash: "0x789ghi...jkl012",
    },
    {
      id: "3",
      type: "sent",
      amount: 1000,
      counterparty: "Mike Johnson",
      description: "Event ticket payment",
      status: "pending",
      date: "2024-01-13T09:15:00Z",
      restrictions: ["time", "geofence"],
      transactionHash: "0x345mno...pqr678",
    },
    {
      id: "4",
      type: "deposit",
      amount: 2000,
      counterparty: "Bank Transfer",
      description: "Salary deposit",
      status: "completed",
      date: "2024-01-12T08:00:00Z",
      restrictions: [],
      transactionHash: "0x901stu...vwx234",
    },
    {
      id: "5",
      type: "sent",
      amount: 75,
      counterparty: "Coffee Shop",
      description: "Coffee purchase",
      status: "returned",
      date: "2024-01-11T14:20:00Z",
      restrictions: ["geofence"],
      transactionHash: "0x567yza...bcd890",
    },
  ])

  const [filteredTransactions, setFilteredTransactions] = useState(transactions)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [router])

  useEffect(() => {
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((tx) => tx.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.type === typeFilter)
    }

    setFilteredTransactions(filtered)
  }, [searchTerm, statusFilter, typeFilter, transactions])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-lime-500/20 text-lime-300 border-lime-400/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
      case "failed":
        return "bg-red-500/20 text-red-300 border-red-400/30"
      case "expired":
        return "bg-gray-500/20 text-gray-300 border-gray-400/30"
      case "returned":
        return "bg-blue-500/20 text-blue-300 border-blue-400/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/30"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sent":
        return <Send className="h-4 w-4" />
      case "received":
        return <Receipt className="h-4 w-4" />
      case "deposit":
        return <Receipt className="h-4 w-4" />
      case "withdrawal":
        return <Send className="h-4 w-4" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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
            <Receipt className="h-6 w-6 text-lime-400 mr-3" />
            <h1 className="text-xl font-bold text-white">Transaction History</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6 card-gradient border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Filter Transactions</CardTitle>
            <CardDescription className="text-white/70">Search and filter your transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="glass-effect text-white border-white/30 hover:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="card-gradient border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
            <CardDescription className="text-white/70">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "received" || transaction.type === "deposit"
                            ? "bg-lime-500/20"
                            : "bg-purple-500/20"
                        }`}
                      >
                        <div
                          className={
                            transaction.type === "received" || transaction.type === "deposit"
                              ? "text-lime-400"
                              : "text-purple-400"
                          }
                        >
                          {getTypeIcon(transaction.type)}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-white">
                            {transaction.type === "received" || transaction.type === "deposit"
                              ? `From ${transaction.counterparty}`
                              : `To ${transaction.counterparty}`}
                          </h3>
                          <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                        </div>

                        <p className="text-sm text-white/70 mt-1">{transaction.description}</p>
                        <p className="text-xs text-white/50 mt-1">{formatDate(transaction.date)}</p>

                        {transaction.restrictions.length > 0 && (
                          <div className="flex space-x-1 mt-2">
                            {transaction.restrictions.includes("geofence") && (
                              <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                                <MapPin className="h-3 w-3 mr-1" />
                                Geofenced
                              </Badge>
                            )}
                            {transaction.restrictions.includes("time") && (
                              <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-400/30">
                                <Clock className="h-3 w-3 mr-1" />
                                Time Limited
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === "received" || transaction.type === "deposit"
                            ? "text-lime-400"
                            : "text-white"
                        }`}
                      >
                        {transaction.type === "received" || transaction.type === "deposit" ? "+" : "-"}$
                        {transaction.amount.toLocaleString()}
                      </p>

                      <div className="flex items-center space-x-2 mt-2">
                        <Button variant="ghost" size="sm" className="text-white/70 hover:bg-white/10 hover:text-white">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>

                      <p className="text-xs text-white/50 mt-1 font-mono">
                        {transaction.transactionHash.slice(0, 10)}...
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No transactions found</h3>
                  <p className="text-white/60">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
