// server/api/account/get-pocket-budget.get.ts
import { adminDb } from '../../utils/firebaseAdmin'
import { requireUserId } from '../../utils/authServer'
import { calculatePocketBudgets, POCKET_CONFIGS } from '../../utils/pocketCategorizer'

export default defineEventHandler(async (event) => {
  const uid = requireUserId(event)

  const userDoc = await adminDb.collection('users').doc(uid).get()
  if (!userDoc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const userData = userDoc.data() || {}
  const monthlyIncome = userData.monthlyBudget || 0

  if (monthlyIncome === 0) {
    return {
      ok: true,
      monthlyIncome: 0,
      pockets: POCKET_CONFIGS.map(p => ({
        type: p.type,
        label: p.label,
        percentage: p.percentage,
        budgetAmount: 0,
        color: p.color,
        icon: p.icon,
      })),
    }
  }

  const budgets = calculatePocketBudgets(monthlyIncome)

  return {
    ok: true,
    monthlyIncome,
    pockets: POCKET_CONFIGS.map(p => ({
      type: p.type,
      label: p.label,
      percentage: p.percentage,
      budgetAmount: budgets[p.type],
      color: p.color,
      icon: p.icon,
    })),
  }
})
