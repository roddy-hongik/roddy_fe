export type SocialProvider = 'kakao' | 'google'

export interface SocialLoginRequest {
  provider: SocialProvider
  accessToken: string
}

/** 백엔드 권한 이름 그대로 온다. */
export type UserRole = 'USER' | 'ADMIN'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  isOnboard: boolean
  githubConnected: boolean
  /** 어드민 메뉴를 보여줄지 정하는 데만 쓴다. 실제 권한 검사는 서버가 요청마다 한다. */
  role: UserRole
}
