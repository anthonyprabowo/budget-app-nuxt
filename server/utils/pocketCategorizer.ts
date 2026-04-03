// server/utils/pocketCategorizer.ts
// Rule-based transaction categorization for the 3-pocket budgeting system

import type { PocketType, PocketCategory, PocketConfig } from '../../app/types/pocket'

// ─── Pocket Configurations ────────────────────────────────────────────
export const POCKET_CONFIGS: PocketConfig[] = [
  {
    type: 'basic_needs',
    label: 'Basic Needs',
    percentage: 50,
    color: '#22c55e',
    icon: 'mdi-home-outline',
    categories: ['rent', 'groceries', 'gas', 'debt_payment', 'insurance', 'utilities', 'health'],
  },
  {
    type: 'investment',
    label: 'Investment',
    percentage: 30,
    color: '#3b82f6',
    icon: 'mdi-chart-line',
    categories: ['brokerage', 'savings', 'retirement'],
  },
  {
    type: 'self_reward',
    label: 'Self Reward',
    percentage: 20,
    color: '#a855f7',
    icon: 'mdi-gift-outline',
    categories: ['shopping', 'dining', 'entertainment', 'travel'],
  },
]

// ─── Merchant → Category Rules ────────────────────────────────────────
// Lowercase merchant name / keyword → { pocket, category }

interface CategoryRule {
  pocket: PocketType
  category: PocketCategory
}

// Exact or partial merchant name matches (checked with .includes())
const MERCHANT_RULES: Record<string, CategoryRule> = {
  // ── Rent / Housing ──
  'zelle': { pocket: 'basic_needs', category: 'rent' },

  // ── Groceries / Food ──
  'trader joe': { pocket: 'basic_needs', category: 'groceries' },
  'whole foods': { pocket: 'basic_needs', category: 'groceries' },
  'walmart': { pocket: 'basic_needs', category: 'groceries' },
  'target': { pocket: 'basic_needs', category: 'groceries' },
  'costco': { pocket: 'basic_needs', category: 'groceries' },
  'safeway': { pocket: 'basic_needs', category: 'groceries' },
  'kroger': { pocket: 'basic_needs', category: 'groceries' },
  'aldi': { pocket: 'basic_needs', category: 'groceries' },
  'publix': { pocket: 'basic_needs', category: 'groceries' },
  'h-e-b': { pocket: 'basic_needs', category: 'groceries' },
  'grocery': { pocket: 'basic_needs', category: 'groceries' },
  'food lion': { pocket: 'basic_needs', category: 'groceries' },
  'stop & shop': { pocket: 'basic_needs', category: 'groceries' },
  'sprouts': { pocket: 'basic_needs', category: 'groceries' },

  // ── Gas / Fuel ──
  'shell': { pocket: 'basic_needs', category: 'gas' },
  'chevron': { pocket: 'basic_needs', category: 'gas' },
  'exxon': { pocket: 'basic_needs', category: 'gas' },
  'bp ': { pocket: 'basic_needs', category: 'gas' },
  'mobil': { pocket: 'basic_needs', category: 'gas' },
  'sunoco': { pocket: 'basic_needs', category: 'gas' },
  'speedway': { pocket: 'basic_needs', category: 'gas' },
  'citgo': { pocket: 'basic_needs', category: 'gas' },
  'wawa': { pocket: 'basic_needs', category: 'gas' },
  'circle k': { pocket: 'basic_needs', category: 'gas' },
  'gas station': { pocket: 'basic_needs', category: 'gas' },
  'fuel': { pocket: 'basic_needs', category: 'gas' },

  // ── Debt Payments ──
  'chase card': { pocket: 'basic_needs', category: 'debt_payment' },
  'chase credit': { pocket: 'basic_needs', category: 'debt_payment' },
  'apple card': { pocket: 'basic_needs', category: 'debt_payment' },
  'apple cash': { pocket: 'basic_needs', category: 'debt_payment' },
  'best buy': { pocket: 'basic_needs', category: 'debt_payment' },
  'citibank': { pocket: 'basic_needs', category: 'debt_payment' },
  'capital one': { pocket: 'basic_needs', category: 'debt_payment' },
  'payment thank you': { pocket: 'basic_needs', category: 'debt_payment' },
  'autopay': { pocket: 'basic_needs', category: 'debt_payment' },
  'minimum payment': { pocket: 'basic_needs', category: 'debt_payment' },
  'credit card payment': { pocket: 'basic_needs', category: 'debt_payment' },

  // ── Insurance ──
  'geico': { pocket: 'basic_needs', category: 'insurance' },
  'state farm': { pocket: 'basic_needs', category: 'insurance' },
  'allstate': { pocket: 'basic_needs', category: 'insurance' },
  'progressive': { pocket: 'basic_needs', category: 'insurance' },
  'liberty mutual': { pocket: 'basic_needs', category: 'insurance' },
  'insurance': { pocket: 'basic_needs', category: 'insurance' },

  // ── Utilities ──
  'electric': { pocket: 'basic_needs', category: 'utilities' },
  'power company': { pocket: 'basic_needs', category: 'utilities' },
  'water utility': { pocket: 'basic_needs', category: 'utilities' },
  'gas utility': { pocket: 'basic_needs', category: 'utilities' },
  'internet': { pocket: 'basic_needs', category: 'utilities' },
  'comcast': { pocket: 'basic_needs', category: 'utilities' },
  'xfinity': { pocket: 'basic_needs', category: 'utilities' },
  'at&t': { pocket: 'basic_needs', category: 'utilities' },
  'verizon': { pocket: 'basic_needs', category: 'utilities' },
  't-mobile': { pocket: 'basic_needs', category: 'utilities' },
  'spectrum': { pocket: 'basic_needs', category: 'utilities' },

  // ── Health ──
  'pharmacy': { pocket: 'basic_needs', category: 'health' },
  'cvs': { pocket: 'basic_needs', category: 'health' },
  'walgreens': { pocket: 'basic_needs', category: 'health' },
  'hospital': { pocket: 'basic_needs', category: 'health' },
  'clinic': { pocket: 'basic_needs', category: 'health' },
  'urgent care': { pocket: 'basic_needs', category: 'health' },
  'dental': { pocket: 'basic_needs', category: 'health' },
  'doctor': { pocket: 'basic_needs', category: 'health' },

  // ── Investment ──
  'vanguard': { pocket: 'investment', category: 'brokerage' },
  'fidelity': { pocket: 'investment', category: 'brokerage' },
  'schwab': { pocket: 'investment', category: 'brokerage' },
  'robinhood': { pocket: 'investment', category: 'brokerage' },
  'e*trade': { pocket: 'investment', category: 'brokerage' },
  'td ameritrade': { pocket: 'investment', category: 'brokerage' },
  'webull': { pocket: 'investment', category: 'brokerage' },
  'coinbase': { pocket: 'investment', category: 'brokerage' },
  'brokerage': { pocket: 'investment', category: 'brokerage' },
  'investment': { pocket: 'investment', category: 'brokerage' },
  'savings transfer': { pocket: 'investment', category: 'savings' },
  'high yield': { pocket: 'investment', category: 'savings' },
  '401k': { pocket: 'investment', category: 'retirement' },
  'ira': { pocket: 'investment', category: 'retirement' },
  'retirement': { pocket: 'investment', category: 'retirement' },

  // ── Self Reward: Shopping ──
  'amazon': { pocket: 'self_reward', category: 'shopping' },
  'nike': { pocket: 'self_reward', category: 'shopping' },
  'adidas': { pocket: 'self_reward', category: 'shopping' },
  'nordstrom': { pocket: 'self_reward', category: 'shopping' },
  'macy': { pocket: 'self_reward', category: 'shopping' },
  'zara': { pocket: 'self_reward', category: 'shopping' },
  'h&m': { pocket: 'self_reward', category: 'shopping' },
  'apple store': { pocket: 'self_reward', category: 'shopping' },
  'apple.com': { pocket: 'self_reward', category: 'shopping' },

  // ── Self Reward: Dining ──
  'restaurant': { pocket: 'self_reward', category: 'dining' },
  'mcdonald': { pocket: 'self_reward', category: 'dining' },
  'starbucks': { pocket: 'self_reward', category: 'dining' },
  'chipotle': { pocket: 'self_reward', category: 'dining' },
  'chick-fil-a': { pocket: 'self_reward', category: 'dining' },
  'subway': { pocket: 'self_reward', category: 'dining' },
  'taco bell': { pocket: 'self_reward', category: 'dining' },
  'wendy': { pocket: 'self_reward', category: 'dining' },
  'burger king': { pocket: 'self_reward', category: 'dining' },
  'domino': { pocket: 'self_reward', category: 'dining' },
  'pizza': { pocket: 'self_reward', category: 'dining' },
  'doordash': { pocket: 'self_reward', category: 'dining' },
  'uber eats': { pocket: 'self_reward', category: 'dining' },
  'grubhub': { pocket: 'self_reward', category: 'dining' },
  'postmates': { pocket: 'self_reward', category: 'dining' },
  'panera': { pocket: 'self_reward', category: 'dining' },
  'olive garden': { pocket: 'self_reward', category: 'dining' },
  'dine': { pocket: 'self_reward', category: 'dining' },
  'cafe': { pocket: 'self_reward', category: 'dining' },
  'coffee': { pocket: 'self_reward', category: 'dining' },
  'dunkin': { pocket: 'self_reward', category: 'dining' },

  // ── Self Reward: Entertainment ──
  'netflix': { pocket: 'self_reward', category: 'entertainment' },
  'spotify': { pocket: 'self_reward', category: 'entertainment' },
  'hulu': { pocket: 'self_reward', category: 'entertainment' },
  'disney+': { pocket: 'self_reward', category: 'entertainment' },
  'hbo': { pocket: 'self_reward', category: 'entertainment' },
  'youtube premium': { pocket: 'self_reward', category: 'entertainment' },
  'playstation': { pocket: 'self_reward', category: 'entertainment' },
  'xbox': { pocket: 'self_reward', category: 'entertainment' },
  'steam': { pocket: 'self_reward', category: 'entertainment' },
  'movie': { pocket: 'self_reward', category: 'entertainment' },
  'cinema': { pocket: 'self_reward', category: 'entertainment' },
  'amc': { pocket: 'self_reward', category: 'entertainment' },
  'concert': { pocket: 'self_reward', category: 'entertainment' },
  'ticketmaster': { pocket: 'self_reward', category: 'entertainment' },
  'apple music': { pocket: 'self_reward', category: 'entertainment' },
  'audible': { pocket: 'self_reward', category: 'entertainment' },
  'gym': { pocket: 'self_reward', category: 'entertainment' },
  'fitness': { pocket: 'self_reward', category: 'entertainment' },

  // ── Self Reward: Travel ──
  'uber': { pocket: 'self_reward', category: 'travel' },
  'lyft': { pocket: 'self_reward', category: 'travel' },
  'airbnb': { pocket: 'self_reward', category: 'travel' },
  'hotel': { pocket: 'self_reward', category: 'travel' },
  'marriott': { pocket: 'self_reward', category: 'travel' },
  'hilton': { pocket: 'self_reward', category: 'travel' },
  'airline': { pocket: 'self_reward', category: 'travel' },
  'delta': { pocket: 'self_reward', category: 'travel' },
  'united airlines': { pocket: 'self_reward', category: 'travel' },
  'southwest': { pocket: 'self_reward', category: 'travel' },
  'jetblue': { pocket: 'self_reward', category: 'travel' },
}

// ─── Plaid Category → Pocket Mapping ─────────────────────────────────
// Maps Plaid's personal_finance_category.primary to pocket + category

const PLAID_CATEGORY_MAP: Record<string, CategoryRule> = {
  'FOOD_AND_DRINK': { pocket: 'self_reward', category: 'dining' },
  'GROCERIES': { pocket: 'basic_needs', category: 'groceries' },
  'SHOPPING': { pocket: 'self_reward', category: 'shopping' },
  'HEALTHCARE': { pocket: 'basic_needs', category: 'health' },
  'ENTERTAINMENT': { pocket: 'self_reward', category: 'entertainment' },
  'TRANSPORTATION': { pocket: 'basic_needs', category: 'gas' },
  'UTILITIES': { pocket: 'basic_needs', category: 'utilities' },
  'RENT_AND_UTILITIES': { pocket: 'basic_needs', category: 'rent' },
  'LOAN_PAYMENTS': { pocket: 'basic_needs', category: 'debt_payment' },
  'TRANSFER_OUT': { pocket: 'investment', category: 'savings' },
  'PERSONAL_CARE': { pocket: 'self_reward', category: 'shopping' },
  'TRAVEL': { pocket: 'self_reward', category: 'travel' },
  'INSURANCE': { pocket: 'basic_needs', category: 'insurance' },
}

// Plaid detailed categories for more precise matching
const PLAID_DETAILED_MAP: Record<string, CategoryRule> = {
  'FOOD_AND_DRINK_GROCERIES': { pocket: 'basic_needs', category: 'groceries' },
  'FOOD_AND_DRINK_RESTAURANT': { pocket: 'self_reward', category: 'dining' },
  'FOOD_AND_DRINK_FAST_FOOD': { pocket: 'self_reward', category: 'dining' },
  'FOOD_AND_DRINK_COFFEE': { pocket: 'self_reward', category: 'dining' },
  'TRANSPORTATION_GAS': { pocket: 'basic_needs', category: 'gas' },
  'TRANSPORTATION_PARKING': { pocket: 'basic_needs', category: 'gas' },
  'TRANSPORTATION_RIDE_SHARE': { pocket: 'self_reward', category: 'travel' },
  'TRANSFER_OUT_INVESTMENT': { pocket: 'investment', category: 'brokerage' },
  'TRANSFER_OUT_SAVINGS': { pocket: 'investment', category: 'savings' },
  'RENT_AND_UTILITIES_RENT': { pocket: 'basic_needs', category: 'rent' },
  'RENT_AND_UTILITIES_ELECTRIC': { pocket: 'basic_needs', category: 'utilities' },
  'RENT_AND_UTILITIES_GAS': { pocket: 'basic_needs', category: 'utilities' },
  'RENT_AND_UTILITIES_INTERNET': { pocket: 'basic_needs', category: 'utilities' },
  'RENT_AND_UTILITIES_PHONE': { pocket: 'basic_needs', category: 'utilities' },
  'RENT_AND_UTILITIES_WATER': { pocket: 'basic_needs', category: 'utilities' },
  'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT': { pocket: 'basic_needs', category: 'debt_payment' },
  'LOAN_PAYMENTS_CAR_PAYMENT': { pocket: 'basic_needs', category: 'debt_payment' },
  'LOAN_PAYMENTS_STUDENT_LOAN': { pocket: 'basic_needs', category: 'debt_payment' },
  'INSURANCE_AUTO': { pocket: 'basic_needs', category: 'insurance' },
  'INSURANCE_HEALTH': { pocket: 'basic_needs', category: 'insurance' },
}

// ─── Keyword-based fallbacks ──────────────────────────────────────────
const KEYWORD_RULES: Array<{ keywords: string[]; rule: CategoryRule }> = [
  { keywords: ['payment', 'pymt', 'pay'], rule: { pocket: 'basic_needs', category: 'debt_payment' } },
  { keywords: ['gas', 'fuel', 'petrol'], rule: { pocket: 'basic_needs', category: 'gas' } },
  { keywords: ['grocery', 'groceries', 'supermarket', 'market'], rule: { pocket: 'basic_needs', category: 'groceries' } },
  { keywords: ['rent', 'lease', 'landlord'], rule: { pocket: 'basic_needs', category: 'rent' } },
  { keywords: ['electric', 'water bill', 'sewer', 'trash'], rule: { pocket: 'basic_needs', category: 'utilities' } },
  { keywords: ['invest', 'brokerage', 'stock', 'etf', 'mutual fund'], rule: { pocket: 'investment', category: 'brokerage' } },
  { keywords: ['savings', 'save'], rule: { pocket: 'investment', category: 'savings' } },
]

export interface CategorizationResult {
  pocket: PocketType
  pocketCategory: PocketCategory
  confidence: 'high' | 'medium' | 'low'
  matchedBy: 'user_override' | 'merchant_mapping' | 'merchant_rule' | 'plaid_detailed' | 'plaid_primary' | 'keyword' | 'fallback'
}

/**
 * Categorize a transaction into a pocket and sub-category.
 *
 * Priority order:
 * 1. User overrides (transactionId-level)
 * 2. Merchant-to-category mappings (user-trained or system)
 * 3. Merchant name rules
 * 4. Plaid detailed category
 * 5. Plaid primary category
 * 6. Keyword-based fallback
 * 7. "other" fallback
 */
export function categorizeTransaction(
  transaction: {
    name: string
    merchantName?: string | null
    personal_finance_category?: { primary?: string; detailed?: string }
    category?: string[]
    amount?: number
  },
  userOverrides?: Map<string, { pocket: PocketType; pocketCategory: PocketCategory }>,
  merchantMappings?: Map<string, { pocket: PocketType; pocketCategory: PocketCategory }>,
  transactionId?: string,
): CategorizationResult {
  // 1. User override for this specific transaction
  if (transactionId && userOverrides?.has(transactionId)) {
    const override = userOverrides.get(transactionId)!
    return {
      pocket: override.pocket,
      pocketCategory: override.pocketCategory,
      confidence: 'high',
      matchedBy: 'user_override',
    }
  }

  const merchantName = (transaction.merchantName || '').toLowerCase().trim()
  const txName = (transaction.name || '').toLowerCase().trim()
  const searchText = merchantName || txName

  // 2. User merchant mappings (learned from user corrections)
  if (merchantName && merchantMappings?.has(merchantName)) {
    const mapping = merchantMappings.get(merchantName)!
    return {
      pocket: mapping.pocket,
      pocketCategory: mapping.pocketCategory,
      confidence: 'high',
      matchedBy: 'merchant_mapping',
    }
  }

  // 3. Merchant name rule-based matching
  for (const [pattern, rule] of Object.entries(MERCHANT_RULES)) {
    if (searchText.includes(pattern) || txName.includes(pattern)) {
      return {
        pocket: rule.pocket,
        pocketCategory: rule.category,
        confidence: 'high',
        matchedBy: 'merchant_rule',
      }
    }
  }

  // 4. Plaid detailed category
  const detailed = transaction.personal_finance_category?.detailed
  if (detailed && PLAID_DETAILED_MAP[detailed]) {
    const rule = PLAID_DETAILED_MAP[detailed]
    return {
      pocket: rule.pocket,
      pocketCategory: rule.category,
      confidence: 'high',
      matchedBy: 'plaid_detailed',
    }
  }

  // 5. Plaid primary category
  const primary = transaction.personal_finance_category?.primary
  if (primary && PLAID_CATEGORY_MAP[primary]) {
    const rule = PLAID_CATEGORY_MAP[primary]
    return {
      pocket: rule.pocket,
      pocketCategory: rule.category,
      confidence: 'medium',
      matchedBy: 'plaid_primary',
    }
  }

  // 6. Keyword-based fallback
  for (const { keywords, rule } of KEYWORD_RULES) {
    for (const kw of keywords) {
      if (searchText.includes(kw) || txName.includes(kw)) {
        return {
          pocket: rule.pocket,
          pocketCategory: rule.category,
          confidence: 'low',
          matchedBy: 'keyword',
        }
      }
    }
  }

  // 7. Fallback: try to infer from old Plaid category array
  const legacyCategories: string[] = transaction.category ?? []
  if (legacyCategories.includes('Restaurants') || legacyCategories.includes('Fast Food')) {
    return { pocket: 'self_reward', pocketCategory: 'dining', confidence: 'low', matchedBy: 'keyword' }
  }
  if (legacyCategories.includes('Shops') || legacyCategories.includes('Department Stores')) {
    return { pocket: 'self_reward', pocketCategory: 'shopping', confidence: 'low', matchedBy: 'keyword' }
  }
  if (legacyCategories.includes('Gas Stations')) {
    return { pocket: 'basic_needs', pocketCategory: 'gas', confidence: 'low', matchedBy: 'keyword' }
  }
  if (legacyCategories.includes('Groceries') || legacyCategories.includes('Supermarkets and Groceries')) {
    return { pocket: 'basic_needs', pocketCategory: 'groceries', confidence: 'low', matchedBy: 'keyword' }
  }

  // 8. Final fallback
  return {
    pocket: 'basic_needs',
    pocketCategory: 'other',
    confidence: 'low',
    matchedBy: 'fallback',
  }
}

/**
 * Calculate pocket budgets based on monthly income.
 */
export function calculatePocketBudgets(monthlyIncome: number): Record<PocketType, number> {
  return {
    basic_needs: Math.round(monthlyIncome * 0.5 * 100) / 100,
    investment: Math.round(monthlyIncome * 0.3 * 100) / 100,
    self_reward: Math.round(monthlyIncome * 0.2 * 100) / 100,
  }
}

/**
 * Get pocket config by type.
 */
export function getPocketConfig(type: PocketType): PocketConfig {
  return POCKET_CONFIGS.find(p => p.type === type)!
}

/**
 * Get display label for a pocket category.
 */
export function getPocketCategoryLabel(category: PocketCategory): string {
  const labels: Record<PocketCategory, string> = {
    rent: 'Rent / Housing',
    groceries: 'Groceries',
    gas: 'Gas / Fuel',
    debt_payment: 'Debt Payment',
    insurance: 'Insurance',
    utilities: 'Utilities',
    health: 'Health / Medical',
    brokerage: 'Brokerage / Investment',
    savings: 'Savings',
    retirement: 'Retirement',
    shopping: 'Shopping',
    dining: 'Dining / Restaurants',
    entertainment: 'Entertainment',
    travel: 'Travel',
    other: 'Other',
  }
  return labels[category] || category
}
