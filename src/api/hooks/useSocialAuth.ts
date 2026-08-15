import { loginWithGoogle, loginWithKakao } from '../services/authService'

export async function requestSocialLogin(provider: 'kakao' | 'google', token: string) {
  if (provider === 'kakao') {
    return loginWithKakao(token)
  }

  return loginWithGoogle(token)
}
