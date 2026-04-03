// 3-Pocket Budgeting System Types

export type PocketType = 'basic_needs' | 'investment' | 'self_reward'

export type PocketCategory =
  // Basic Needs sub-categories
  | 'rent'
  | 'groceries'
  | 'gas'
  | 'debt_payment'
  | 'insurance'
  | 'utilities'
  | 'health'
  // Investment sub-categories
  | 'brokerage'
  | 'savings'
  | 'retirement'
  // Self Reward sub-categories
  | 'shopping'
  | 'dining'
  | 'entertainment'
  | 'travel'
  // Fallback
  | 'other'

export interface PocketConfig {
  type: PocketType
  label: string
  percentage: number
  color: string
  icon: string
  categories: PocketCategory[]
}

export interface PocketSummary {
  type: PocketType
  label: string
  percentage: number
  budgetAmount: number
  spentAmount: number
  remainingAmount: number
  color: string
  icon: string
  transactions: PocketTransaction[]
}

export interface PocketTransaction {
  transactionId: string
  name: string
  amount: number
  date: string
  merchantName?: string | null
  pocket: PocketType
  pocketCategory: PocketCategory
  isOverride?: boolean
  accountId: string
  accountName?: string
  institutionName?: string
  isZelle?: boolean
}

export interface MerchantCategoryMapping {
  merchantName: string
  pocket: PocketType
  pocketCategory: PocketCategory
  createdAt: string
  source: 'user' | 'system'
}

export interface MonthlyBudgetBreakdown {
  month: string // YYYY-MM
  monthlyIncome: number
  pockets: PocketSummary[]
  totalSpent: number
  totalRemaining: number
  uncategorized: PocketTransaction[]
}

// Firestore document shape for user overrides
export interface TransactionOverride {
  transactionId: string
  pocket: PocketType
  pocketCategory: PocketCategory
  overriddenAt: string
}
