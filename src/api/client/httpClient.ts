import { emitAuthChange } from '../../auth/utils/authEvents'
import type { ApiEnvelope, ApiErrorPayload } from '../types/http'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const isApiEnvelope = <T>(value: unknown): value is ApiEnvelope<T> => {
  if (!value || typeof value !== 'object') {
    return false
  }

  return 'isSuccess' in value && 'code' in value && 'message' in value && 'result' in value
}

const joinUrl = (baseUrl: string, path: string) => {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  if (!baseUrl) {
    return path
  }

  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

const toErrorMessage = (status: number, fallbackStatusText: string, payload?: ApiErrorPayload) => {
  const code = payload?.code?.trim()
  const message = payload?.message?.trim() || fallbackStatusText || 'Request failed'

  return code ? `HTTP ${status} [${code}]: ${message}` : `HTTP ${status}: ${message}`
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    const text = await response.text()
    return text ? { message: text } : null
  }

  return response.json()
}

export async function httpClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = localStorage.getItem('accessToken')
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  const response = await fetch(joinUrl(API_BASE_URL, path), {
    ...options,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  const payload = (await parseResponsePayload(response)) as ApiEnvelope<T> | ApiErrorPayload | null

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    emitAuthChange()
    window.location.href = '/login'
    throw new Error(toErrorMessage(response.status, response.statusText, payload ?? undefined))
  }

  if (!response.ok) {
    throw new Error(toErrorMessage(response.status, response.statusText, payload ?? undefined))
  }

  if (isApiEnvelope<T>(payload)) {
    if (!payload.isSuccess) {
      throw new Error(toErrorMessage(response.status, response.statusText, payload))
    }

    return payload.result
  }

  return payload as T
}
