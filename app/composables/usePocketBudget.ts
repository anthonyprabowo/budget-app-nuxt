// composables/usePocketBudget.ts
import type { TransactionData } from '~/types/transaction'
import type { PocketType, PocketCategory, PocketSummary, MonthlyBudgetBreakdown } from '~/types/pocket'

export function usePocketBudget() {
  const POCKET_META: Record<PocketType, { label: string; percentage: number; color: string; icon: string }> = {
    basic_needs: { label: 'Basic Needs', percentage: 50, color: '#22c55e', icon: 'mdi-home-outline' },
    investment: { label: 'Investment', percentage: 30, color: '#3b82f6', icon: 'mdi-chart-line' },
    self_reward: { label: 'Self Reward', percentage: 20, color: '#a855f7', icon: 'mdi-gift-outline' },
  }

  const CATEGORY_LABELS: Record<PocketCategory, string> = {
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

  function calculatePocketBudgets(monthlyIncome: number): Record<PocketType, number> {
    return {
      basic_needs: Math.round(monthlyIncome * 0.5 * 100) / 100,
      investment: Math.round(monthlyIncome * 0.3 * 100) / 100,
      self_reward: Math.round(monthlyIncome * 0.2 * 100) / 100,
    }
  }

  function buildPocketSummaries(
    transactions: TransactionData[],
    monthlyIncome: number,
  ): PocketSummary[] {
    const budgets = calculatePocketBudgets(monthlyIncome)
    const pocketTypes: PocketType[] = ['basic_needs', 'investment', 'self_reward']

    return pocketTypes.map(type => {
      const meta = POCKET_META[type]
      const pocketTxs = transactions.filter(
        t => t.pocket === type && t.amount > 0
      )
      const spent = pocketTxs.reduce((sum, t) => sum + t.amount, 0)
      const budget = budgets[type]

      return {
        type,
        label: meta.label,
        percentage: meta.percentage,
        budgetAmount: budget,
        spentAmount: Math.round(spent * 100) / 100,
        remainingAmount: Math.round((budget - spent) * 100) / 100,
        color: meta.color,
        icon: meta.icon,
        transactions: pocketTxs.map(t => ({
          transactionId: t.transactionId,
          name: t.name,
          amount: t.amount,
          date: t.date,
          merchantName: t.merchantName,
          pocket: t.pocket!,
          pocketCategory: t.pocketCategory!,
          isOverride: t.isOverride,
          accountId: t.accountId,
          accountName: t.accountName,
          institutionName: t.institutionName,
          isZelle: t.isZelle,
        })),
      }
    })
  }

  function buildMonthlyBreakdown(
    transactions: TransactionData[],
    monthlyIncome: number,
    month: string,
  ): MonthlyBudgetBreakdown {
    const summaries = buildPocketSummaries(transactions, monthlyIncome)
    const uncategorized = transactions
      .filter(t => !t.pocket && t.amount > 0)
      .map(t => ({
        transactionId: t.transactionId,
        name: t.name,
        amount: t.amount,
        date: t.date,
        merchantName: t.merchantName,
        pocket: 'basic_needs' as PocketType,
        pocketCategory: 'other' as PocketCategory,
        accountId: t.accountId,
        accountName: t.accountName,
        institutionName: t.institutionName,
        isZelle: t.isZelle,
      }))

    const totalSpent = summaries.reduce((sum, p) => sum + p.spentAmount, 0)

    return {
      month,
      monthlyIncome,
      pockets: summaries,
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalRemaining: Math.round((monthlyIncome - totalSpent) * 100) / 100,
      uncategorized,
    }
  }

  function getPocketColor(type: PocketType): string {
    return POCKET_META[type]?.color ?? '#9e9e9e'
  }

  function getPocketIcon(type: PocketType): string {
    return POCKET_META[type]?.icon ?? 'mdi-help-circle-outline'
  }

  function getPocketLabel(type: PocketType): string {
    return POCKET_META[type]?.label ?? type
  }

  function getCategoryLabel(category: PocketCategory): string {
    return CATEGORY_LABELS[category] ?? category
  }

  function getPocketCategoryIcon(category: PocketCategory): string {
    const icons: Record<PocketCategory, string> = {
      rent: 'mdi-home-city-outline',
      groceries: 'mdi-cart-outline',
      gas: 'mdi-gas-station',
      debt_payment: 'mdi-credit-card-outline',
      insurance: 'mdi-shield-check-outline',
      utilities: 'mdi-lightning-bolt-outline',
      health: 'mdi-heart-outline',
      brokerage: 'mdi-chart-line',
      savings: 'mdi-piggy-bank-outline',
      retirement: 'mdi-account-clock-outline',
      shopping: 'mdi-shopping-outline',
      dining: 'mdi-silverware',
      entertainment: 'mdi-gamepad-variant-outline',
      travel: 'mdi-airplane',
      other: 'mdi-help-circle-outline',
    }
    return icons[category] ?? 'mdi-help-circle-outline'
  }

  return {
    POCKET_META,
    CATEGORY_LABELS,
    calculatePocketBudgets,
    buildPocketSummaries,
    buildMonthlyBreakdown,
    getPocketColor,
    getPocketIcon,
    getPocketLabel,
    getCategoryLabel,
    getPocketCategoryIcon,
  }
}
