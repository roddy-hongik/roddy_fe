export type SocialProvider = 'kakao' | 'google'

export interface SocialLoginRequest {
  /** 구글·카카오에서 받은 액세스 토큰. 백엔드가 이 토큰으로 사용자 정보를 조회한다. */
  accessToken: string
}

/** 백엔드 권한 이름 그대로 온다. */
export type UserRole = 'USER' | 'ADMIN'

export interface LoginUser {
  id: string
  email: string
  nickname: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  isOnboard: boolean
  githubConnected: boolean
  /** 어드민 메뉴를 보여줄지 정하는 데만 쓴다. 실제 권한 검사는 서버가 요청마다 한다. */
  role: UserRole
  user: LoginUser
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}
