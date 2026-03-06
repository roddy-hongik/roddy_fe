export type SocialProvider = 'kakao' | 'google'

export interface SocialLoginRequest {
  provider: SocialProvider
  accessToken: string
}

export interface AuthUser {
  id: string
  email: string
  nickname: string
}

export interface SocialLoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}
