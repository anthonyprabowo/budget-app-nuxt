// server/utils/firebaseAdmin.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import serviceAccount from './minty-budget-app-firebase-adminsdk-fbsvc-0fa2dba133.json'

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount as any),
    })

export const adminAuth = () => getAuth(app)
