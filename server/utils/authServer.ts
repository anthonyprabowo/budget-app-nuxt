import { getCookie } from 'h3'

export function requireUserId(event: any): string {
  const userId = getCookie(event, 'uid')
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }
  return userId
}