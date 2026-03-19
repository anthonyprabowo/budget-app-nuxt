// server/api/plaid/accounts.get.ts
// Returns all connected bank accounts with institution info
import { getUser, getPlaidConnections } from '../../utils/getUser'

export default defineEventHandler(async (event) => {
  const user = await getUser(event)

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const connections = getPlaidConnections(user)

  const accounts = connections.flatMap((conn) =>
    (conn.accounts || []).map((acc: any) => ({
      accountId: acc.id,
      name: acc.name,
      mask: acc.mask,
      type: acc.type,
      subtype: acc.subtype,
      institutionId: conn.institutionId,
      institutionName: conn.institutionName,
      itemId: conn.itemId,
      linkedAt: conn.linkedAt,
    }))
  )

  return { accounts }
})
