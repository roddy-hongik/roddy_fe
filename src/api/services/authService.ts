import { httpClient } from '../client/httpClient'
import { API_ENDPOINTS } from '../constants/endpoints'
import type { SocialLoginResponse } from '../types/auth'

export async function loginWithKakao(token: string): Promise<SocialLoginResponse> {
  return httpClient<SocialLoginResponse>(API_ENDPOINTS.auth.kakaoLogin, {
    method: 'POST',
    body: JSON.stringify({ accessToken: token }),
  })
}

export async function loginWithGoogle(token: string): Promise<SocialLoginResponse> {
  return httpClient<SocialLoginResponse>(API_ENDPOINTS.auth.googleLogin, {
    method: 'POST',
    body: JSON.stringify({ accessToken: token }),
  })
}
