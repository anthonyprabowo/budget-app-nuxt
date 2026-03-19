// server/api/plaid/transactions.get.ts
import { plaid } from '../../utils/plaidApi'
import { adminDb } from '../../utils/firebaseAdmin'
import { getCookie, getQuery } from 'h3'
import { type AppCategory, type IncomeCategory } from '../../../app/types/transaction'
import { getPlaidConnections } from '../../utils/getUser'

function getCurrentMonthDateRange() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const start = new Date(year, month, 1)
  const end = today

  const format = (d: Date) => d.toISOString().slice(0, 10)

  return {
    start_date: format(start),
    end_date: format(end),
  }
}

function mapPlaidToAppCategory(t: any): AppCategory {
  const primary = t.personal_finance_category?.primary as string | undefined
  const categories: string[] = t.category ?? []

  if (primary === 'FOOD_AND_DRINK' || categories.includes('Restaurants') || categories.includes('Fast Food')) {
    return 'food'
  }
  if (primary === 'SHOPPING' || categories.includes('Shops') || categories.includes('Department Stores')) {
    return 'shopping'
  }
  if (primary === 'HEALTHCARE' || categories.includes('Medical') || categories.includes('Health Care')) {
    return 'health'
  }
  if (primary === 'ENTERTAINMENT' || categories.includes('Entertainment')) {
    return 'entertainment'
  }
  if (primary === 'TRANSPORTATION' || categories.includes('Travel') || categories.includes('Public Transportation') || categories.includes('Taxi')) {
    return 'transportation'
  }
  if (primary === 'UTILITIES' || categories.includes('Utilities') || categories.includes('Service')) {
    return 'utilities'
  }
  if (primary === 'TRANSFER_OUT' || categories.includes('Transfer')) {
    return 'transfer'
  }
  return 'other'
}

function mapPlaidToIncomeCategory(t: any): IncomeCategory {
  const detailed = t.personal_finance_category?.detailed as string | undefined
  const categories: string[] = t.category ?? []
  const name = (t.name || '').toLowerCase()

  if (name.includes('zelle')) return 'zelle'
  if (detailed?.includes('DIRECT_DEPOSIT') || categories.includes('Direct Deposit')) return 'direct_deposit'
  if (categories.includes('Payroll') || detailed?.includes('PAYROLL')) return 'payroll'
  if (t.personal_finance_category?.primary === 'TRANSFER_IN') return 'transfer_in'
  return 'other_income'
}

/** Returns true if this transaction represents income (money coming in). */
function isIncomeTransaction(t: any): boolean {
  const primary = t.personal_finance_category?.primary as string | undefined
  const detailed = t.personal_finance_category?.detailed as string | undefined
  const categories: string[] = t.category ?? []
  const name = (t.name || '').toLowerCase()

  // Plaid: negative amount = money coming in
  if (t.amount >= 0) return false

  if (primary === 'INCOME') return true
  if (primary === 'TRANSFER_IN') return true
  if (detailed?.includes('DIRECT_DEPOSIT')) return true
  if (categories.includes('Payroll')) return true
  if (categories.includes('Direct Deposit')) return true
  if (name.includes('zelle')) return true

  return false
}

/** Returns true if the transaction is an internal money market transfer (excluded). */
function isInternalTransfer(t: any): boolean {
  const name = (t.name || '').toLowerCase()
  const txType = (t.transaction_type || '').toLowerCase()
  return (name.includes('money market') && name.includes('transfer')) ||
    (txType === 'transfer' && name.includes('money market'))
}


export default defineEventHandler(async (event) => {
  const uid = getCookie(event, 'uid')
  if (!uid) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const query = getQuery(event)
  const filterAccountId = query.accountId as string | undefined

  const userDoc = await adminDb.collection('users').doc(uid).get()
  if (!userDoc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const userData = userDoc.data() || {}
  const connections = getPlaidConnections(userData)

  if (connections.length === 0) {
    return { ok: false, transactions: [], income: [] }
  }

  const { start_date, end_date } = getCurrentMonthDateRange()
  const allExpenses: any[] = []
  const allIncome: any[] = []

  // Build accountId -> metadata lookup
  const accountLookup: Record<string, { institutionName: string; accountName: string }> = {}
  for (const conn of connections) {
    for (const acc of conn.accounts || []) {
      accountLookup[acc.id] = {
        institutionName: conn.institutionName || 'Unknown',
        accountName: acc.name || 'Account',
      }
    }
  }

  for (const conn of connections) {
    try {
      const plaidRes = await plaid.transactionsGet({
        access_token: conn.accessToken,
        start_date,
        end_date,
        options: { count: 100, offset: 0 },
      })

      const { transactions } = plaidRes.data

      for (const t of transactions) {
        const lookup = accountLookup[t.account_id] || {
          institutionName: conn.institutionName || 'Unknown',
          accountName: 'Account',
        }

        if (isInternalTransfer(t)) continue
        if (filterAccountId && t.account_id !== filterAccountId) continue

        if (isIncomeTransaction(t)) {
          allIncome.push({
            transactionId: t.transaction_id,
            name: t.name,
            amount: Math.abs(t.amount),
            date: t.date,
            category: mapPlaidToIncomeCategory(t),
            accountId: t.account_id,
            accountName: lookup.accountName,
            institutionName: lookup.institutionName,
            merchantName: t.merchant_name,
          })
        } else if (t.amount > 0) {
          allExpenses.push({
            transactionId: t.transaction_id,
            name: t.name,
            amount: t.amount,
            date: t.date,
            isoCurrencyCode: t.iso_currency_code,
            unofficialCurrencyCode: t.unofficial_currency_code,
            merchantName: t.merchant_name,
            category: mapPlaidToAppCategory(t),
            paymentChannel: t.payment_channel,
            pending: t.pending,
            accountId: t.account_id,
            accountName: lookup.accountName,
            institutionName: lookup.institutionName,
          })
        }
      }
    } catch (err: any) {
      console.error(
        `Plaid /transactions error for ${conn.institutionName}:`,
        err.response?.data || err
      )
    }
  }

  return {
    ok: true,
    start_date,
    end_date,
    count: allExpenses.length,
    transactions: allExpenses,
    income: allIncome,
  }
})
