import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../routes/paths'
import JobsTopNav from '../components/JobsTopNav'
import { jobPostings } from '../data/jobPostings'
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

  return (
    <main className="jobs-page">
      <JobsTopNav />

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
                {topPostings.map((job) => (
                  <article key={job.id} className="headline-card" onClick={() => navigate(routePaths.jobDetail(job.id))}>
                    <p className="company">{job.company}</p>
                    <h2>{job.title}</h2>
                    <p className="meta">
                      {job.location} · {job.experience}
                    </p>
                    <p className="match">매칭률 {job.matchRate}%</p>
                    <p className="deadline">마감 {job.deadline}</p>
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
              {filteredJobs.map((job) => (
                <button key={job.id} type="button" className="jobs-row" onClick={() => navigate(routePaths.jobDetail(job.id))}>
                  <span>{job.company}</span>
                  <strong>{job.title}</strong>
                  <span>{job.experience}</span>
                  <span>{job.location}</span>
                  <span className="row-match">{job.matchRate}%</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

export default JobPostingsPage
