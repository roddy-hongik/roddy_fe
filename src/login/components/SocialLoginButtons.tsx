import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { requestSocialLogin } from '../../api/hooks/useSocialAuth'
import { emitAuthChange } from '../../auth/utils/authEvents'
import { storeAuthSession } from '../../auth/utils/authStorage'
import { ROUTES } from '../../routes/paths'

type LoginLocationState = {
  from?: {
    pathname?: string
  }
}

function SocialLoginButtons() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmittingProvider, setIsSubmittingProvider] = useState<'kakao' | 'google' | null>(null)

  const redirectPath = (location.state as LoginLocationState | null)?.from?.pathname ?? ROUTES.home

  const resolveNextPath = (isOnboard: boolean, githubConnected: boolean) => {
    if (!isOnboard) {
      return ROUTES.onboarding
    }

    if (!githubConnected) {
      return ROUTES.onboardingGithub
    }

    return redirectPath
  }

  const handleLoginClick = async (provider: 'kakao' | 'google') => {
    setIsSubmittingProvider(provider)

    try {
      const response = await requestSocialLogin(provider, 'mock-social-access-token')
      storeAuthSession(response, '신애', 'admin')
      emitAuthChange()
      navigate(resolveNextPath(response.isOnboard, response.githubConnected), { replace: true })
    } finally {
      setIsSubmittingProvider(null)
    }
  }

  return (
    <div className="social-wrap">
      <button className="social-btn kakao" type="button" onClick={() => void handleLoginClick('kakao')} disabled={isSubmittingProvider !== null}>
        <span className="social-icon">K</span>
        {isSubmittingProvider === 'kakao' ? '로그인 중...' : '카카오로 로그인'}
      </button>
      <button className="social-btn google" type="button" onClick={() => void handleLoginClick('google')} disabled={isSubmittingProvider !== null}>
        <span className="social-icon">G</span>
        {isSubmittingProvider === 'google' ? '로그인 중...' : '구글로 로그인'}
      </button>
    </div>
  )
}

export default SocialLoginButtons
