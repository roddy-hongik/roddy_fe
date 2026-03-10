import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyReports } from '../../api/services/reportService'
import { ROUTES, routePaths } from '../../routes/paths'
import ProfileTopNav from '../components/ProfileTopNav'
import ReportNav from '../components/ReportNav'
import ReportSummaryCard from '../components/ReportSummaryCard'
import type { DetailedReport } from '../types/report'

function MyReportsPage() {
  const navigate = useNavigate()
  const [reports, setReports] = useState<DetailedReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    let isMounted = true

    getMyReports()
      .then((data) => {
        if (!isMounted) {
          return
        }
        setReports(data)
        setIsError(false)
      })
      .catch(() => {
        if (isMounted) {
          setIsError(true)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="profile-layout-shell">
      <ProfileTopNav />
      <section className="profile-layout-content profile-page profile-fade-in">
        <section className="profile-card">
          <header className="profile-card-header">
            <h1>내 리포트</h1>
            <p>지금까지 분석한 리포트를 모아보고 원하는 리포트 상세로 이동할 수 있습니다.</p>
          </header>

          <ReportNav />

          {isLoading ? <p className="profile-meta-text">리포트를 불러오는 중...</p> : null}
          {isError ? <p className="profile-error-text">리포트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p> : null}
          {!isLoading && !isError && reports.length === 0 ? (
            <div className="report-empty-state glass-style">
              <p>아직 생성된 리포트가 없습니다.</p>
              <button type="button" className="profile-action-btn" onClick={() => navigate(ROUTES.profileReanalyze)}>
                첫 분석 시작하기
              </button>
            </div>
          ) : null}

          <div className="report-list-grid">
            {reports.map((report) => (
              <button
                key={report.id}
                type="button"
                className="report-list-button"
                onClick={() => navigate(routePaths.reportDetailAnalysis(report.id))}
              >
                <ReportSummaryCard report={report} />
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default MyReportsPage
