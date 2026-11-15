import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { SocialProvider } from '../../api/types/auth'
import { SocialLoginError, startSocialLogin, toSafeReturnPath } from '../../auth/utils/socialOAuth'
import { ROUTES } from '../../routes/paths'

type LoginLocationState = {
  from?: {
    pathname?: string
    search?: string
  }
}

function SocialLoginButtons() {
  const location = useLocation()
  const [movingProvider, setMovingProvider] = useState<SocialProvider | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 보호된 화면에서 온 경우는 라우터 state 로, 세션이 만료돼 튕긴 경우는 ?redirect= 로 원래 경로가 온다.
  const from = (location.state as LoginLocationState | null)?.from
  const returnPath =
    toSafeReturnPath(from?.pathname ? `${from.pathname}${from.search ?? ''}` : null) ??
    toSafeReturnPath(new URLSearchParams(location.search).get('redirect')) ??
    ROUTES.home

  const handleLoginClick = (provider: SocialProvider) => {
    setErrorMessage(null)
    try {
      setMovingProvider(provider)
      startSocialLogin(provider, returnPath)
    } catch (error) {
      setMovingProvider(null)
      setErrorMessage(error instanceof SocialLoginError ? error.message : '로그인을 시작하지 못했습니다.')
    }
  }

  return (
    <div className="social-wrap">
      <button className="social-btn kakao" type="button" onClick={() => handleLoginClick('kakao')} disabled={movingProvider !== null}>
        <span className="social-icon">K</span>
        {movingProvider === 'kakao' ? '카카오로 이동 중...' : '카카오로 로그인'}
      </button>
      <button className="social-btn google" type="button" onClick={() => handleLoginClick('google')} disabled={movingProvider !== null}>
        <span className="social-icon">G</span>
        {movingProvider === 'google' ? '구글로 이동 중...' : '구글로 로그인'}
      </button>
      {errorMessage ? (
        <p className="social-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}

export default SocialLoginButtons
