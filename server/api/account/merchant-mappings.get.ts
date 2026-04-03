// server/api/account/merchant-mappings.get.ts
import { adminDb } from '../../utils/firebaseAdmin'
import { requireUserId } from '../../utils/authServer'

export default defineEventHandler(async (event) => {
  const uid = requireUserId(event)

  const snap = await adminDb
    .collection('users')
    .doc(uid)
    .collection('merchant_mappings')
    .orderBy('createdAt', 'desc')
    .get()

  const mappings = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }))

  return { ok: true, mappings }
})
