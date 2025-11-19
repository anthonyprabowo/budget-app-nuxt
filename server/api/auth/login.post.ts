import { adminAuth, adminDb } from '../../utils/firebaseAdmin'
import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ idToken?: string }>(event)

  if (!body.idToken) {
    throw createError({ statusCode: 400, statusMessage: 'idToken is required' })
  }

  const decoded = await adminAuth().verifyIdToken(body.idToken)
  const uid = decoded.uid
  const email = decoded.email;

  if(!email) {
    throw createError({
        statusCode: 400,
        message: 'Email not found'
    })
  }

  const usersRef = adminDb.collection("users")
  const snapshot = await usersRef.where('email', '==', email).limit(1).get();

  if(snapshot.empty) {
    throw createError({
      statusCode: 403,
      statusMessage: "You are not allowed to use this app",
    })
  }

  const userDoc = snapshot.docs[0]
  const userId = userDoc.id

  const isProd = process.env.NODE_ENV === "production"

  setCookie(event, "uid", userId, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  // 5) Update last login timestamp
  await userDoc.ref.update({
    updatedAt: new Date(),
  })

  return { ok: true, userId }
})
