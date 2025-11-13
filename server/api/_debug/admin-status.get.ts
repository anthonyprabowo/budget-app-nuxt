import { adminAuth } from '../../utils/firebaseAdmin'

export default defineEventHandler(async () => {
  // If credentials are wrong, this file will throw on import or below
  await adminAuth().listUsers(1) // minimal call to ensure permissions work
  return { ok: true }
})
