import type { LoginResponse, SocialProvider } from '../types/auth'

const getMockLoginResponse = (provider: SocialProvider): LoginResponse => {
  const isOnboard = localStorage.getItem('isOnboard') === 'true'
  const githubConnected = localStorage.getItem('githubConnected') === 'true'

  return {
    accessToken: `mock-${provider}-access-token`,
    refreshToken: `mock-${provider}-refresh-token`,
    isOnboard,
    githubConnected,
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
