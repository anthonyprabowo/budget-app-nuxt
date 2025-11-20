// server/api/plaid/transactions.get.ts
import { plaid } from '../../utils/plaidApi'
import { adminAuth, adminDb } from '../../utils/firebaseAdmin'
import { getCookie } from 'h3'
import { AppCategory } from '../../../app/types/transaction'

function getCurrentMonthDateRange() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() // 0-based
  const start = new Date(year, month, 1)
  const end = today

  const format = (d: Date) => d.toISOString().slice(0, 10) // YYYY-MM-DD

  return {
    start_date: format(start),
    end_date: format(end),
  }
}

function mapPlaidToAppCategory(t: any): AppCategory {
  const primary = t.personal_finance_category?.primary as string | undefined
  const categories: string[] = t.category ?? []

  // 🔹 FOOD
  if (
    primary === 'FOOD_AND_DRINK' ||
    categories.includes('Restaurants') ||
    categories.includes('Fast Food')
  ) {
    return 'food'
  }

  // 🔹 SHOPPING
  if (
    primary === 'SHOPPING' ||
    categories.includes('Shops') ||
    categories.includes('Department Stores')
  ) {
    return 'shopping'
  }

  // 🔹 HEALTH
  if (
    primary === 'HEALTHCARE' ||
    categories.includes('Medical') ||
    categories.includes('Health Care')
  ) {
    return 'health'
  }

  // 🔹 ENTERTAINMENT
  if (
    primary === 'ENTERTAINMENT' ||
    categories.includes('Entertainment')
  ) {
    return 'entertainment'
  }

  // 🔹 TRANSPORTATION
  if (
    primary === 'TRANSPORTATION' ||
    categories.includes('Travel') ||
    categories.includes('Public Transportation') ||
    categories.includes('Taxi')
  ) {
    return 'transportation'
  }

  // 🔹 UTILITIES
  if (
    primary === 'UTILITIES' ||
    categories.includes('Utilities') ||
    categories.includes('Service')
  ) {
    return 'utilities'
  }

  // 🔹 DEFAULT
  return 'other'
}


export default defineEventHandler(async (event) => {
  const uid = getCookie(event, 'uid') 
  if (!uid) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const userDoc = await adminDb.collection('users').doc(uid).get()
  if (!userDoc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const userData = userDoc.data() || {}
  if(userData.plaid)
  {
    const accessToken = userData.plaid?.accessToken

    if (!accessToken) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User has no linked Plaid access token',
      })
    }

    const { start_date, end_date } = getCurrentMonthDateRange()

    const plaidRes = await plaid.transactionsGet({
      access_token: accessToken,
      start_date,
      end_date,
      options: {
        count: 100,
        offset: 0,
      },
    })

    const { transactions } = plaidRes.data

    const filtered = transactions.filter((t) => {
      const primary = t.personal_finance_category?.primary as string | undefined
      const detailed = t.personal_finance_category?.detailed as string | undefined
      const categories: string[] = t.category ?? []
      const name = (t.name || '').toLowerCase()
      const txType = (t.transaction_type || '').toLowerCase()

      if (primary === 'INCOME') return false

      if (detailed?.includes('DIRECT_DEPOSIT')) return false
      if (categories.includes('Payroll')) return false
      if (categories.includes('Direct Deposit')) return false

      const isMoneyMarketTransferByName =
        name.includes('money market') && name.includes('transfer')

      const isMoneyMarketTransferByType =
        txType === 'transfer' && name.includes('money market')

      if (isMoneyMarketTransferByName || isMoneyMarketTransferByType) {
        return false
      }

      // keep everything else
      return true
    })


    const simplified = filtered.map((t) => ({
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
    }))

    return {
      ok: true,
      start_date,
      end_date,
      count: simplified.length,
      transactions: simplified,
    }
  }
  else
  {
    return { ok: false }
  }
})
