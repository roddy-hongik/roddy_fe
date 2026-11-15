import { readTokenPair } from '../../auth/utils/authStorage'
import { httpClient } from '../client/httpClient'
import { API_ENDPOINTS } from '../constants/endpoints'
import type { LoginResponse, SocialLoginRequest, SocialProvider, TokenPair } from '../types/auth'

/** 제공자에서 받은 액세스 토큰을 넘기면 백엔드가 사용자를 찾거나 만들고 Roddy 토큰을 준다. */
export function loginWithSocial(provider: SocialProvider, providerAccessToken: string): Promise<LoginResponse> {
  const body: SocialLoginRequest = { accessToken: providerAccessToken }
  return httpClient<LoginResponse>(API_ENDPOINTS.auth.social[provider], {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const LOGOUT_TIMEOUT_MS = 5000

/** 지금 저장된 토큰. 로컬 세션을 먼저 지우기 전에 꺼내 둔다. */
export const takeTokensForLogout = (): TokenPair | null => readTokenPair()

/**
 * 서버의 리프레시 토큰을 지우고 액세스 토큰을 블랙리스트에 올린다.
 * 로컬 로그아웃은 이 요청을 기다리지 않는다. 응답이 늦어도 5초 뒤 끊고, 실패해도 오류를 삼킨다.
 */
export function logoutFromServer(tokens: TokenPair | null): void {
  if (!tokens) return

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), LOGOUT_TIMEOUT_MS)
  void httpClient<null>(API_ENDPOINTS.auth.logout, {
    method: 'POST',
    body: JSON.stringify(tokens),
    signal: controller.signal,
  })
    .catch(() => undefined)
    .finally(() => window.clearTimeout(timer))
}
