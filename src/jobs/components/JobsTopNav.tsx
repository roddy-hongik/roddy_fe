import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'

type JobsTopNavProps = {
  rightSlot?: ReactNode
}

function JobsTopNav({ rightSlot }: JobsTopNavProps) {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('accessToken')))

  useEffect(() => {
    const syncLoginStatus = () => {
      setIsLoggedIn(Boolean(localStorage.getItem('accessToken')))
    }

    syncLoginStatus()
    window.addEventListener('storage', syncLoginStatus)

    return () => {
      window.removeEventListener('storage', syncLoginStatus)
    }
  }, [])

  const userName = useMemo(() => localStorage.getItem('userName') ?? '신애', [])

  const handleLoginRedirect = () => {
    navigate(ROUTES.login, { state: { from: { pathname: ROUTES.jobs } } })
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userName')
    setIsLoggedIn(false)
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <header className="main-nav">
      <div className="nav-left">
        <button type="button" className="brand-anchor" aria-label="Roddy 메인으로 이동" onClick={() => navigate(ROUTES.home)}>
          <div className="roddy-logo">
            <span className="logo-ear left" />
            <span className="logo-ear right" />
            <span className="logo-face" />
          </div>
          <strong>Roddy</strong>
        </button>

        <nav className="main-menu" aria-label="main menu">
          <NavLink to={ROUTES.home} end className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
            홈
          </NavLink>
          <NavLink to={ROUTES.jobs} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
            채용공고
          </NavLink>
          <NavLink to={ROUTES.community} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
            커뮤니티
          </NavLink>
          {isLoggedIn ? (
            <NavLink to={ROUTES.reports} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              내 리포트
            </NavLink>
          ) : null}
        </nav>
      </div>

      <div className="nav-right">
        {rightSlot ? (
          rightSlot
        ) : isLoggedIn ? (
          <>
            <button type="button" className="nav-link nav-page-btn" onClick={() => navigate(ROUTES.profile)}>
              마이페이지
            </button>
            <span className="nav-divider">|</span>
            <span className="user-name">{userName}님</span>
            <span className="nav-divider">|</span>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <button type="button" className="logout-btn" onClick={handleLoginRedirect}>
            로그인
          </button>
        )}
      </div>
    </header>
  )
}

export default JobsTopNav
