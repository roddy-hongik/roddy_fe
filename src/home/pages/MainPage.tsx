import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getDashboardData } from '../../api/services/dashboardService'
import { ROUTES, routePaths } from '../../routes/paths'
import type { DashboardData } from '../../api/types/dashboard'
import '../styles/main-page.css'

const getRadarLabel = (subject: string) => {
  if (subject.includes('Data Modeling')) {
    return 'Data Modeling'
  }
  if (subject.includes('Architecture')) {
    return 'Architecture'
  }
  if (subject.includes('Scalability')) {
    return 'Scalability'
  }
  if (subject.includes('Stability')) {
    return 'Stability'
  }
  if (subject.includes('DevOps')) {
    return 'DevOps/CI-CD'
  }
  if (subject.includes('Monitoring')) {
    return 'Monitoring'
  }

  return subject
}

function MainPage() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('accessToken')))
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [chartAnimationKey, setChartAnimationKey] = useState(0)

  useEffect(() => {
    const syncLoginStatus = () => {
      setIsLoggedIn(Boolean(localStorage.getItem('accessToken')))
    }

    syncLoginStatus()
    window.addEventListener('storage', syncLoginStatus)

    return () => {
      window.removeEventListener('storage', syncLoginStatus)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      setDashboardData(null)
      setHoveredCategory(null)
      return
    }

    let isMounted = true

    getDashboardData()
      .then((data) => {
        if (!isMounted) {
          return
        }

        setDashboardData(data)
        setChartAnimationKey((prev) => prev + 1)
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setDashboardData(null)
      })

    return () => {
      isMounted = false
    }
  }, [isLoggedIn])

  const userName = useMemo(() => {
    if (dashboardData?.userName) {
      return dashboardData.userName
    }

    return localStorage.getItem('userName') ?? '신애'
  }, [dashboardData])

  const handleLoginRedirect = () => {
    navigate(ROUTES.login, { state: { from: { pathname: ROUTES.home } } })
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userName')
    setIsLoggedIn(false)
    navigate(ROUTES.login, { replace: true })
  }

  const handleOpenJobPosting = (jobId: string) => {
    navigate(routePaths.jobDetail(jobId))
  }

  const handleOpenDetailedReport = () => {
    navigate(ROUTES.reportsDetailAnalysis)
  }

  const radarMetrics = dashboardData?.radarMetrics ?? [
    { subject: 'Data Modeling', score: 0, fullMark: 100 },
    { subject: 'Architecture', score: 0, fullMark: 100 },
    { subject: 'Scalability', score: 0, fullMark: 100 },
    { subject: 'Stability', score: 0, fullMark: 100 },
    { subject: 'DevOps/CI·CD', score: 0, fullMark: 100 },
    { subject: 'Monitoring', score: 0, fullMark: 100 },
  ]

  const radarDetails = dashboardData?.radarDetails ?? []
  const chartRadarMetrics = radarMetrics.map((metric) => ({
    ...metric,
    chartLabel: getRadarLabel(metric.subject),
  }))
  const activeRadarDetail = useMemo(() => {
    if (hoveredCategory) {
      return radarDetails.find((detail) => getRadarLabel(detail.subject) === hoveredCategory) ?? radarDetails[0] ?? null
    }

    return radarDetails[0] ?? null
  }, [hoveredCategory, radarDetails])

  const recommendedJobs = dashboardData?.recommendedJobs ?? []
  const techKeywords = dashboardData?.techKeywords ?? []
  const matchPercent = dashboardData?.matchRate.percent ?? 0
  const bestMatchedJob = recommendedJobs[0] ?? null

  return (
    <main className="main-page">
      <header className="main-nav">
        <div className="nav-left">
          <button type="button" className="brand-anchor" aria-label="Roddy 메인으로 이동" onClick={() => navigate(ROUTES.home)}>
            <div className="roddy-logo">
              <span className="logo-ear left" />
              <span className="logo-ear right" />
              <span className="logo-face" />
            </div>
            <strong>Roddy</strong>
          </button>
          <nav className="main-menu" aria-label="main menu">
            <button type="button" className="nav-link nav-link-active" onClick={() => navigate(ROUTES.home)}>
              홈
            </button>
            <button type="button" className="nav-link" onClick={() => navigate(ROUTES.jobs)}>
              채용공고
            </button>
            <button type="button" className="nav-link" onClick={() => navigate(ROUTES.community)}>
              커뮤니티
            </button>
          </nav>
        </div>

        <div className="nav-right">
          {isLoggedIn ? (
            <>
              <button type="button" className="nav-link nav-page-btn" onClick={() => navigate(ROUTES.profile)}>
                마이페이지
              </button>
              <span className="nav-divider">|</span>
              <span className="user-name">{userName}님</span>
              <span className="nav-divider">|</span>
              <button type="button" className="logout-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <button type="button" className="logout-btn" onClick={handleLoginRedirect}>
              로그인
            </button>
          )}
        </div>
      </header>

      <section className="hero">
        <div className={`hero-content ${isLoggedIn ? '' : 'is-blurred'}`}>
          <div className="hero-top">
            <section className="glass-panel chart-panel">
              <h2>기술 스택 대시보드</h2>
              <p className="chart-guide">육각형 그래프 카테고리에 마우스를 올리면 상세 기술 분석이 오른쪽에 표시됩니다.</p>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    key={chartAnimationKey}
                    outerRadius="74%"
                    data={chartRadarMetrics}
                    onMouseMove={(state) => {
                      const label = state?.activeLabel
                      if (typeof label === 'string') {
                        setHoveredCategory(label)
                      }
                      if (typeof label === 'number') {
                        setHoveredCategory(String(label))
                      }
                    }}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <PolarGrid stroke="rgba(178, 203, 255, 0.34)" />
                    <PolarAngleAxis dataKey="chartLabel" tick={{ fill: '#dbe7ff', fontSize: 16, fontWeight: 600 }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#79a8ff"
                      fill="#79a8ff"
                      fillOpacity={0.45}
                      strokeWidth={2.4}
                      isAnimationActive
                      animationBegin={120}
                      animationDuration={1400}
                      animationEasing="ease-out"
                    />
                    <Tooltip cursor={false} content={() => null} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <aside className="glass-panel analysis-panel">
              <h2>분석 내용</h2>

              <article className="info-card active-detail">
                <p className="label">현재 포커스</p>
                <h3>{activeRadarDetail?.subject ?? 'Data Modeling'}</h3>
                <p className="score-line">
                  현재 {activeRadarDetail?.current ?? 0} / 목표 {activeRadarDetail?.target ?? 0}
                </p>
                <p className="detail-note">{activeRadarDetail?.note ?? '로그인 시 상세 분석 정보를 확인할 수 있습니다.'}</p>
                <div className="tags">
                  {(activeRadarDetail?.relatedStacks ?? []).map((stack) => (
                    <span key={stack}>{stack}</span>
                  ))}
                </div>
              </article>

              <article className="info-card compact-card">
                <h3>분석된 기술</h3>
                <div className="keyword-wrap">
                  {techKeywords.map((keyword) => (
                    <span key={keyword} className="keyword-tag">
                      {keyword}
                    </span>
                  ))}
                </div>
              </article>

              <button type="button" className="analysis-report-btn" onClick={handleOpenDetailedReport}>
                상세 리포트 확인하기
              </button>
            </aside>
          </div>

          <section className="hero-bottom">
            <article className="glass-panel compact-card bottom-card merged-card">
              <h3>전체 매칭률</h3>
              <strong className="match-rate">{matchPercent}%</strong>
              <p className="match-desc">
                {dashboardData?.matchRate.targetRole ?? '-'} · {dashboardData?.matchRate.targetCompany ?? '-'}
              </p>
              <div className="progress-track" aria-hidden="true">
                <span className="progress-value" style={{ width: `${matchPercent}%` }} />
              </div>
              {bestMatchedJob ? (
                <button type="button" className="job-action-btn dashboard-job-action" onClick={() => handleOpenJobPosting(bestMatchedJob.id)}>
                  최고 매칭 공고 보기
                </button>
              ) : null}

              <h3 className="job-section-title">추천 채용공고</h3>
              <div className="job-list">
                {recommendedJobs.map((job) => (
                  <article key={job.id} className="job-card">
                    <p className="company">{job.company}</p>
                    <p className="title">{job.title}</p>
                    <p className="meta">매칭 {job.matchPercent}%</p>
                    <button type="button" className="job-action-btn" onClick={() => handleOpenJobPosting(job.id)}>
                      공고 보러가기
                    </button>
                  </article>
                ))}
              </div>
            </article>
          </section>
        </div>

        {!isLoggedIn && (
          <div className="login-overlay" role="presentation">
            <div className="overlay-content">
              <p>로그인 후 나의 기술 스택 점수를 확인해보세요!</p>
              <button type="button" onClick={handleLoginRedirect}>
                로그인 하러 가기
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default MainPage
