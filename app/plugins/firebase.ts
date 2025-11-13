import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

export default defineNuxtPlugin(() => {
  const cfg = useRuntimeConfig().public
  const firebaseConfig = {
    apiKey: cfg.NUXT_FB_API_KEY,
    authDomain: cfg.NUXT_FB_AUTH_DOMAIN,
    projectId: cfg.NUXT_FB_PROJECT_ID,
    storageBucket: cfg.NUXT_FB_STORAGE_BUCKET,
    appId: cfg.NUXT_FB_APP_ID,
    messagingSenderId: cfg.NUXT_FB_MESSAGING_SENDER_ID,
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig as FirebaseOptions)
  const auth = getAuth(app)
  void setPersistence(auth, browserLocalPersistence)

  const db = getFirestore(app!)
  const storage = getStorage(app)

  return {
    provide: { firebase: { app, auth, db, storage } }
  }
})
