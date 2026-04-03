// server/api/account/delete-merchant-mapping.post.ts
import { adminDb } from '../../utils/firebaseAdmin'
import { requireUserId } from '../../utils/authServer'

export default defineEventHandler(async (event) => {
  const uid = requireUserId(event)
  const body = await readBody(event)

  const { merchantName } = body as { merchantName: string }

  if (!merchantName) {
    throw createError({ statusCode: 400, statusMessage: 'merchantName is required' })
  }

  const normalizedMerchant = merchantName.toLowerCase().trim()

  await adminDb
    .collection('users')
    .doc(uid)
    .collection('merchant_mappings')
    .doc(normalizedMerchant)
    .delete()

  return { ok: true }
})
