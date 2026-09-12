import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import { AUTH_CHANGE_EVENT } from '../../auth/utils/authEvents'
import AppTopNav from '../../shared/components/AppTopNav'
import JobScrapButton from '../components/JobScrapButton'
import { getJobPosting } from '../services/jobPostingService'
import type { JobPostingDetail } from '../types/jobPosting'
import { formatDeadline, formatPostedAt, orNotProvided } from '../utils/jobFormat'
import '../styles/job-pages.css'

/** 어느 요청의 결과인지 함께 들고 있으면 로딩/에러를 따로 저장하지 않고 지금 화면과 비교해 가려낼 수 있다. */
type DetailResult = {
  requestKey: string
  job: JobPostingDetail | null
  isError: boolean
}

const toRequestKey = (jobId: string, isLoggedIn: boolean) => `${jobId}::${isLoggedIn}`

function JobPostingDetailPage() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  const [result, setResult] = useState<DetailResult | null>(null)
  const [isScrapPending, setIsScrapPending] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('accessToken')))

  /** 먼저 떠난 요청이 나중에 도착해 최신 화면을 덮어쓰지 않도록 한다. */
  const requestIdRef = useRef(0)

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

  const requestKey = jobId ? toRequestKey(jobId, isLoggedIn) : ''

  useEffect(() => {
    if (!jobId) {
      return
    }

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    getJobPosting(jobId)
      .then((response) => {
        if (requestIdRef.current !== requestId) {
          return
        }

        setResult({ requestKey, job: response, isError: false })
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) {
          return
        }

        setResult({ requestKey, job: null, isError: true })
      })

    return () => {
      requestIdRef.current += 1
    }
  }, [jobId, requestKey])

  /** 지금 보고 있는 조건의 응답만 화면에 쓴다. 아직 없으면 그게 곧 로딩 중이라는 뜻이다. */
  const currentResult = result && result.requestKey === requestKey ? result : null
  const isLoading = currentResult === null
  const isError = currentResult?.isError ?? false
  const job = currentResult?.job ?? null

  const handleScrapToggled = (isScrapped: boolean) => {
    setResult((previous) => (previous?.job ? { ...previous, job: { ...previous.job, isScrapped } } : previous))
  }

  const topNav = <AppTopNav loginRedirectPath={ROUTES.jobs} />

  const backToList = (
    <div className="detail-toolbar">
      <button type="button" className="detail-back-button" onClick={() => navigate(ROUTES.jobs)}>
        목록으로
      </button>
    </div>
  )

  if (isLoading) {
    return (
      <main className="jobs-page detail-page">
        {topNav}
        {backToList}
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
        {backToList}
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

  return (
    <main className="jobs-page detail-page">
      {topNav}
      {backToList}

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
                  disabled={isScrapPending}
                  onToggled={handleScrapToggled}
                  onTogglingChange={setIsScrapPending}
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
              disabled={isScrapPending}
              onToggled={handleScrapToggled}
              onTogglingChange={setIsScrapPending}
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
