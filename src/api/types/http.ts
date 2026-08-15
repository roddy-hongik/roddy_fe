export interface ApiEnvelope<T> {
  isSuccess: boolean
  code: string
  message: string
  result: T
  error: unknown
}

export interface ApiErrorPayload {
  code?: string
  message?: string
  error?: unknown
}
