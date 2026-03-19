// composables/useApiFetch.ts
// Wraps $fetch with automatic 401 handling — logs out and redirects on expired session.
import type { FetchError } from 'ofetch'

export function useApiFetch() {
  const router = useRouter()

  async function apiFetch<T = any>(url: string, opts?: Parameters<typeof $fetch>[1]): Promise<T> {
    try {
      return await $fetch(url, opts) as T
    } catch (err) {
      const e = err as FetchError
      if (e.statusCode === 401) {
        const { logout } = useAuth()
        await logout()
        router.push({
          path: '/',
          query: { expired: 'true' },
        })
        throw new Error('Your session has expired. Please log in again.')
      }
      throw err
    }
  }

  return { apiFetch }
}
