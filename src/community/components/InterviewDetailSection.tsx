import type { InterviewPost } from '../types/community'

interface InterviewDetailSectionProps {
  post: InterviewPost
}

function InterviewDetailSection({ post }: InterviewDetailSectionProps) {
  return (
    <section className="community-interview-section">
      <div className="community-structured-hero">
        <div className="community-structured-copy">
          <p className="community-structured-label">{post.subtype === 'accepted' ? '합격 후기' : '현직자 인터뷰'}</p>
          <h2>
            {post.company} · {post.jobRole}
          </h2>
          <p>{post.processSummary}</p>
        </div>
        <dl className="community-meta-grid">
          <div>
            <dt>기업명</dt>
            <dd>{post.company}</dd>
          </div>
          <div>
            <dt>직무</dt>
            <dd>{post.jobRole}</dd>
          </div>
          <div>
            <dt>준비 기간</dt>
            <dd>{post.preparationPeriod}</dd>
          </div>
          <div>
            <dt>기술 스택</dt>
            <dd>{post.techStacks.join(', ')}</dd>
          </div>
        </dl>
      </div>

      <div className="community-tag-stack">
        {post.techStacks.map((stack) => (
          <span key={stack} className="community-meta-chip">
            {stack}
          </span>
        ))}
      </div>

      <div className="community-content-sections">
        <section className="community-content-card">
          <h3>준비 배경</h3>
          <p>{post.background}</p>
        </section>
        <section className="community-content-card">
          <h3>준비 과정</h3>
          <p>{post.preparationProcess}</p>
        </section>
        <section className="community-content-card">
          <h3>합격/실무 경험</h3>
          <p>{post.experienceDetail}</p>
        </section>
        <section className="community-content-card">
          <h3>조언/회고</h3>
          <p>{post.advice}</p>
        </section>
      </div>
    </section>
  )
}

export default InterviewDetailSection
