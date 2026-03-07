import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/github-connect-page.css'

function GithubConnectPage() {
  const navigate = useNavigate()
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnectGithub = () => {
    if (isConnected || isConnecting) {
      return
    }

    setIsConnecting(true)

    window.setTimeout(() => {
      setIsConnecting(false)
      setIsConnected(true)
    }, 900)
  }

  return (
    <main className="github-connect-page">
      <section className="login-card github-connect-card">
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
          </div>
        </div>

        <div className="github-actions">
          <button type="button" className="github-connect-button" onClick={handleConnectGithub} disabled={isConnecting || isConnected}>
            {isConnecting ? '연동 중...' : isConnected ? '연동 완료' : 'GitHub 연동하기'}
          </button>
          <button type="button" className="github-back-button" onClick={() => navigate('/onboarding')}>
            이전 단계
          </button>
        </div>

        {isConnected && (
          <div className="github-connected-check" role="status" aria-live="polite">
            <span className="check-icon" aria-hidden="true">
              ✓
            </span>
            GitHub 연동완료
          </div>
        )}
      </section>
    </main>
  )
}

export default GithubConnectPage
