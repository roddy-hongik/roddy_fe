import { NavLink, useNavigate } from 'react-router-dom'
import { emitAuthChange } from '../../auth/utils/authEvents'
import NotificationsDropdown from '../../notifications/components/NotificationsDropdown'
import { ROUTES } from '../../routes/paths'

function ProfileTopNav() {
  const navigate = useNavigate()

  const userName = localStorage.getItem('userName') ?? '사용자'
  const isAdmin = localStorage.getItem('userRole') === 'admin' || userName === '신애'

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    emitAuthChange()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <header className="profile-main-nav">
      <div className="profile-nav-left">
        <button type="button" className="profile-brand-anchor" aria-label="Roddy 메인으로 이동" onClick={() => navigate(ROUTES.home)}>
          <div className="profile-roddy-logo">
            <span className="profile-logo-ear left" />
            <span className="profile-logo-ear right" />
            <span className="profile-logo-face" />
          </div>
          <strong>Roddy</strong>
        </button>

        <nav className="profile-main-menu" aria-label="main menu">
          <NavLink to={ROUTES.home} className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}>
            홈
          </NavLink>
          <NavLink to={ROUTES.jobs} className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}>
            채용공고
          </NavLink>
          <NavLink to={ROUTES.mockInterview} className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}>
            모의면접
          </NavLink>
          <NavLink to={ROUTES.roadmap} className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}>
            로드맵
          </NavLink>
          <NavLink to={ROUTES.community} className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}>
            커뮤니티
          </NavLink>
          <NavLink to={ROUTES.reports} className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}>
            내 리포트
          </NavLink>
          {isAdmin ? (
            <NavLink to={ROUTES.adminCrawling} className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}>
              관리자
            </NavLink>
          ) : null}
        </nav>
      </div>

      <div className="profile-nav-right">
        <NotificationsDropdown />
        <NavLink to={ROUTES.profile} end className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}>
          마이페이지
        </NavLink>
        <NavLink to={ROUTES.profileSaved} className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}>
          저장 콘텐츠
        </NavLink>
        <span className="profile-nav-divider">|</span>
        <span className="profile-user-name">{userName}님</span>
        <span className="profile-nav-divider">|</span>
        <button type="button" className="profile-logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  )
}

export default ProfileTopNav
