import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getJobPostingMatch } from '../../api/services/jobService'
import { ROUTES } from '../../routes/paths'
import { AUTH_CHANGE_EVENT } from '../../auth/utils/authEvents'
import AppTopNav from '../../shared/components/AppTopNav'
import JobScrapButton from '../components/JobScrapButton'
import { jobPostings } from '../data/jobPostings'
import { toJobPostingPreview } from '../services/jobScrapService'
import type { JobPostingMatch } from '../types/jobMatching'
import '../styles/job-pages.css'

function JobPostingDetailPage() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('accessToken')))
  const [jobMatch, setJobMatch] = useState<JobPostingMatch | null>(null)
  const [loadedJobId, setLoadedJobId] = useState<string | null>(null)

  const job = useMemo(() => jobPostings.find((item) => item.id === jobId) ?? jobPostings[0], [jobId])
  const jobPreview = useMemo(() => toJobPostingPreview(job), [job])

  useEffect(() => {
    const syncLoginStatus = () => {
      setIsLoggedIn(Boolean(localStorage.getItem('accessToken')))
    }

    syncLoginStatus()
    window.addEventListener(AUTH_CHANGE_EVENT, syncLoginStatus)
    window.addEventListener('storage', syncLoginStatus)

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncLoginStatus)
      window.removeEventListener('storage', syncLoginStatus)
    }
  }, [])

  const averageGap = useMemo(() => {
    if (!isLoggedIn || !jobMatch || jobMatch.matchingInsights.length === 0) {
      return null
    }

    const totalGap = jobMatch.matchingInsights.reduce((acc, item) => acc + (item.userScore - item.requiredScore), 0)
    return Math.round(totalGap / jobMatch.matchingInsights.length)
  }, [isLoggedIn, jobMatch])

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    let isMounted = true
    const requestedJobId = job.id

    getJobPostingMatch(job.id)
      .then((response) => {
        if (!isMounted) {
          return
        }

        setJobMatch(response)
        setLoadedJobId(requestedJobId)
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setJobMatch(null)
        setLoadedJobId(requestedJobId)
      })

    return () => {
      isMounted = false
    }
  }, [isLoggedIn, job.id])

  const resolvedJobMatch = isLoggedIn && loadedJobId === job.id ? jobMatch : null
  const resolvedJobMatchLoading = isLoggedIn && loadedJobId !== job.id

  return (
    <main className="jobs-page detail-page">
      <AppTopNav
        loginRedirectPath={ROUTES.jobs}
        rightSlot={
          <button type="button" className="app-top-nav__action-button" onClick={() => navigate(ROUTES.jobs)}>
            목록으로
          </button>
        }
      />

      <section className="detail-layout">
        <article className="glass-panel detail-main">
          <div className="detail-badge-row">
            <span>{job.workType}</span>
            <span>마감 {job.deadline}</span>
            {jobPreview.matchingScore != null ? <span>추천 매칭률 {jobPreview.matchingScore}%</span> : null}
            {isLoggedIn && resolvedJobMatch ? <span>매칭률 {resolvedJobMatch.matchRate}%</span> : null}
          </div>

          <h1>{job.title}</h1>
          <p className="detail-company">{job.company}</p>
          <p className="detail-summary">{job.summary}</p>

          <section className="hero-highlight">
            <div>
              <p className="label">지금 공고와 사용자 스택 적합도</p>
              {isLoggedIn ? (
                resolvedJobMatchLoading ? (
                  <p className="detail-note">매칭 분석을 불러오는 중입니다.</p>
                ) : resolvedJobMatch && averageGap !== null ? (
                  <>
                    <strong className="hero-match">{resolvedJobMatch.matchRate}% Match</strong>
                    <p className="detail-note">핵심 스택 평균 대비 {averageGap >= 0 ? `+${averageGap}` : averageGap}점</p>
                  </>
                ) : (
                  <p className="detail-note">개인화된 매칭 분석을 아직 불러오지 못했습니다.</p>
                )
              ) : (
                <p className="detail-note">로그인 후 내 기술 스택과의 매칭률을 확인할 수 있습니다.</p>
              )}
            </div>
            <div className="detail-hero-actions">
              <JobScrapButton jobId={job.id} className="detail-scrap-button" />
              <button type="button" className="apply-btn-large">
                지원하기
              </button>
            </div>
          </section>

          {isLoggedIn ? (
            <section className="detail-section">
              <h2>기술 스택 매칭 분석</h2>
              {resolvedJobMatchLoading ? (
                <p className="detail-note">매칭 분석을 준비하고 있습니다.</p>
              ) : resolvedJobMatch ? (
                <div className="stack-fit-list">
                  {resolvedJobMatch.matchingInsights.map((insight) => {
                    const percentage = Math.max(insight.userScore, insight.requiredScore)
                    const scoreLine = Math.min(insight.userScore, 100)
                    return (
                      <article key={insight.stack} className="stack-fit-card">
                        <div className="stack-fit-head">
                          <h3>{insight.stack}</h3>
                          <p>
                            사용자 {insight.userScore} / 요구 {insight.requiredScore}
                          </p>
                        </div>
                        <div className="stack-progress-track" aria-hidden="true" style={{ width: `${percentage}%` }}>
                          <span style={{ width: `${scoreLine}%` }} />
                        </div>
                        <p className="stack-note">{insight.note}</p>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <p className="detail-note">로그인은 확인되었지만 개인화된 매칭 데이터를 가져오지 못했습니다.</p>
              )}
            </section>
          ) : null}

          <section className="detail-section">
            <h2>주요 업무</h2>
            <ul>
              {job.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="detail-section">
            <h2>자격 요건</h2>
            <ul>
              {job.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="detail-section">
            <h2>우대 사항</h2>
            <ul>
              {job.preferred.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

        </article>

        <aside className="glass-panel detail-side">
          <h2>지원 정보</h2>
          <div className="side-meta">
            <p>
              <span>직무</span>
              <strong>{job.team}</strong>
            </p>
            <p>
              <span>경력</span>
              <strong>{job.experience}</strong>
            </p>
            <p>
              <span>근무지</span>
              <strong>{job.location}</strong>
            </p>
            <p>
              <span>연봉</span>
              <strong>{job.salary}</strong>
            </p>
            <p>
              <span>근무 형태</span>
              <strong>{job.workType}</strong>
            </p>
          </div>

          <div className="tech-chip-wrap">
            {job.techStacks.map((stack) => (
              <span key={stack}>{stack}</span>
            ))}
          </div>

          <JobScrapButton jobId={job.id} className="detail-side-scrap-button" />
          <button type="button" className="apply-btn-large full">
            즉시 지원
          </button>
        </aside>
      </section>
    </main>
  )
}

export default JobPostingDetailPage
