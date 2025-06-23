export interface FeeCalculation {
  originalAmount: number
  transactionFee: number
  totalDeducted: number
  recipientReceives: number
  adminReceives: number
}

export function calculateTransactionFees(amount: number): FeeCalculation {
  const transactionFee = amount * 0.02 // 2% fee
  const totalDeducted = amount + transactionFee
  const recipientReceives = amount
  const adminReceives = transactionFee

  return {
    originalAmount: amount,
    transactionFee,
    totalDeducted,
    recipientReceives,
    adminReceives,
  }
}

export function calculateEarlyWithdrawalFee(
  lockedAmount: number,
  currentValue: number,
): {
  penaltyFee: number
  netAmount: number
  adminReceives: number
} {
  const penaltyFee = lockedAmount * 0.05 // 5% penalty on original locked amount
  const netAmount = currentValue - penaltyFee
  const adminReceives = penaltyFee

  return {
    penaltyFee,
    netAmount,
    adminReceives,
  }
}

export interface LockingOption {
  months: number
  label: string
  interestRate: number
  description: string
}

export const LOCKING_OPTIONS: LockingOption[] = [
  { months: 3, label: "3 Months", interestRate: 0.015, description: "Short-term savings" },
  { months: 6, label: "6 Months", interestRate: 0.02, description: "Medium-term growth" },
  { months: 9, label: "9 Months", interestRate: 0.025, description: "Extended savings" },
  { months: 12, label: "12 Months", interestRate: 0.03, description: "Annual commitment" },
  { months: 18, label: "18 Months", interestRate: 0.035, description: "Long-term growth" },
  { months: 24, label: "24 Months", interestRate: 0.04, description: "Maximum returns" },
]

export function calculateProjectedEarnings(amount: number, months: number, annualRate: number): number {
  return (amount * annualRate * months) / 12
}
