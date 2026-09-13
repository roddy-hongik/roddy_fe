import type { LoginResponse, SocialProvider } from '../types/auth'

const getMockLoginResponse = (provider: SocialProvider): LoginResponse => {
  const isOnboard = localStorage.getItem('isOnboard') === 'true'
  const githubConnected = localStorage.getItem('githubConnected') === 'true'

  return {
    accessToken: `mock-${provider}-access-token`,
    refreshToken: `mock-${provider}-refresh-token`,
    isOnboard,
    githubConnected,
    // 소셜 로그인이 아직 목이라, 누구든 관리자로 들어오던 기존 동작을 유지한다.
    // 실제 API 를 붙이면 서버가 준 role 을 그대로 저장한다.
    role: 'ADMIN',
  }
}

export async function loginWithKakao(token: string): Promise<LoginResponse> {
  void token
  return Promise.resolve(getMockLoginResponse('kakao'))
}

export async function loginWithGoogle(token: string): Promise<LoginResponse> {
  void token
  return Promise.resolve(getMockLoginResponse('google'))
}
