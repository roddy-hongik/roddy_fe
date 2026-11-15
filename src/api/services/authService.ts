import { readTokenPair } from '../../auth/utils/authStorage'
import { httpClient } from '../client/httpClient'
import { API_ENDPOINTS } from '../constants/endpoints'
import type { LoginResponse, SocialLoginRequest, SocialProvider } from '../types/auth'

/** 제공자에서 받은 액세스 토큰을 넘기면 백엔드가 사용자를 찾거나 만들고 Roddy 토큰을 준다. */
export function loginWithSocial(provider: SocialProvider, providerAccessToken: string): Promise<LoginResponse> {
  const body: SocialLoginRequest = { accessToken: providerAccessToken }
  return httpClient<LoginResponse>(API_ENDPOINTS.auth.social[provider], {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * 서버의 리프레시 토큰을 지우고 액세스 토큰을 블랙리스트에 올린다.
 * 서버가 실패해도 화면에서는 로그아웃해야 하므로 오류는 삼킨다. 세션 정리는 부르는 쪽이 한다.
 */
export async function logoutFromServer(): Promise<void> {
  const tokens = readTokenPair()
  if (!tokens) return

  await httpClient<null>(API_ENDPOINTS.auth.logout, {
    method: 'POST',
    body: JSON.stringify(tokens),
  }).catch(() => undefined)
}
