export type SocialProvider = 'kakao' | 'google'

export interface SocialLoginRequest {
  provider: SocialProvider
  accessToken: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  isOnboard: boolean
  githubConnected: boolean
}
