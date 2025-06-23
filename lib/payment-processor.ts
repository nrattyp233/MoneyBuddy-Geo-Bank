export interface PaymentMethod {
  id: string
  type: "debit_card" | "bank_account"
  name: string
  isPrimary: boolean
  isActive: boolean
  createdAt: string
  details: DebitCardDetails | BankAccountDetails
}

export interface DebitCardDetails {
  last4: string
  cardholderName: string
  expiryMonth: number
  expiryYear: number
  brand: "visa" | "mastercard" | "amex" | "discover"
  billingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface BankAccountDetails {
  last4: string
  routingNumber: string
  accountType: "checking" | "savings"
  bankName: string
  accountHolderName: string
}

export interface ExternalTransaction {
  id: string
  userId: string
  paymentMethodId: string
  transactionType: "deposit" | "withdrawal"
  amount: number
  feeAmount: number
  netAmount: number
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  description?: string
  externalReference?: string
  initiatedAt: string
  completedAt?: string
  failedAt?: string
  failureReason?: string
}

export interface TransferRequest {
  fromUserId: string
  toUserId: string
  amount: number
  description?: string
  restrictions?: {
    geofence?: {
      center: { lat: number; lng: number }
      radius: number
    }
    timeWindow?: {
      startTime: string
      endTime: string
    }
  }
}

class PaymentProcessor {
  private static instance: PaymentProcessor

  static getInstance(): PaymentProcessor {
    if (!PaymentProcessor.instance) {
      PaymentProcessor.instance = new PaymentProcessor()
    }
    return PaymentProcessor.instance
  }

  // Add debit card
  async addDebitCard(
    userId: string,
    cardData: {
      name: string
      cardNumber: string
      cardholderName: string
      expiryMonth: number
      expiryYear: number
      cvv: string
      billingAddress: DebitCardDetails["billingAddress"]
    },
  ): Promise<PaymentMethod> {
    try {
      // In a real app, this would integrate with Stripe/payment processor
      // For demo, we'll simulate the process

      // Validate card number (basic Luhn algorithm check)
      if (!this.validateCardNumber(cardData.cardNumber)) {
        throw new Error("Invalid card number")
      }

      // Detect card brand
      const brand = this.detectCardBrand(cardData.cardNumber)
      const last4 = cardData.cardNumber.slice(-4)

      // Simulate API call to payment processor
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create payment method record
      const paymentMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: "debit_card",
        name: cardData.name,
        isPrimary: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        details: {
          last4,
          cardholderName: cardData.cardholderName,
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          brand,
          billingAddress: cardData.billingAddress,
        },
      }

      // Store in localStorage for demo
      this.savePaymentMethod(userId, paymentMethod)

      return paymentMethod
    } catch (error) {
      console.error("Failed to add debit card:", error)
      throw error
    }
  }

  // Add bank account
  async addBankAccount(
    userId: string,
    accountData: {
      name: string
      accountNumber: string
      routingNumber: string
      accountType: "checking" | "savings"
      bankName: string
      accountHolderName: string
    },
  ): Promise<PaymentMethod> {
    try {
      // Validate routing number
      if (!this.validateRoutingNumber(accountData.routingNumber)) {
        throw new Error("Invalid routing number")
      }

      const last4 = accountData.accountNumber.slice(-4)

      // Simulate API call to Plaid/bank verification
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const paymentMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: "bank_account",
        name: accountData.name,
        isPrimary: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        details: {
          last4,
          routingNumber: accountData.routingNumber,
          accountType: accountData.accountType,
          bankName: accountData.bankName,
          accountHolderName: accountData.accountHolderName,
        },
      }

      this.savePaymentMethod(userId, paymentMethod)

      return paymentMethod
    } catch (error) {
      console.error("Failed to add bank account:", error)
      throw error
    }
  }

  // Process deposit
  async processDeposit(
    userId: string,
    paymentMethodId: string,
    amount: number,
    description?: string,
  ): Promise<ExternalTransaction> {
    try {
      const transaction: ExternalTransaction = {
        id: Date.now().toString(),
        userId,
        paymentMethodId,
        transactionType: "deposit",
        amount,
        feeAmount: 0, // Deposits are free
        netAmount: amount,
        status: "pending",
        description,
        initiatedAt: new Date().toISOString(),
      }

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update status to completed
      transaction.status = "completed"
      transaction.completedAt = new Date().toISOString()

      // Update wallet balance
      this.updateWalletBalance(userId, amount)

      // Store transaction
      this.saveExternalTransaction(userId, transaction)

      return transaction
    } catch (error) {
      console.error("Failed to process deposit:", error)
      throw error
    }
  }

  // Process withdrawal
  async processWithdrawal(
    userId: string,
    paymentMethodId: string,
    amount: number,
    description?: string,
  ): Promise<ExternalTransaction> {
    try {
      const feeAmount = 2.5 // $2.50 withdrawal fee
      const totalDeduction = amount + feeAmount

      // Check wallet balance
      const currentBalance = this.getWalletBalance(userId)
      if (currentBalance < totalDeduction) {
        throw new Error(
          `Insufficient balance. Need $${totalDeduction.toFixed(2)} but only have $${currentBalance.toFixed(2)}`,
        )
      }

      const transaction: ExternalTransaction = {
        id: Date.now().toString(),
        userId,
        paymentMethodId,
        transactionType: "withdrawal",
        amount,
        feeAmount,
        netAmount: amount,
        status: "pending",
        description,
        initiatedAt: new Date().toISOString(),
      }

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Update status to completed
      transaction.status = "completed"
      transaction.completedAt = new Date().toISOString()

      // Update wallet balance (deduct amount + fee)
      this.updateWalletBalance(userId, -totalDeduction)

      // Store transaction
      this.saveExternalTransaction(userId, transaction)

      return transaction
    } catch (error) {
      console.error("Failed to process withdrawal:", error)
      throw error
    }
  }

  // Process internal transfer
  async processTransfer(transferData: TransferRequest): Promise<string> {
    try {
      const { fromUserId, toUserId, amount, description, restrictions } = transferData

      const transactionFee = amount * 0.02 // 2% fee
      const totalDeduction = amount + transactionFee

      // Check sender balance
      const senderBalance = this.getWalletBalance(fromUserId)
      if (senderBalance < totalDeduction) {
        throw new Error(
          `Insufficient balance. Need $${totalDeduction.toFixed(2)} but only have $${senderBalance.toFixed(2)}`,
        )
      }

      // Create transaction record
      const transactionId = Date.now().toString()

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update balances
      this.updateWalletBalance(fromUserId, -totalDeduction)
      this.updateWalletBalance(toUserId, amount)

      // Store transaction
      const transaction = {
        id: transactionId,
        senderId: fromUserId,
        receiverId: toUserId,
        amount,
        transactionFee,
        netAmount: amount,
        description,
        restrictions,
        status: "completed",
        createdAt: new Date().toISOString(),
      }

      this.saveInternalTransaction(fromUserId, transaction)

      return transactionId
    } catch (error) {
      console.error("Failed to process transfer:", error)
      throw error
    }
  }

  // Get payment methods for user
  getPaymentMethods(userId: string): PaymentMethod[] {
    try {
      const stored = localStorage.getItem(`paymentMethods_${userId}`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to get payment methods:", error)
      return []
    }
  }

  // Get external transactions for user
  getExternalTransactions(userId: string): ExternalTransaction[] {
    try {
      const stored = localStorage.getItem(`externalTransactions_${userId}`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to get external transactions:", error)
      return []
    }
  }

  // Remove payment method
  async removePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    try {
      const methods = this.getPaymentMethods(userId)
      const updatedMethods = methods.filter((method) => method.id !== paymentMethodId)
      localStorage.setItem(`paymentMethods_${userId}`, JSON.stringify(updatedMethods))
    } catch (error) {
      console.error("Failed to remove payment method:", error)
      throw error
    }
  }

  // Set primary payment method
  async setPrimaryPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    try {
      const methods = this.getPaymentMethods(userId)
      const method = methods.find((m) => m.id === paymentMethodId)

      if (!method) {
        throw new Error("Payment method not found")
      }

      // Remove primary status from other methods of same type
      methods.forEach((m) => {
        if (m.type === method.type) {
          m.isPrimary = false
        }
      })

      // Set this method as primary
      method.isPrimary = true

      localStorage.setItem(`paymentMethods_${userId}`, JSON.stringify(methods))
    } catch (error) {
      console.error("Failed to set primary payment method:", error)
      throw error
    }
  }

  // Private helper methods
  private validateCardNumber(cardNumber: string): boolean {
    // Basic Luhn algorithm implementation
    const digits = cardNumber.replace(/\D/g, "")
    let sum = 0
    let isEven = false

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(digits[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  private detectCardBrand(cardNumber: string): DebitCardDetails["brand"] {
    const digits = cardNumber.replace(/\D/g, "")

    if (digits.startsWith("4")) return "visa"
    if (digits.startsWith("5") || digits.startsWith("2")) return "mastercard"
    if (digits.startsWith("3")) return "amex"
    if (digits.startsWith("6")) return "discover"

    return "visa" // default
  }

  private validateRoutingNumber(routingNumber: string): boolean {
    // Basic routing number validation (9 digits)
    return /^\d{9}$/.test(routingNumber)
  }

  private savePaymentMethod(userId: string, paymentMethod: PaymentMethod): void {
    const existing = this.getPaymentMethods(userId)
    existing.push(paymentMethod)
    localStorage.setItem(`paymentMethods_${userId}`, JSON.stringify(existing))
  }

  private saveExternalTransaction(userId: string, transaction: ExternalTransaction): void {
    const existing = this.getExternalTransactions(userId)
    existing.unshift(transaction) // Add to beginning
    localStorage.setItem(`externalTransactions_${userId}`, JSON.stringify(existing))
  }

  private saveInternalTransaction(userId: string, transaction: any): void {
    const existing = JSON.parse(localStorage.getItem(`internalTransactions_${userId}`) || "[]")
    existing.unshift(transaction)
    localStorage.setItem(`internalTransactions_${userId}`, JSON.stringify(existing))
  }

  private getWalletBalance(userId: string): number {
    const stored = localStorage.getItem(`walletBalance_${userId}`)
    return stored ? Number.parseFloat(stored) : 15420.5 // Default demo balance
  }

  private updateWalletBalance(userId: string, amount: number): void {
    const currentBalance = this.getWalletBalance(userId)
    const newBalance = currentBalance + amount
    localStorage.setItem(`walletBalance_${userId}`, newBalance.toString())
  }
}

export default PaymentProcessor.getInstance()
