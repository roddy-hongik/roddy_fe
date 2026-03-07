import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import '../styles/profile-pages.css'

function ProfileLayout() {
  const navigate = useNavigate()

  const userName = localStorage.getItem('userName') ?? '사용자'

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userName')
    navigate('/login', { replace: true })
  }

  return (
    <main className="profile-layout-shell">
      <header className="profile-main-nav">
        <div className="profile-nav-left">
          <button type="button" className="profile-brand-anchor" aria-label="Roddy 메인으로 이동" onClick={() => navigate('/')}>
            <div className="profile-roddy-logo">
              <span className="profile-logo-ear left" />
              <span className="profile-logo-ear right" />
              <span className="profile-logo-face" />
            </div>
            <strong>Roddy</strong>
          </button>

          <nav className="profile-main-menu" aria-label="main menu">
            <NavLink to="/" className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}>
              홈
            </NavLink>
            <NavLink to="/jobs" className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}>
              채용공고
            </NavLink>
            <NavLink to="/community" className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}>
              커뮤니티
            </NavLink>
          </nav>
        </div>

        <div className="profile-nav-right">
          <NavLink to="/profile" end className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}>
            마이페이지
          </NavLink>
          <span className="profile-nav-divider">|</span>
          <span className="profile-user-name">{userName}님</span>
          <span className="profile-nav-divider">|</span>
          <button type="button" className="profile-logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </header>

      <section className="profile-layout-content">
        <Outlet />
      </section>
    </main>
  )
}

export default ProfileLayout
