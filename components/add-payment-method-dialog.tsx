"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Building2 } from "lucide-react"
import PaymentProcessor from "@/lib/payment-processor"

interface AddPaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  onError: (error: string) => void
}

export default function AddPaymentMethodDialog({
  open,
  onOpenChange,
  onSuccess,
  onError,
}: AddPaymentMethodDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [cardData, setCardData] = useState({
    name: "",
    cardNumber: "",
    cardholderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  })
  const [bankData, setBankData] = useState({
    name: "",
    accountNumber: "",
    routingNumber: "",
    accountType: "",
    bankName: "",
    accountHolderName: "",
  })

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Format card number with spaces
    if (name === "cardNumber") {
      const formatted = value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ")
      setCardData((prev) => ({ ...prev, [name]: formatted }))
    } else {
      setCardData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleBankInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const userId = localStorage.getItem("userEmail") || "demo-user"

      await PaymentProcessor.addDebitCard(userId, {
        name: cardData.name,
        cardNumber: cardData.cardNumber.replace(/\s/g, ""),
        cardholderName: cardData.cardholderName,
        expiryMonth: Number.parseInt(cardData.expiryMonth),
        expiryYear: Number.parseInt(cardData.expiryYear),
        cvv: cardData.cvv,
        billingAddress: {
          street: cardData.street,
          city: cardData.city,
          state: cardData.state,
          zipCode: cardData.zipCode,
          country: "US",
        },
      })

      onSuccess()
      onOpenChange(false)

      // Reset form
      setCardData({
        name: "",
        cardNumber: "",
        cardholderName: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
      })
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to add debit card")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const userId = localStorage.getItem("userEmail") || "demo-user"

      await PaymentProcessor.addBankAccount(userId, {
        name: bankData.name,
        accountNumber: bankData.accountNumber,
        routingNumber: bankData.routingNumber,
        accountType: bankData.accountType as "checking" | "savings",
        bankName: bankData.bankName,
        accountHolderName: bankData.accountHolderName,
      })

      onSuccess()
      onOpenChange(false)

      // Reset form
      setBankData({
        name: "",
        accountNumber: "",
        routingNumber: "",
        accountType: "",
        bankName: "",
        accountHolderName: "",
      })
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to add bank account")
    } finally {
      setIsLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Add Payment Method</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a debit card or bank account for deposits and withdrawals
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="card" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="card" className="text-white data-[state=active]:bg-purple-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Debit Card
            </TabsTrigger>
            <TabsTrigger value="bank" className="text-white data-[state=active]:bg-purple-600">
              <Building2 className="h-4 w-4 mr-2" />
              Bank Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card">
            <form onSubmit={handleAddCard} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName" className="text-white">
                  Card Name
                </Label>
                <Input
                  id="cardName"
                  name="name"
                  placeholder="My Debit Card"
                  value={cardData.name}
                  onChange={handleCardInputChange}
                  required
                  className="input-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-white">
                  Card Number
                </Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={handleCardInputChange}
                  maxLength={19}
                  required
                  className="input-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName" className="text-white">
                  Cardholder Name
                </Label>
                <Input
                  id="cardholderName"
                  name="cardholderName"
                  placeholder="John Doe"
                  value={cardData.cardholderName}
                  onChange={handleCardInputChange}
                  required
                  className="input-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth" className="text-white">
                    Month
                  </Label>
                  <Select
                    value={cardData.expiryMonth}
                    onValueChange={(value) => setCardData((prev) => ({ ...prev, expiryMonth: value }))}
                  >
                    <SelectTrigger className="select-white">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                          {month.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryYear" className="text-white">
                    Year
                  </Label>
                  <Select
                    value={cardData.expiryYear}
                    onValueChange={(value) => setCardData((prev) => ({ ...prev, expiryYear: value }))}
                  >
                    <SelectTrigger className="select-white">
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-white">
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={handleCardInputChange}
                    maxLength={4}
                    required
                    className="input-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Billing Address</h4>

                <div className="space-y-2">
                  <Label htmlFor="street" className="text-white">
                    Street Address
                  </Label>
                  <Input
                    id="street"
                    name="street"
                    placeholder="123 Main St"
                    value={cardData.street}
                    onChange={handleCardInputChange}
                    required
                    className="input-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="New York"
                      value={cardData.city}
                      onChange={handleCardInputChange}
                      required
                      className="input-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-white">
                      State
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="NY"
                      value={cardData.state}
                      onChange={handleCardInputChange}
                      required
                      className="input-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-white">
                    ZIP Code
                  </Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    placeholder="10001"
                    value={cardData.zipCode}
                    onChange={handleCardInputChange}
                    required
                    className="input-white"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full btn-accent text-white">
                {isLoading ? "Adding Card..." : "Add Debit Card"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="bank">
            <form onSubmit={handleAddBank} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-white">
                  Account Name
                </Label>
                <Input
                  id="bankName"
                  name="name"
                  placeholder="My Checking Account"
                  value={bankData.name}
                  onChange={handleBankInputChange}
                  required
                  className="input-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-white">
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  name="bankName"
                  placeholder="Chase Bank"
                  value={bankData.bankName}
                  onChange={handleBankInputChange}
                  required
                  className="input-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolderName" className="text-white">
                  Account Holder Name
                </Label>
                <Input
                  id="accountHolderName"
                  name="accountHolderName"
                  placeholder="John Doe"
                  value={bankData.accountHolderName}
                  onChange={handleBankInputChange}
                  required
                  className="input-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType" className="text-white">
                  Account Type
                </Label>
                <Select
                  value={bankData.accountType}
                  onValueChange={(value) => setBankData((prev) => ({ ...prev, accountType: value }))}
                >
                  <SelectTrigger className="select-white">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="routingNumber" className="text-white">
                  Routing Number
                </Label>
                <Input
                  id="routingNumber"
                  name="routingNumber"
                  placeholder="123456789"
                  value={bankData.routingNumber}
                  onChange={handleBankInputChange}
                  maxLength={9}
                  required
                  className="input-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-white">
                  Account Number
                </Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  placeholder="1234567890"
                  value={bankData.accountNumber}
                  onChange={handleBankInputChange}
                  required
                  className="input-white"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full btn-accent text-white">
                {isLoading ? "Adding Account..." : "Add Bank Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
