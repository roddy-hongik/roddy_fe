import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AUTH_CHANGE_EVENT } from '../../auth/utils/authEvents'
import { routePaths } from '../../routes/paths'
import JobScrapButton from '../components/JobScrapButton'
import { getJobPostings } from '../services/jobPostingService'
import type { JobPostingSummary } from '../types/jobPosting'
import { formatDeadline, formatPostedAt, joinMeta, orNotProvided } from '../utils/jobFormat'
import '../styles/job-pages.css'

const PAGE_SIZE = 20
const HEADLINE_COUNT = 6
const SEARCH_DEBOUNCE_MS = 300

function JobPostingsPage() {
  const navigate = useNavigate()
  const [companyQuery, setCompanyQuery] = useState('')
  const [keyword, setKeyword] = useState('')
  const [jobs, setJobs] = useState<JobPostingSummary[]>([])
  /** 화면에 실제로 반영된 마지막 응답의 페이지. 요청이 성공해야만 앞으로 나간다. */
  const [page, setPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('accessToken')))

  /** 검색어가 바뀌는 사이에 먼저 떠난 요청이 나중에 도착해 화면을 덮어쓰지 않도록 한다. */
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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKeyword(companyQuery.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [companyQuery])

  const loadJobs = useCallback(async (nextPage: number, searchKeyword: string, shouldAppend: boolean) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    setIsLoading(true)
    setIsError(false)

    try {
      const response = await getJobPostings({
        keyword: searchKeyword || undefined,
        page: nextPage,
        size: PAGE_SIZE,
      })

      if (requestIdRef.current !== requestId) {
        return
      }

      setJobs((previous) => (shouldAppend ? [...previous, ...response.jobs] : response.jobs))
      setPage(nextPage)
      setTotalElements(response.totalElements)
      setTotalPages(response.totalPages)
    } catch {
      if (requestIdRef.current !== requestId) {
        return
      }

      setIsError(true)
      if (!shouldAppend) {
        setJobs([])
        setTotalElements(0)
        setTotalPages(0)
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadJobs(0, keyword, false)
  }, [keyword, loadJobs, isLoggedIn])

  const handleLoadMore = () => {
    loadJobs(page + 1, keyword, true)
  }

  const handleScrapToggled = (jobPostingId: number, isScrapped: boolean) => {
    setJobs((previous) =>
      previous.map((job) => (job.id === jobPostingId ? { ...job, isScrapped } : job)),
    )
  }

  const headlineJobs = useMemo(() => jobs.slice(0, HEADLINE_COUNT), [jobs])
  const hasMore = page + 1 < totalPages
  const isInitialLoading = isLoading && jobs.length === 0

  return (
    <main className="jobs-page">
      <section className="jobs-content">
        <div className="jobs-main-panel">
          <section className="glass-panel search-summary-panel">
            <div className="summary-header">
              <h1>채용공고 탐색</h1>
              <p>회사 채용 사이트에서 직접 수집한 공고를 최신순으로 보여줍니다.</p>
            </div>

            <div className="company-search-block">
              <input
                type="search"
                value={companyQuery}
                placeholder="회사명 또는 공고 제목으로 검색해보세요"
                aria-label="회사명 또는 공고 제목 검색"
                onChange={(event) => setCompanyQuery(event.target.value)}
              />
              <span>{totalElements}건</span>
            </div>

            {isInitialLoading ? (
              <p className="empty-result">공고를 불러오는 중입니다.</p>
            ) : isError ? (
              <p className="empty-result">공고를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
            ) : jobs.length === 0 ? (
              <p className="empty-result">검색어와 일치하는 회사 공고가 없습니다.</p>
            ) : (
              <div className="headline-grid">
                {headlineJobs.map((job) => (
                  <article key={job.id} className="headline-card">
                    <div className="headline-card-top">
                      <p className="company">{job.company}</p>
                      <JobScrapButton
                        jobPostingId={job.id}
                        isScrapped={job.isScrapped}
                        onToggled={(isScrapped) => handleScrapToggled(job.id, isScrapped)}
                      />
                    </div>
                    {/* 카드 전체 onClick 대신 링크를 둬서 키보드와 스크린 리더로도 상세로 갈 수 있게 한다. */}
                    <Link className="headline-card-link" to={routePaths.jobDetail(String(job.id))}>
                      <h2>{job.title}</h2>
                      <p className="meta">{joinMeta(job.location, job.experience, job.workType)}</p>
                      <p className="match">
                        {isLoggedIn ? '상세에서 공고 내용 확인' : '로그인 후 스크랩할 수 있어요'}
                      </p>
                      <p className="deadline">
                        등록 {formatPostedAt(job.postedAt) || '-'} · 마감 {formatDeadline(job.deadline)}
                      </p>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="glass-panel jobs-table-panel">
            <h2>전체 공고</h2>
            <div className="jobs-table-list">
              {jobs.map((job) => (
                <article key={job.id} className="jobs-row-card">
                  <button type="button" className="jobs-row" onClick={() => navigate(routePaths.jobDetail(String(job.id)))}>
                    <span>{job.company}</span>
                    <strong>{job.title}</strong>
                    <span>{orNotProvided(job.experience)}</span>
                    <span>{orNotProvided(job.location)}</span>
                    <span className="row-match">마감 {formatDeadline(job.deadline)}</span>
                  </button>
                  <JobScrapButton
                    jobPostingId={job.id}
                    isScrapped={job.isScrapped}
                    className="jobs-row-scrap-button"
                    onToggled={(isScrapped) => handleScrapToggled(job.id, isScrapped)}
                  />
                </article>
              ))}
            </div>

            {hasMore ? (
              <button type="button" className="jobs-load-more" disabled={isLoading} onClick={handleLoadMore}>
                {isLoading ? '불러오는 중...' : '더 보기'}
              </button>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  )
}

export default JobPostingsPage
