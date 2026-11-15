import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDetailedReport, getLatestDetailedReport } from '../../api/services/reportService'
import { getAnalysisSummary } from '../../api/services/roadmapService'
import { ROUTES } from '../../routes/paths'
import CategoryScoreCard from '../components/CategoryScoreCard'
import ReportSummaryCard from '../components/ReportSummaryCard'
import TechStackSection from '../components/TechStackSection'
import type { DetailedReport } from '../types/report'
import '../styles/profile-pages.css'

/** 부족 기술은 리포트가 아니라 로드맵 요약에서 온다. 최신 분석과 목표 직무의 모집 중 공고를 비교한 결과다. */
type GapSkillsState = { status: 'loading' } | { status: 'ready'; skills: string[] } | { status: 'unavailable' }

function DetailedAnalysisReportPage() {
  const navigate = useNavigate()
  const { reportId } = useParams()
  const [report, setReport] = useState<DetailedReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [gapSkills, setGapSkills] = useState<GapSkillsState>({ status: 'loading' })

  useEffect(() => {
    let isMounted = true

    getAnalysisSummary()
      .then((summary) => {
        if (isMounted) setGapSkills({ status: 'ready', skills: summary.gapSkills ?? [] })
      })
      .catch(() => {
        // 분석 리포트가 없거나 희망 직무가 비어 있으면 요약을 만들 수 없다.
        if (isMounted) setGapSkills({ status: 'unavailable' })
      })

    return () => {
      isMounted = false
    }
  }, [])

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

  return (
    <main className="profile-layout-shell">
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
          <p className="report-overview-copy">
            최신 분석 결과와 희망 직무의 모집 중인 채용공고를 비교해, 공고가 자주 요구하지만 아직 확인되지 않은 기술입니다.
          </p>
          <div className="report-chip-wrap">
            {gapSkills.status === 'loading' ? <span className="report-chip">불러오는 중...</span> : null}
            {gapSkills.status === 'unavailable' ? (
              <span className="report-chip">희망 직무와 분석 결과가 있어야 확인할 수 있습니다</span>
            ) : null}
            {gapSkills.status === 'ready' && gapSkills.skills.length > 0
              ? gapSkills.skills.map((stack) => (
                  <span key={stack} className="report-chip">
                    {stack}
                  </span>
                ))
              : null}
            {gapSkills.status === 'ready' && gapSkills.skills.length === 0 ? (
              <span className="report-chip">현재 기준 부족 기술 스택 없음</span>
            ) : null}
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
