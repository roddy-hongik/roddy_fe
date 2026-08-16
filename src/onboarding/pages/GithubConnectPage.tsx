import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getGithubAuthorizationUrl, getGithubConnectionStatus } from '../../api/services/onboardingService'
import { emitAuthChange } from '../../auth/utils/authEvents'
import { isGithubConnected, markGithubConnected } from '../../auth/utils/authStorage'
import '../styles/github-connect-page.css'

async function loadGithubConnectionState() {
  return getGithubConnectionStatus()
}

function GithubConnectPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isConnected, setIsConnected] = useState(isGithubConnected())
  const [isConnecting, setIsConnecting] = useState(false)
  const [showConnectedBadge, setShowConnectedBadge] = useState(isGithubConnected())
  const [connectionError, setConnectionError] = useState('')
  const [githubUrl, setGithubUrl] = useState<string | null>(null)

  const callbackStatus = searchParams.get('status')
  const callbackReason = searchParams.get('reason')

  useEffect(() => {
    let isMounted = true

    loadGithubConnectionState()
      .then((data) => {
        if (!isMounted) {
          return
        }

        setIsConnected(data.githubConnected)
        setGithubUrl(data.githubUrl)
        markGithubConnected(data.githubConnected)
        emitAuthChange()
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setConnectionError((current) => current || 'GitHub 연동 상태를 확인하지 못했습니다.')
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (callbackStatus !== 'success') {
      if (callbackStatus === 'error' && callbackReason) {
        setConnectionError(`GitHub 연동에 실패했습니다. (${callbackReason})`)
      }
      return
    }

    setShowConnectedBadge(true)
    setIsConnected(true)
    markGithubConnected(true)
    emitAuthChange()
    setConnectionError('')
  }, [callbackReason, callbackStatus])

  const canGoNext = useMemo(() => isConnected || callbackStatus === 'success', [callbackStatus, isConnected])

  const handleConnectGithub = async () => {
    if (isConnected || isConnecting) {
      return
    }

    setIsConnecting(true)
    setConnectionError('')

    try {
      const response = await getGithubAuthorizationUrl()
      window.location.assign(response.authorizationUrl)
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'GitHub 연동 URL을 가져오지 못했습니다.')
      setIsConnecting(false)
    }
  }

  return (
    <main className="github-connect-page">
      <section className="login-card github-connect-card">
        {showConnectedBadge && (
          <div className="github-float-check" role="status" aria-live="polite">
            <span className="check-icon" aria-hidden="true">
              ✓
            </span>
            GitHub 연동완료
          </div>
        )}

        <header className="github-connect-header">
          <p className="brand-pill">Onboarding Step 2</p>
          <h1>GitHub 연동</h1>
          <p className="github-connect-copy">
            Roddy가 GitHub 활동 기반으로 맞춤형 커리어 가이드를 제공할 수 있도록 계정을 연결해 주세요.
          </p>
        </header>

        <div className="github-connect-panel">
          <div className="github-badge" aria-hidden="true">
            GH
          </div>
          <div className="github-meta">
            <p className="github-title">GitHub 계정 연결</p>
            <p className="github-description">레포지토리, 커밋 이력, 기술 스택 분석을 위해 권한 동의가 필요합니다.</p>
            {githubUrl ? (
              <a href={githubUrl} target="_blank" rel="noreferrer">
                연결된 계정 보기
              </a>
            ) : null}
          </div>
        </div>

        <div className="github-actions">
          <button type="button" className="github-connect-button" onClick={() => void handleConnectGithub()} disabled={isConnecting || isConnected}>
            {isConnecting ? '연동 중...' : isConnected ? '연동 완료' : 'GitHub 연동하기'}
          </button>
          <button type="button" className="github-back-button" onClick={() => navigate('/onboarding')}>
            이전 단계
          </button>
        </div>

        {connectionError ? <p className="github-connect-copy">{connectionError}</p> : null}

        {canGoNext && (
          <div className="github-next-wrap">
            <button type="button" className="github-analyze-button" onClick={() => navigate('/onboarding/analysis-waiting')}>
              다음으로
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

export default GithubConnectPage
