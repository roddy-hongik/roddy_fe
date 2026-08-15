import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AUTH_CHANGE_EVENT } from '../../auth/utils/authEvents'
import { formatDateLabel } from '../../shared/utils/dateFormat'
import { routePaths } from '../../routes/paths'
import JobScrapButton from '../components/JobScrapButton'
import { jobPostings } from '../data/jobPostings'
import { toJobPostingPreview } from '../services/jobScrapService'
import '../styles/job-pages.css'

const HANGUL_BASE = 0xac00
const HANGUL_LAST = 0xd7a3
const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

const normalizeText = (value: string) => value.toLowerCase().replace(/\s+/g, '')

const extractChoseong = (value: string) =>
  Array.from(value)
    .map((char) => {
      const code = char.charCodeAt(0)
      if (code < HANGUL_BASE || code > HANGUL_LAST) {
        return char
      }
      const index = Math.floor((code - HANGUL_BASE) / 588)
      return CHOSEONG[index] ?? char
    })
    .join('')
    .replace(/\s+/g, '')

function JobPostingsPage() {
  const navigate = useNavigate()
  const [companyQuery, setCompanyQuery] = useState('')
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

  const filteredJobs = useMemo(() => {
    const trimmedQuery = companyQuery.trim()
    const normalizedQuery = normalizeText(trimmedQuery)
    const choseongQuery = extractChoseong(trimmedQuery)

    if (!normalizedQuery) {
      return jobPostings
    }

    return jobPostings.filter((job) => {
      const companyText = normalizeText(job.company)
      const titleText = normalizeText(job.title)
      const companyChoseong = extractChoseong(job.company)
      const titleChoseong = extractChoseong(job.title)

      return (
        companyText.includes(normalizedQuery) ||
        titleText.includes(normalizedQuery) ||
        companyChoseong.includes(choseongQuery) ||
        titleChoseong.includes(choseongQuery)
      )
    })
  }, [companyQuery])

  const topPostings = useMemo(() => filteredJobs.slice(0, 6), [filteredJobs])
  const topPostingPreviews = useMemo(() => topPostings.map(toJobPostingPreview), [topPostings])
  const filteredJobPreviews = useMemo(() => filteredJobs.map(toJobPostingPreview), [filteredJobs])

  return (
    <main className="jobs-page">
      <section className="jobs-content">
        <div className="jobs-main-panel">
          <section className="glass-panel search-summary-panel">
            <div className="summary-header">
              <h1>채용공고 탐색</h1>
              <p>로디 사용자 기술 스택 기준으로 매칭률 높은 공고를 우선 정렬합니다.</p>
            </div>

            <div className="company-search-block">
              <input
                type="search"
                value={companyQuery}
                placeholder="회사명 또는 공고 제목으로 검색해보세요"
                aria-label="회사명 또는 공고 제목 검색"
                onChange={(event) => setCompanyQuery(event.target.value)}
              />
              <span>{filteredJobs.length}건</span>
            </div>

            {filteredJobs.length > 0 ? (
              <div className="headline-grid">
                {topPostingPreviews.map((job) => (
                  <article key={job.id} className="headline-card" onClick={() => navigate(routePaths.jobDetail(job.id))}>
                    <div className="headline-card-top">
                      <p className="company">{job.company}</p>
                      <JobScrapButton jobId={job.id} />
                    </div>
                    <h2>{job.title}</h2>
                    <p className="meta">
                      {job.location} · {job.experience}
                    </p>
                    <p className="match">
                      {isLoggedIn && job.matchingScore != null
                        ? `매칭률 ${job.matchingScore}%`
                        : isLoggedIn
                          ? '상세에서 매칭 분석 확인'
                          : '로그인 후 매칭 분석 확인'}
                    </p>
                    <p className="deadline">등록 {formatDateLabel(job.postedAt)} · 마감 {job.deadline}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-result">검색어와 일치하는 회사 공고가 없습니다.</p>
            )}
          </section>

          <section className="glass-panel jobs-table-panel">
            <h2>전체 공고</h2>
            <div className="jobs-table-list">
              {filteredJobPreviews.map((job) => (
                <article key={job.id} className="jobs-row-card">
                  <button type="button" className="jobs-row" onClick={() => navigate(routePaths.jobDetail(job.id))}>
                    <span>{job.company}</span>
                    <strong>{job.title}</strong>
                    <span>{job.experience}</span>
                    <span>{job.location}</span>
                    <span className="row-match">{isLoggedIn && job.matchingScore != null ? `${job.matchingScore}%` : isLoggedIn ? '상세 보기' : '-'}</span>
                  </button>
                  <JobScrapButton jobId={job.id} className="jobs-row-scrap-button" />
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

export default JobPostingsPage
