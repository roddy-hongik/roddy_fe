import { Outlet, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import AdminSidebar from './AdminSidebar'
import '../styles/admin-pages.css'

function AdminLayout() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') ?? '관리자'

  return (
    <main className="admin-layout-shell">
      <AdminSidebar />
      <section className="admin-main-area">
        <header className="admin-main-header">
          <div>
            <p className="admin-kicker">Roddy 운영 도구</p>
            <h2>관리자 콘솔</h2>
          </div>
          <div className="admin-header-actions">
            <span>{userName}님</span>
            <button type="button" className="admin-btn secondary" onClick={() => navigate(ROUTES.home)}>
              서비스 홈으로 이동
            </button>
          </div>
        </header>
        <Outlet />
      </section>
    </main>
  )
}

export default AdminLayout
