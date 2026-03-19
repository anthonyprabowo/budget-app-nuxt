// server/api/plaid/exchange-public-token.post.ts
import { plaid } from '../../utils/plaidApi'
import { adminDb } from '../../utils/firebaseAdmin'
import { getCookie } from 'h3'
import { getPlaidConnections } from '../../utils/getUser'

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

  const userDoc = await adminDb.collection("users").doc(uid).get();

  if(!userDoc.exists) {
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
  const userData = userDoc.data() || {}

  const newConnection = {
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
  }

  // Get existing connections (supports legacy single `plaid` field)
  const existingConnections = getPlaidConnections(userData)

  // Prevent duplicate connections to the same institution
  const isDuplicate = existingConnections.some(
    (c) => c.institutionId === newConnection.institutionId
  )
  if (isDuplicate) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This institution is already connected',
    })
  }

  const updatedConnections = [...existingConnections, newConnection]

  await userRef.set(
    {
      plaid_connections: updatedConnections,
      // Clear cached balance so next fetch pulls fresh data for all connections
      plaid_balance: null,
      real_balance: null,
      // Clear legacy field if it existed
      ...(userData.plaid ? { plaid: null } : {}),
    },
    { merge: true }
  )

  return {
    ok: true,
  }
})
