// Super simple in-memory store for demo purposes only
// In real life, this is where you'd use your DB

type AccessTokenRecord = {
  userId: string
  accessToken: string
  itemId: string
}

const store = new Map<string, AccessTokenRecord>()

export function saveAccessToken(userId: string, accessToken: string, itemId: string) {
  store.set(userId, { userId, accessToken, itemId })
}

export function getAccessToken(userId: string): string | null {
  const rec = store.get(userId)
  return rec?.accessToken ?? null
}
