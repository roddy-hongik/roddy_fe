import { readTokenUserId } from '../../auth/utils/accountStorage'
import { emitAuthChange } from '../../auth/utils/authEvents'
import { clearAuthSession, readTokenPair, storeReissuedTokens } from '../../auth/utils/authStorage'
import { API_ENDPOINTS } from '../constants/endpoints'
import type { TokenPair } from '../types/auth'
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

// 로그인·재발급·로그아웃 요청은 401 이 와도 재발급하거나 로그인 화면으로 보내지 않는다. 부른 쪽이 처리한다.
const isAuthRequest = (path: string) => /\/api\/auth\//.test(path)

const readAccessToken = () => localStorage.getItem('accessToken')

const sendRequest = (path: string, options: RequestInit, accessToken: string | null) => {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  return fetch(joinUrl(API_BASE_URL, path), {
    ...options,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
  })
}

const REISSUE_LOCKED_RETRY_MS = 700
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

/**
 * 재발급 결과.
 * - renewed: 같은 계정의 새 토큰을 쓸 수 있다. 원래 요청을 다시 보낸다.
 * - rejected: 서버가 리프레시 토큰을 거절했다(만료·폐기·정지). 세션을 끝낸다.
 * - unavailable: 서버 오류·네트워크 문제로 알 수 없다. 세션은 그대로 두고 이번 요청만 실패시킨다.
 * - switched: 기다리는 사이 로그아웃했거나 다른 계정으로 바뀌었다. 이전 요청을 새 계정으로 보내지 않는다.
 */
type RenewOutcome = 'renewed' | 'rejected' | 'unavailable' | 'switched'
type ReissueResult = TokenPair | 'locked' | 'rejected' | 'unavailable'

async function requestReissue(tokens: TokenPair): Promise<ReissueResult> {
  try {
    const response = await fetch(joinUrl(API_BASE_URL, API_ENDPOINTS.auth.reissue), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens),
    })
    // 다른 탭이 같은 계정의 토큰을 이미 재발급하는 중이다.
    if (response.status === 503) return 'locked'
    // 5xx 는 서버 쪽 일시 장애다. 토큰이 잘못됐다는 뜻이 아니다.
    if (response.status >= 500) return 'unavailable'

    const payload = await parseResponsePayload(response)
    if (!response.ok || !isApiEnvelope<TokenPair>(payload) || !payload.isSuccess) return 'rejected'
    return payload.result?.accessToken && payload.result.refreshToken ? payload.result : 'unavailable'
  } catch {
    return 'unavailable'
  }
}

/** 저장소의 세션이 바뀌었을 때, 같은 계정의 새 토큰이면 그대로 쓰고 아니면 이전 요청을 버린다. */
const outcomeForChangedSession = (ownerId: string | null): RenewOutcome => {
  const current = readAccessToken()
  if (!current) return 'switched'
  return ownerId !== null && readTokenUserId(current) === ownerId ? 'renewed' : 'switched'
}

/**
 * 만료된 액세스 토큰을 리프레시 토큰으로 바꾼다.
 * 한 화면에서 여러 요청이 동시에 401 을 받아도 재발급은 한 번만 나간다.
 */
let pendingReissue: Promise<RenewOutcome> | null = null

async function renewAccessToken(expiredAccessToken: string): Promise<RenewOutcome> {
  const ownerId = readTokenUserId(expiredAccessToken)

  // 기다리는 사이 다른 요청이나 다른 탭이 이미 바꿔 놨다.
  if (readAccessToken() !== expiredAccessToken) return outcomeForChangedSession(ownerId)

  if (!pendingReissue) {
    pendingReissue = (async (): Promise<RenewOutcome> => {
      const tokens = readTokenPair()
      if (!tokens) return 'switched'

      let result = await requestReissue(tokens)
      if (result === 'locked') {
        await wait(REISSUE_LOCKED_RETRY_MS)
        // 다른 탭이 재발급을 끝냈으면 그 토큰을 그대로 쓴다.
        if (readAccessToken() !== tokens.accessToken) return outcomeForChangedSession(ownerId)
        result = await requestReissue(tokens)
      }
      if (result === 'locked') return 'unavailable'
      if (result === 'rejected' || result === 'unavailable') return result

      // 응답을 기다리는 사이 로그아웃했거나 다른 계정으로 로그인했다면 받은 토큰을 저장하지 않는다.
      if (readTokenPair()?.refreshToken !== tokens.refreshToken) return outcomeForChangedSession(ownerId)

      storeReissuedTokens(result)
      return 'renewed'
    })().finally(() => {
      pendingReissue = null
    })
  }

  // 같은 재발급을 기다린 다른 요청도 자기 계정이 맞는지 따로 확인한다.
  const outcome = await pendingReissue
  return outcome === 'renewed' ? outcomeForChangedSession(ownerId) : outcome
}

/** 세션이 끝났다. 로그인 후 지금 화면으로 돌아올 수 있게 경로를 넘긴다. */
const endSessionAndGoToLogin = () => {
  clearAuthSession()
  emitAuthChange()

  const currentPath = `${window.location.pathname}${window.location.search}`
  const isOnLoginPage = window.location.pathname === '/login'
  window.location.href = isOnLoginPage ? '/login' : `/login?redirect=${encodeURIComponent(currentPath)}`
}

export async function httpClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const authRequest = isAuthRequest(path)
  let accessToken = readAccessToken()
  let response = await sendRequest(path, options, accessToken)

  if (response.status === 401 && accessToken && !authRequest) {
    const outcome = await renewAccessToken(accessToken)
    if (outcome === 'renewed') {
      accessToken = readAccessToken()
      response = await sendRequest(path, options, accessToken)
    } else if (outcome === 'unavailable') {
      throw new Error('로그인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } else if (outcome === 'switched') {
      throw new Error('로그인 상태가 바뀌어 이전 요청을 보내지 않았습니다.')
    }
    // rejected 는 아래에서 401 로 세션을 끝낸다.
  }

  const payload = (await parseResponsePayload(response)) as ApiEnvelope<T> | ApiErrorPayload | null

  // 401 은 로그인이 없거나 재발급까지 실패한 경우다.
  // 403 은 "로그인은 됐지만 이 작업은 안 된다"는 뜻이라 세션을 지우지 않고 오류만 돌려준다.
  if (response.status === 401 && !authRequest) {
    endSessionAndGoToLogin()
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
