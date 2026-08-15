import type { InterviewAnalysisSummary } from '../types/mockInterview'

type SkillSummaryCardProps = {
  summary: InterviewAnalysisSummary
}

function SkillSummaryCard({ summary }: SkillSummaryCardProps) {
  return (
    <section className="mock-summary-card glass-style" aria-label="기술 스택 분석 요약">
      <h2>기술 스택 분석 요약</h2>
      <div className="mock-summary-grid">
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

export default SkillSummaryCard
