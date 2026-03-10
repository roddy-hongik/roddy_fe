import type { ReportCategory } from '../types/report'

type CategoryScoreCardProps = {
  category: ReportCategory
}

function CategoryScoreCard({ category }: CategoryScoreCardProps) {
  return (
    <article className="report-category-card glass-style">
      <div className="report-category-head">
        <div>
          <p className="report-summary-label">{category.name}</p>
          <strong>{category.score}점</strong>
        </div>
        <span className="report-score-badge">{category.score}</span>
      </div>
      <div className="report-score-track" aria-hidden="true">
        <span style={{ width: `${category.score}%` }} />
      </div>
      <p>{category.description}</p>
      <div className="report-chip-wrap report-category-chip-wrap">
        {category.detailStacks.map((stack) => (
          <span key={stack} className="report-chip">
            {stack}
          </span>
        ))}
      </div>
      <p className="report-interpretation">{category.interpretation}</p>
    </article>
  )
}

export default CategoryScoreCard
