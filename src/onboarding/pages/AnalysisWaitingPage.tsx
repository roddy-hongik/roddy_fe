import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLatestAnalysisStatus } from '../../api/services/reportService'
import { ROUTES, routePaths } from '../../routes/paths'
import '../styles/analysis-waiting-page.css'

const POLL_INTERVAL_MS = 2000
const MAX_POLL_COUNT = 150

function AnalysisWaitingPage() {
  const navigate = useNavigate()
  const [isCompleted, setIsCompleted] = useState(false)
  const [reportId, setReportId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    let timerId: number | undefined
    let pollCount = 0

    const poll = async () => {
      try {
        const report = await getLatestAnalysisStatus()
        if (!isMounted) {
          return
        }
        if (report.status === 'COMPLETED' && report.id !== null) {
          setReportId(report.id)
          setIsCompleted(true)
          return
        }
        if (report.status === 'FAILED') {
          setErrorMessage(report.failureReason || '분석에 실패했습니다. 다시 시도해 주세요.')
          return
        }
        pollCount += 1
        if (pollCount >= MAX_POLL_COUNT) {
          setErrorMessage('분석 시간이 길어지고 있습니다. 잠시 후 다시 확인해 주세요.')
          return
        }
        timerId = window.setTimeout(() => void poll(), POLL_INTERVAL_MS)
      } catch {
        if (isMounted) {
          setErrorMessage('분석 상태를 확인하지 못했습니다. 다시 시도해 주세요.')
        }
      }
    }

    void poll()

    return () => {
      isMounted = false
      if (timerId !== undefined) {
        window.clearTimeout(timerId)
      }
    }
  }, [])

  return (
    <main className="analysis-waiting-page">
      <section className="login-card analysis-waiting-card">
        <p className="brand-pill">Onboarding Step 3</p>
        <h1>기술 스택 분석 중</h1>

        {!isCompleted && !errorMessage && (
          <>
            <p className="analysis-waiting-copy">
              서버에서 GitHub 활동과 포트폴리오 정보를 기반으로 기술 스택을 분석하고 있습니다.
            </p>
            <div className="analysis-spinner" aria-hidden="true" />
            <p className="analysis-waiting-meta">잠시만 기다려 주세요...</p>
          </>
        )}

        {errorMessage ? (
          <div className="analysis-completed" role="alert">
            <p className="analysis-complete-title">분석을 완료하지 못했어요</p>
            <p className="analysis-complete-copy">{errorMessage}</p>
            <button type="button" className="analysis-view-button" onClick={() => navigate(ROUTES.profileReanalyze)}>
              다시 분석하기
            </button>
          </div>
        ) : null}

        {isCompleted && (
          <div className="analysis-completed" role="status" aria-live="polite">
            <p className="analysis-complete-title">완료되었어요</p>
            <p className="analysis-complete-copy">분석 결과를 바탕으로 대시보드를 준비했습니다.</p>
            <button
              type="button"
              className="analysis-view-button"
              onClick={() => navigate(reportId === null ? '/' : routePaths.reportDetailAnalysis(reportId))}
            >
              분석 보러가기
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

export default AnalysisWaitingPage
