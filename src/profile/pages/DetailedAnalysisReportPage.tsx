import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDetailedReport, getLatestDetailedReport } from '../../api/services/reportService'
import { ROUTES } from '../../routes/paths'
import CategoryScoreCard from '../components/CategoryScoreCard'
import ProfileTopNav from '../components/ProfileTopNav'
import ReportSummaryCard from '../components/ReportSummaryCard'
import TechStackSection from '../components/TechStackSection'
import type { DetailedReport } from '../types/report'

const normalizeStackKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

function DetailedAnalysisReportPage() {
  const navigate = useNavigate()
  const { reportId } = useParams()
  const [report, setReport] = useState<DetailedReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const parsedReportId = reportId ? Number(reportId) : null
    const isValidReportId = parsedReportId !== null && Number.isInteger(parsedReportId) && Number.isFinite(parsedReportId)
    const reportPromise = isValidReportId ? getDetailedReport(parsedReportId) : getLatestDetailedReport()

    reportPromise
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
  }, [reportId])

  if (isLoading) {
    return <p className="profile-meta-text">상세 분석 리포트를 준비하는 중...</p>
  }

  if (isError || !report) {
    return (
      <main className="profile-layout-shell">
        <ProfileTopNav />
        <section className="profile-layout-content profile-page profile-fade-in">
          <section className="profile-card">
            <header className="profile-card-header">
              <h1>상세 분석 데이터를 불러오지 못했습니다</h1>
              <p>리포트 데이터를 확인한 뒤 다시 시도해 주세요.</p>
            </header>
          </section>
        </section>
      </main>
    )
  }

  const discoveredStacks = [...report.githubStacks, ...report.resumeStacks]
  const normalizedDiscoveredStacks = discoveredStacks.map(normalizeStackKey)
  const missingStacks = Array.from(
    new Set(
      report.categories
        .flatMap((category) => category.detailStacks)
        .filter((stack) => {
          const normalizedRequiredStack = normalizeStackKey(stack)
          return !normalizedDiscoveredStacks.some((discoveredStack) => normalizedRequiredStack.includes(discoveredStack))
        }),
    ),
  )

  return (
    <main className="profile-layout-shell">
      <ProfileTopNav />
      <section className="profile-layout-content profile-page profile-fade-in">
        <section className="profile-card">
          <header className="profile-card-header">
            <h1>상세 분석 리포트</h1>
            <p>GitHub와 이력서 기준으로 추출한 스택과 카테고리별 점수를 한 번에 확인합니다.</p>
          </header>

        <div className="report-detail-grid report-detail-grid-single">
          <ReportSummaryCard report={report} />
        </div>

        <div className="report-stack-grid">
          <TechStackSection title="GitHub에서 확인한 기술 스택" stacks={report.githubStacks} />
          <TechStackSection title="이력서에서 확인한 기술 스택" stacks={report.resumeStacks} />
        </div>

        <section className="report-categories-grid">
          {report.categories.map((category) => (
            <CategoryScoreCard key={category.name} category={category} />
          ))}
        </section>

        <section className="report-section report-missing-section glass-style">
          <div className="report-section-title">
            <h2>나에게 없는 기술 스택</h2>
          </div>
          <p className="report-overview-copy">현재 GitHub와 이력서에서 직접 확인되지 않은 보완 필요 스택입니다.</p>
          <div className="report-chip-wrap">
            {missingStacks.length > 0 ? (
              missingStacks.map((stack) => (
                <span key={stack} className="report-chip">
                  {stack}
                </span>
              ))
            ) : (
              <span className="report-chip">현재 기준 부족 기술 스택 없음</span>
            )}
          </div>
        </section>

        <section className="report-cta-section glass-style">
          <div>
            <h2>최신 기준으로 다시 분석해보세요.</h2>
            <p className="profile-meta-text">이력서와 GitHub 변경사항을 반영해 새 리포트를 생성하고 결제로 이어집니다.</p>
          </div>
          <button type="button" className="profile-action-btn report-primary-cta" onClick={() => navigate(ROUTES.reportsPayment)}>
            다시 분석하기
          </button>
        </section>
      </section>
      </section>
    </main>
  )
}

export default DetailedAnalysisReportPage
