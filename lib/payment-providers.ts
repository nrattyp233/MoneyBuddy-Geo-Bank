// Payment Provider Interface and Implementation Options
// This allows Money Buddy to support multiple payment methods

export interface PaymentProvider {
  name: string
  type: 'traditional' | 'crypto' | 'ach' | 'bank'
  fees: {
    deposit: number | string
    withdrawal: number | string
    transfer: number | string
  }
  processingTime: {
    deposit: string
    withdrawal: string
    transfer: string
  }
  minimumAmount: number
  maximumAmount: number
  supportedCurrencies: string[]
  available: boolean
}

export const paymentProviders: Record<string, PaymentProvider> = {
  square: {
    name: 'Square',
    type: 'traditional',
    fees: {
      deposit: '2.9% + $0.30',
      withdrawal: '$1.50',
      transfer: '2.9% + $0.30'
    },
    processingTime: {
      deposit: 'Instant',
      withdrawal: '1-2 business days',
      transfer: 'Instant'
    },
    minimumAmount: 1,
    maximumAmount: 10000,
    supportedCurrencies: ['USD'],
    available: true
  },
  
  plaid_ach: {
    name: 'ACH via Plaid',
    type: 'ach',
    fees: {
      deposit: '$0.25',
      withdrawal: '$0.25',
      transfer: '$0.25'
    },
    processingTime: {
      deposit: '1-3 business days',
      withdrawal: '1-3 business days',
      transfer: '1-3 business days'
    },
    minimumAmount: 1,
    maximumAmount: 50000,
    supportedCurrencies: ['USD'],
    available: false // Requires Plaid setup
  },
  
  dwolla: {
    name: 'Dwolla',
    type: 'ach',
    fees: {
      deposit: '$0.25',
      withdrawal: '$0.25',
      transfer: '$0.25'
    },
    processingTime: {
      deposit: 'Same day or next day',
      withdrawal: 'Same day or next day',
      transfer: 'Same day or next day'
    },
    minimumAmount: 0.01,
    maximumAmount: 5000000,
    supportedCurrencies: ['USD'],
    available: false // Requires Dwolla setup
  },
  
  usdc_crypto: {
    name: 'USDC (Polygon)',
    type: 'crypto',
    fees: {
      deposit: '~$0.01',
      withdrawal: '~$0.01',
      transfer: '~$0.01'
    },
    processingTime: {
      deposit: '1-2 minutes',
      withdrawal: '1-2 minutes',
      transfer: 'Instant'
    },
    minimumAmount: 0.01,
    maximumAmount: 1000000,
    supportedCurrencies: ['USD', 'USDC'],
    available: false // Requires crypto wallet integration
  },
  
  apple_pay: {
    name: 'Apple Pay',
    type: 'traditional',
    fees: {
      deposit: '2.9% + $0.30',
      withdrawal: 'N/A',
      transfer: '2.9% + $0.30'
    },
    processingTime: {
      deposit: 'Instant',
      withdrawal: 'N/A',
      transfer: 'Instant'
    },
    minimumAmount: 1,
    maximumAmount: 10000,
    supportedCurrencies: ['USD'],
    available: false // Requires Apple Pay setup
  },
  
  zelle: {
    name: 'Zelle',
    type: 'bank',
    fees: {
      deposit: 'Free',
      withdrawal: 'Free',
      transfer: 'Free'
    },
    processingTime: {
      deposit: 'Minutes',
      withdrawal: 'Minutes',
      transfer: 'Minutes'
    },
    minimumAmount: 1,
    maximumAmount: 2500,
    supportedCurrencies: ['USD'],
    available: false // Requires bank partnership
  }
}

export class PaymentService {
  private provider: string
  
  constructor(provider: string = 'square') {
    this.provider = provider
  }
  
  async processDeposit(amount: number, paymentMethod: any): Promise<any> {
    switch (this.provider) {
      case 'square':
        return this.processSquareDeposit(amount, paymentMethod)
      case 'plaid_ach':
        return this.processPlaidDeposit(amount, paymentMethod)
      case 'usdc_crypto':
        return this.processCryptoDeposit(amount, paymentMethod)
      default:
        throw new Error(`Unsupported payment provider: ${this.provider}`)
    }
  }
  
  async processWithdrawal(amount: number, destination: any): Promise<any> {
    switch (this.provider) {
      case 'square':
        return this.processSquareWithdrawal(amount, destination)
      case 'plaid_ach':
        return this.processPlaidWithdrawal(amount, destination)
      case 'usdc_crypto':
        return this.processCryptoWithdrawal(amount, destination)
      default:
        throw new Error(`Unsupported payment provider: ${this.provider}`)
    }
  }
  
  private async processSquareDeposit(amount: number, paymentMethod: any) {
    // Your existing Square implementation
    return { success: true, provider: 'square' }
  }
  
  private async processPlaidDeposit(amount: number, paymentMethod: any) {
    // Plaid ACH implementation
    return { success: true, provider: 'plaid' }
  }
  
  private async processCryptoDeposit(amount: number, paymentMethod: any) {
    // Crypto implementation
    return { success: true, provider: 'crypto' }
  }
  
  private async processSquareWithdrawal(amount: number, destination: any) {
    // Your existing Square implementation
    return { success: true, provider: 'square' }
  }
  
  private async processPlaidWithdrawal(amount: number, destination: any) {
    // Plaid ACH implementation
    return { success: true, provider: 'plaid' }
  }
  
  private async processCryptoWithdrawal(amount: number, destination: any) {
    // Crypto implementation
    return { success: true, provider: 'crypto' }
  }
}

// Utility functions
export function getAvailableProviders(): PaymentProvider[] {
  return Object.values(paymentProviders).filter(provider => provider.available)
}

export function getBestProviderForAmount(amount: number, type: 'deposit' | 'withdrawal'): string {
  const available = getAvailableProviders()
  
  // For small amounts, prefer low-fee options
  if (amount < 100) {
    return available.find(p => p.type === 'ach' || p.type === 'crypto')?.name.toLowerCase().replace(/\s+/g, '_') || 'square'
  }
  
  // For large amounts, prefer traditional processors
  return 'square'
}

export function calculateFees(provider: string, amount: number, type: 'deposit' | 'withdrawal' | 'transfer'): number {
  const providerConfig = paymentProviders[provider]
  if (!providerConfig) return 0
  
  const feeConfig = providerConfig.fees[type]
  
  if (typeof feeConfig === 'string') {
    if (feeConfig.includes('%')) {
      // Parse percentage + fixed fee (e.g., "2.9% + $0.30")
      const parts = feeConfig.split('+')
      const percentage = parseFloat(parts[0]) / 100
      const fixed = parts[1] ? parseFloat(parts[1].replace(/[$\s]/g, '')) : 0
      return (amount * percentage) + fixed
    } else if (feeConfig.toLowerCase() === 'free') {
      return 0
    } else {
      // Fixed fee (e.g., "$0.25")
      return parseFloat(feeConfig.replace(/[$\s]/g, ''))
    }
  }
  
  return typeof feeConfig === 'number' ? feeConfig : 0
}
