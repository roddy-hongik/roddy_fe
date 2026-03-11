import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDetailedReport } from '../../api/services/reportService'
import { ROUTES, routePaths } from '../../routes/paths'
import ProfileTopNav from '../components/ProfileTopNav'
import ReportNav from '../components/ReportNav'
import ReportSummaryCard from '../components/ReportSummaryCard'
import TechStackSection from '../components/TechStackSection'
import type { DetailedReport } from '../types/report'

function ReportDetailPage() {
  const navigate = useNavigate()
  const { reportId } = useParams()
  const [report, setReport] = useState<DetailedReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const numericReportId = Number(reportId)

  useEffect(() => {
    let isMounted = true

    getDetailedReport(numericReportId)
      .then((data) => {
        if (!isMounted) {
          return
        }
        setReport(data)
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
  }, [numericReportId])

  if (isLoading) {
    return <p className="profile-meta-text">리포트를 불러오는 중...</p>
  }

  if (isError || !report) {
    return (
      <main className="profile-layout-shell">
        <ProfileTopNav />
        <section className="profile-layout-content profile-page profile-fade-in">
          <section className="profile-card">
            <header className="profile-card-header">
              <h1>리포트를 찾을 수 없습니다</h1>
              <p>선택한 리포트가 없거나 불러오기에 실패했습니다.</p>
            </header>
            <ReportNav />
            <button type="button" className="profile-action-btn" onClick={() => navigate(ROUTES.reports)}>
              내 리포트로 돌아가기
            </button>
          </section>
        </section>
      </main>
    )
  }

  return (
    <main className="profile-layout-shell">
      <ProfileTopNav />
      <section className="profile-layout-content profile-page profile-fade-in">
        <section className="profile-card">
          <header className="profile-card-header">
            <h1>리포트 상세</h1>
            <p>분석 요약과 기술 스택 출처를 확인하고 상세 분석으로 이어질 수 있습니다.</p>
          </header>

          <ReportNav reportId={report.id} />

          <div className="report-detail-grid">
            <ReportSummaryCard report={report} />

            <section className="report-section glass-style">
              <div className="report-section-title">
                <h2>카테고리 스냅샷</h2>
                <button
                  type="button"
                  className="profile-action-btn report-inline-cta"
                  onClick={() => navigate(routePaths.reportDetailAnalysis(report.id))}
                >
                  상세 분석 보기
                </button>
              </div>
              <div className="report-score-snapshot">
                {report.categories.map((category) => (
                  <div key={category.name} className="report-score-mini">
                    <span>{category.name}</span>
                    <strong>{category.score}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="report-stack-grid">
            <TechStackSection title="GitHub 기반 기술 스택" stacks={report.githubStacks} />
            <TechStackSection title="이력서 기반 기술 스택" stacks={report.resumeStacks} />
          </div>
        </section>
      </section>
    </main>
  )
}

export default ReportDetailPage
