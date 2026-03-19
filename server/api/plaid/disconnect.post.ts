// server/api/plaid/disconnect.post.ts
// Disconnect a specific bank connection by itemId
import { adminDb } from '../../utils/firebaseAdmin'
import { getUser, getPlaidConnections } from '../../utils/getUser'

export default defineEventHandler(async (event) => {
  const user = await getUser(event)

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const body = await readBody<{ itemId?: string }>(event)

  if (!body.itemId) {
    throw createError({ statusCode: 400, statusMessage: 'itemId is required' })
  }

  const connections = getPlaidConnections(user)
  const updatedConnections = connections.filter((c) => c.itemId !== body.itemId)

  if (updatedConnections.length === connections.length) {
    throw createError({ statusCode: 404, statusMessage: 'Connection not found' })
  }

  const userRef = adminDb.collection('users').doc(user.uid)

  // Remove the disconnected accounts from plaid_balance cache
  const removedConnection = connections.find((c) => c.itemId === body.itemId)
  const removedAccountIds = new Set(
    (removedConnection?.accounts || []).map((a: any) => a.id)
  )

  const currentBalances = user.plaid_balance || []
  const updatedBalances = currentBalances.filter(
    (b: any) => !removedAccountIds.has(b.accountId || b.account_id)
  )

  await userRef.set(
    {
      plaid_connections: updatedConnections,
      // Clear cached balance so next fetch recalculates correctly
      plaid_balance: null,
      real_balance: null,
      // Clear legacy field
      ...(user.plaid ? { plaid: null } : {}),
    },
    { merge: true }
  )

  return { ok: true }
})
