// server/api/plaid/exchange-public-token.post.ts
import { plaid } from '../../utils/plaidApi'
import { adminAuth, adminDb } from '../../utils/firebaseAdmin'
import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    public_token?: string
    metadata?: any
  }>(event)

  if (!body.public_token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'public_token is required',
    })
  }

  const uid = getCookie(event, 'uid')
  if (!uid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    })
  }

  var user = await adminDb.collection("users").doc(uid).get();

  if(!user) {
    throw createError({
        statusCode: 400,
        statusMessage: "User not found"
    })
  }

  const exchangeRes = await plaid.itemPublicTokenExchange({
    public_token: body.public_token,
  })

  const accessToken = exchangeRes.data.access_token
  const itemId = exchangeRes.data.item_id
  const userRef = adminDb.collection('users').doc(uid)

  await userRef.set(
    {
      plaid: {
        accessToken,
        itemId,
        institutionId: body.metadata?.institution?.institution_id ?? null,
        institutionName: body.metadata?.institution?.name ?? null,
        accounts: body.metadata?.accounts?.map((acc: any) => ({
          id: acc.id,
          mask: acc.mask,
          name: acc.name,
          subtype: acc.subtype,
          type: acc.type,
        })) ?? [],
        linkedAt: new Date(),
      },
    },
    { merge: true }
  )

  return {
    ok: true,
  }
})
