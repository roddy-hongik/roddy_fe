import type { AnalysisSummary } from '../../api/types/roadmap'

type RoadmapSummaryCardProps = {
  summary: AnalysisSummary
}

function RoadmapSummaryCard({ summary }: RoadmapSummaryCardProps) {
  return (
    <section className="roadmap-summary-card glass-style" aria-label="로드맵 생성 기준 요약">
      <h2>분석 요약</h2>
      <p className="profile-meta-text">현재 기술 스택과 Gap을 기반으로 개인 맞춤형 학습 로드맵을 생성합니다.</p>
      <div className="roadmap-summary-grid">
        <article>
          <h3>현재 기술 스택</h3>
          <p>{summary.currentSkills.join(', ') || '-'}</p>
        </article>
        <article>
          <h3>부족한 기술 스택 (Gap)</h3>
          <p>{summary.gapSkills.join(', ') || '-'}</p>
        </article>
        <article>
          <h3>목표 직무</h3>
          <p>{summary.targetJob || '-'}</p>
        </article>
        <article>
          <h3>희망 기업</h3>
          <p>{summary.targetCompany || '-'}</p>
        </article>
      </div>
    </section>
  )
}

export default RoadmapSummaryCard
