import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'

function AdminSidebar() {
  return (
    <aside className="admin-sidebar" aria-label="관리자 메뉴">
      <h1>Admin</h1>
      <nav className="admin-sidebar-nav">
        <NavLink to={ROUTES.adminCrawling} className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
          크롤링 모니터링 대시보드
        </NavLink>
        <NavLink to={ROUTES.adminModeration} className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
          유저 및 커뮤니티 관리
        </NavLink>
        <NavLink to={ROUTES.adminGraph} className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
          Graph DB 노드 관리
        </NavLink>
      </nav>
    </aside>
  )
}

export default AdminSidebar
