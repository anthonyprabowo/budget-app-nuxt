// server/utils/firebaseAdmin.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function getServiceAccount() {
  const raw = process.env.NUXT_FB_CREDENTIALS
  if (!raw) {
      throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON in environment variables')
  }
  const serviceAccount = JSON.parse(raw)
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
  }
  return serviceAccount
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(getServiceAccount() as any),
    })

export const adminAuth = () => getAuth(app)
export const adminDb = getFirestore(app)
