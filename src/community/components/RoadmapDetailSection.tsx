import type { RoadmapSharePost } from '../types/community'

interface RoadmapDetailSectionProps {
  post: RoadmapSharePost
}

function RoadmapDetailSection({ post }: RoadmapDetailSectionProps) {
  return (
    <section className="community-roadmap-section">
      <div className="community-structured-hero">
        <div className="community-structured-copy">
          <p className="community-structured-label">로드맵 요약</p>
          <h2>{post.targetJob}</h2>
          <p>{post.summary}</p>
        </div>
        <dl className="community-meta-grid">
          <div>
            <dt>목표 직무</dt>
            <dd>{post.targetJob}</dd>
          </div>
          <div>
            <dt>목표 기업</dt>
            <dd>{post.targetCompany || '-'}</dd>
          </div>
          <div>
            <dt>추천 기술 스택</dt>
            <dd>{post.recommendedSkills.join(', ')}</dd>
          </div>
          <div>
            <dt>단계 수</dt>
            <dd>{post.roadmapSteps.length}단계</dd>
          </div>
        </dl>
      </div>

      <div className="community-tag-stack">
        {post.recommendedSkills.map((skill) => (
          <span key={skill} className="community-meta-chip">
            {skill}
          </span>
        ))}
      </div>

      <p className="community-structured-description">{post.description}</p>

      <ol className="community-roadmap-step-list">
        {post.roadmapSteps.map((step) => (
          <li key={`${post.id}-${step.stage}`} className="community-roadmap-step-card">
            <div className="community-roadmap-step-top">
              <span className="community-roadmap-stage">{step.stage}</span>
              <strong>{step.goal}</strong>
            </div>
            <div className="community-roadmap-step-body">
              <section>
                <h3>학습 주제</h3>
                <ul>
                  {step.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h3>추천 결과물</h3>
                <ul>
                  {step.outputs.map((output) => (
                    <li key={output}>{output}</li>
                  ))}
                </ul>
              </section>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default RoadmapDetailSection
