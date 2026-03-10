import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import JobsTopNav from '../components/JobsTopNav'
import { jobPostings } from '../data/jobPostings'
import '../styles/job-pages.css'

function JobPostingDetailPage() {
  const navigate = useNavigate()
  const { jobId } = useParams()

  const job = useMemo(() => jobPostings.find((item) => item.id === jobId) ?? jobPostings[0], [jobId])

  const averageGap = useMemo(() => {
    const totalGap = job.matchingInsights.reduce((acc, item) => acc + (item.userScore - item.requiredScore), 0)
    return Math.round(totalGap / job.matchingInsights.length)
  }, [job.matchingInsights])

  return (
    <main className="jobs-page detail-page">
      <JobsTopNav
        rightSlot={
          <button type="button" className="logout-btn" onClick={() => navigate(ROUTES.jobs)}>
            목록으로
          </button>
        }
      />

      <section className="detail-layout">
        <article className="glass-panel detail-main">
          <div className="detail-badge-row">
            <span>{job.workType}</span>
            <span>마감 {job.deadline}</span>
            <span>매칭률 {job.matchRate}%</span>
          </div>

          <h1>{job.title}</h1>
          <p className="detail-company">{job.company}</p>
          <p className="detail-summary">{job.summary}</p>

          <section className="hero-highlight">
            <div>
              <p className="label">지금 공고와 사용자 스택 적합도</p>
              <strong className="hero-match">{job.matchRate}% Match</strong>
              <p className="detail-note">핵심 스택 평균 대비 {averageGap >= 0 ? `+${averageGap}` : averageGap}점</p>
            </div>
            <button type="button" className="apply-btn-large">
              지원하기
            </button>
          </section>

          <section className="detail-section">
            <h2>기술 스택 매칭 분석</h2>
            <div className="stack-fit-list">
              {job.matchingInsights.map((insight) => {
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
          </section>

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

          <button type="button" className="apply-btn-large full">
            즉시 지원
          </button>
        </aside>
      </section>
    </main>
  )
}

export default JobPostingDetailPage
