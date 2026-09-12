import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import { AUTH_CHANGE_EVENT } from '../../auth/utils/authEvents'
import AppTopNav from '../../shared/components/AppTopNav'
import JobScrapButton from '../components/JobScrapButton'
import { getJobPosting } from '../services/jobPostingService'
import type { JobPostingDetail } from '../types/jobPosting'
import { formatDeadline, formatPostedAt, orNotProvided } from '../utils/jobFormat'
import '../styles/job-pages.css'

function JobPostingDetailPage() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  const [job, setJob] = useState<JobPostingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('accessToken')))

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

  useEffect(() => {
    if (!jobId) {
      return
    }

    let isMounted = true
    setIsLoading(true)
    setIsError(false)

    getJobPosting(jobId)
      .then((response) => {
        if (!isMounted) {
          return
        }

        setJob(response)
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setJob(null)
        setIsError(true)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [jobId, isLoggedIn])

  const topNav = (
    <AppTopNav
      loginRedirectPath={ROUTES.jobs}
      rightSlot={
        <button type="button" className="app-top-nav__action-button" onClick={() => navigate(ROUTES.jobs)}>
          목록으로
        </button>
      }
    />
  )

  if (isLoading) {
    return (
      <main className="jobs-page detail-page">
        {topNav}
        <section className="detail-layout">
          <article className="glass-panel detail-main">
            <p className="detail-note">공고를 불러오는 중입니다.</p>
          </article>
        </section>
      </main>
    )
  }

  if (isError || !job) {
    return (
      <main className="jobs-page detail-page">
        {topNav}
        <section className="detail-layout">
          <article className="glass-panel detail-main">
            <p className="detail-note">공고를 찾을 수 없습니다. 마감되었거나 삭제된 공고일 수 있습니다.</p>
            <button type="button" className="apply-btn-large" onClick={() => navigate(ROUTES.jobs)}>
              목록으로 돌아가기
            </button>
          </article>
        </section>
      </main>
    )
  }

  const handleScrapToggled = (isScrapped: boolean) => {
    setJob((previous) => (previous ? { ...previous, isScrapped } : previous))
  }

  return (
    <main className="jobs-page detail-page">
      {topNav}

      <section className="detail-layout">
        <article className="glass-panel detail-main">
          <div className="detail-badge-row">
            {job.workType ? <span>{job.workType}</span> : null}
            {job.status === 'CLOSED' ? <span>마감된 공고</span> : null}
            <span>마감 {formatDeadline(job.deadline)}</span>
          </div>

          <h1>{job.title}</h1>
          <p className="detail-company">{job.company}</p>

          <section className="hero-highlight">
            <div>
              <p className="label">지금 공고와 사용자 스택 적합도</p>
              <p className="detail-note">
                {isLoggedIn
                  ? '매칭 분석 기능은 준비 중입니다.'
                  : '로그인 후 공고를 스크랩하고 매칭 분석을 받아볼 수 있습니다.'}
              </p>
            </div>
            <div className="detail-hero-actions">
              {isLoggedIn ? (
                <JobScrapButton
                  jobPostingId={job.id}
                  isScrapped={job.isScrapped}
                  className="detail-scrap-button"
                  onToggled={handleScrapToggled}
                />
              ) : null}
              <a className="apply-btn-large" href={job.applyUrl} target="_blank" rel="noreferrer noopener">
                지원하기
              </a>
            </div>
          </section>

          <section className="detail-section">
            <h2>공고 내용</h2>
            {job.content ? (
              <p className="detail-content">{job.content}</p>
            ) : (
              <p className="detail-note">
                이 공고의 본문은 아직 수집되지 않았습니다. 지원하기를 눌러 채용 사이트에서 확인해주세요.
              </p>
            )}
          </section>
        </article>

        <aside className="glass-panel detail-side">
          <h2>지원 정보</h2>
          <div className="side-meta">
            <p>
              <span>직무</span>
              <strong>{orNotProvided(job.recruitField)}</strong>
            </p>
            <p>
              <span>경력</span>
              <strong>{orNotProvided(job.experience)}</strong>
            </p>
            <p>
              <span>근무지</span>
              <strong>{orNotProvided(job.location)}</strong>
            </p>
            <p>
              <span>근무 형태</span>
              <strong>{orNotProvided(job.workType)}</strong>
            </p>
            <p>
              <span>등록일</span>
              <strong>{formatPostedAt(job.postedAt) || '정보 없음'}</strong>
            </p>
          </div>

          {isLoggedIn ? (
            <JobScrapButton
              jobPostingId={job.id}
              isScrapped={job.isScrapped}
              className="detail-side-scrap-button"
              onToggled={handleScrapToggled}
            />
          ) : null}
          <a className="apply-btn-large full" href={job.applyUrl} target="_blank" rel="noreferrer noopener">
            채용 사이트에서 지원
          </a>
        </aside>
      </section>
    </main>
  )
}

export default JobPostingDetailPage
