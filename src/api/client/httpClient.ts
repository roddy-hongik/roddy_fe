import { emitAuthChange } from '../../auth/utils/authEvents'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function httpClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = localStorage.getItem('accessToken')
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('accessToken')
    emitAuthChange()
    window.location.href = '/login'
    throw new Error(`HTTP ${response.status}: Unauthorized`)
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return (await response.json()) as T
}
