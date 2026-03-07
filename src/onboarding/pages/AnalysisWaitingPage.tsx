import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/analysis-waiting-page.css'

function AnalysisWaitingPage() {
  const navigate = useNavigate()
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setIsCompleted(true)
    }, 2600)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [])

  return (
    <main className="analysis-waiting-page">
      <section className="login-card analysis-waiting-card">
        <p className="brand-pill">Onboarding Step 3</p>
        <h1>기술 스택 분석 중</h1>

        {!isCompleted && (
          <>
            <p className="analysis-waiting-copy">
              서버에서 GitHub 활동과 포트폴리오 정보를 기반으로 기술 스택을 분석하고 있습니다.
            </p>
            <div className="analysis-spinner" aria-hidden="true" />
            <p className="analysis-waiting-meta">잠시만 기다려 주세요...</p>
          </>
        )}

        {isCompleted && (
          <div className="analysis-completed" role="status" aria-live="polite">
            <p className="analysis-complete-title">완료되었어요</p>
            <p className="analysis-complete-copy">분석 결과를 바탕으로 대시보드를 준비했습니다.</p>
            <button type="button" className="analysis-view-button" onClick={() => navigate('/')}>
              분석 보러가기
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

export default AnalysisWaitingPage
