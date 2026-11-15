import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { loginWithSocial } from '../../api/services/authService'
import { emitAuthChange } from '../../auth/utils/authEvents'
import { storeAuthSession } from '../../auth/utils/authStorage'
import { SocialLoginError, completeSocialLogin, isSocialProvider } from '../../auth/utils/socialOAuth'
import { ROUTES } from '../../routes/paths'
import '../styles/login-page.css'

const resolveNextPath = (isOnboard: boolean, githubConnected: boolean, returnPath: string) => {
  if (!isOnboard) return ROUTES.onboarding
  if (!githubConnected) return ROUTES.onboardingGithub
  return returnPath
}

const toBackendErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : ''
  // httpClient 는 "HTTP 400 [CODE]: 메시지" 모양으로 던진다. 사용자에게는 메시지만 보여 준다.
  const serverMessage = message.replace(/^HTTP \d+(?: \[[^\]]+\])?: /, '').trim()
  return serverMessage || '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.'
}

/** 구글·카카오 로그인 창에서 돌아오는 화면. 제공자 토큰을 백엔드에 넘기고 Roddy 세션을 저장한다. */
function OAuthCallbackPage() {
  const { provider } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // 개발 모드 StrictMode 가 effect 를 두 번 돌린다. 카카오 인가 코드는 한 번만 쓸 수 있어서 막는다.
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    if (!isSocialProvider(provider)) {
      setErrorMessage('지원하지 않는 로그인 방식입니다.')
      return
    }

    const run = async () => {
      let returnPath: string
      let providerAccessToken: string
      try {
        ;({ providerAccessToken, returnPath } = await completeSocialLogin(provider, location))
      } catch (error) {
        setErrorMessage(error instanceof SocialLoginError ? error.message : '로그인에 실패했습니다.')
        return
      }

      try {
        const response = await loginWithSocial(provider, providerAccessToken)
        storeAuthSession(response)
        emitAuthChange()
        navigate(resolveNextPath(response.isOnboard, response.githubConnected, returnPath), { replace: true })
      } catch (error) {
        setErrorMessage(toBackendErrorMessage(error))
      }
    }

    void run()
    // 콜백 주소에 처음 들어왔을 때 한 번만 처리한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="login-page">
      <section className="login-card" aria-live="polite">
        {errorMessage ? (
          <>
            <h1 className="oauth-callback-title">로그인하지 못했습니다</h1>
            <p className="oauth-callback-message" role="alert">
              {errorMessage}
            </p>
            <Link className="oauth-callback-retry" to={ROUTES.login} replace>
              로그인 화면으로
            </Link>
          </>
        ) : (
          <>
            <h1 className="oauth-callback-title">로그인 중입니다</h1>
            <p className="oauth-callback-message">잠시만 기다려 주세요.</p>
          </>
        )}
      </section>
    </main>
  )
}

export default OAuthCallbackPage
