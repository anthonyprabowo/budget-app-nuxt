// server/api/account/save-transaction-override.post.ts
import { adminDb } from '../../utils/firebaseAdmin'
import { requireUserId } from '../../utils/authServer'
import type { PocketType, PocketCategory } from '../../../app/types/pocket'

export default defineEventHandler(async (event) => {
  const uid = requireUserId(event)
  const body = await readBody(event)

  const { transactionId, pocket, pocketCategory, merchantName, saveAsMerchantRule } = body as {
    transactionId: string
    pocket: PocketType
    pocketCategory: PocketCategory
    merchantName?: string | null
    saveAsMerchantRule?: boolean
  }

  if (!transactionId || !pocket || !pocketCategory) {
    throw createError({ statusCode: 400, statusMessage: 'transactionId, pocket, and pocketCategory are required' })
  }

  const validPockets: PocketType[] = ['basic_needs', 'investment', 'self_reward']
  if (!validPockets.includes(pocket)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid pocket type' })
  }

  // Save the transaction-level override
  await adminDb
    .collection('users')
    .doc(uid)
    .collection('transaction_overrides')
    .doc(transactionId)
    .set({
      pocket,
      pocketCategory,
      overriddenAt: new Date().toISOString(),
    })

  // Optionally save as merchant mapping for future auto-categorization
  if (saveAsMerchantRule && merchantName) {
    const normalizedMerchant = merchantName.toLowerCase().trim()
    await adminDb
      .collection('users')
      .doc(uid)
      .collection('merchant_mappings')
      .doc(normalizedMerchant)
      .set({
        merchantName: normalizedMerchant,
        pocket,
        pocketCategory,
        createdAt: new Date().toISOString(),
        source: 'user',
      })
  }

  return { ok: true }
})
