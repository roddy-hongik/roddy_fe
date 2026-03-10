import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'

function ReportNav() {
  return (
    <nav className="report-subnav" aria-label="리포트 이동">
      <NavLink to={ROUTES.reportsDetailAnalysis} end className={({ isActive }) => `report-subnav-link ${isActive ? 'active' : ''}`}>
        상세 분석
      </NavLink>
      <NavLink to={ROUTES.reportsPayment} className={({ isActive }) => `report-subnav-link ${isActive ? 'active' : ''}`}>
        결제
      </NavLink>
    </nav>
  )
}

export default ReportNav
