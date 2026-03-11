import { NavLink } from 'react-router-dom'
import { ROUTES, routePaths } from '../../routes/paths'

type ReportNavProps = {
  reportId?: number
}

function ReportNav({ reportId }: ReportNavProps) {
  return (
    <nav className="report-subnav" aria-label="리포트 이동">
      <NavLink to={ROUTES.reports} end className={({ isActive }) => `report-subnav-link ${isActive ? 'active' : ''}`}>
        내 리포트
      </NavLink>
      {reportId ? (
        <NavLink to={routePaths.reportDetailAnalysis(reportId)} className={({ isActive }) => `report-subnav-link ${isActive ? 'active' : ''}`}>
          상세 분석
        </NavLink>
      ) : (
        <NavLink to={ROUTES.reportsDetailAnalysis} className={({ isActive }) => `report-subnav-link ${isActive ? 'active' : ''}`}>
          상세 분석
        </NavLink>
      )}
      <NavLink to={ROUTES.reportsPayment} className={({ isActive }) => `report-subnav-link ${isActive ? 'active' : ''}`}>
        결제
      </NavLink>
    </nav>
  )
}

export default ReportNav
