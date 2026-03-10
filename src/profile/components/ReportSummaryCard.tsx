import type { DetailedReport } from '../types/report'

type ReportSummaryCardProps = {
  report: DetailedReport
}

function ReportSummaryCard({ report }: ReportSummaryCardProps) {
  return (
    <article className="report-summary-card glass-style">
      <div className="report-summary-head">
        <div>
          <p className="report-summary-label">종합 점수</p>
          <strong>{report.overallScore}점</strong>
        </div>
        <span className="report-date">{report.createdAt}</span>
      </div>
      <h2>{report.title}</h2>
      <p className="profile-meta-text">{report.summary}</p>
      <div className="report-score-track" aria-hidden="true">
        <span style={{ width: `${report.overallScore}%` }} />
      </div>
    </article>
  )
}

export default ReportSummaryCard
