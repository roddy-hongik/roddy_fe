import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'

function CommunityTopNav() {
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
    navigate(ROUTES.login, { state: { from: { pathname: ROUTES.community } } })
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userName')
    setIsLoggedIn(false)
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <header className="community-nav">
      <div className="community-nav-left">
        <button type="button" className="community-brand" aria-label="Roddy 메인으로 이동" onClick={() => navigate(ROUTES.home)}>
          <div className="roddy-logo">
            <span className="logo-ear left" />
            <span className="logo-ear right" />
            <span className="logo-face" />
          </div>
          <strong>Roddy</strong>
        </button>

        <nav className="community-menu" aria-label="커뮤니티 메뉴">
          <button type="button" className="community-menu-link" onClick={() => navigate(ROUTES.home)}>
            홈
          </button>
          <button type="button" className="community-menu-link" onClick={() => navigate(ROUTES.jobs)}>
            채용공고
          </button>
          <button type="button" className="community-menu-link is-active" onClick={() => navigate(ROUTES.community)}>
            커뮤니티
          </button>
          {isLoggedIn ? (
            <button type="button" className="community-menu-link" onClick={() => navigate(ROUTES.reports)}>
              내 리포트
            </button>
          ) : null}
        </nav>
      </div>

      <div className="community-nav-right">
        {isLoggedIn ? (
          <>
            <button type="button" className="community-menu-link community-nav-page-btn" onClick={() => navigate(ROUTES.profile)}>
              마이페이지
            </button>
            <span className="community-nav-divider">|</span>
            <span className="community-user-name">{userName}님</span>
            <span className="community-nav-divider">|</span>
            <button type="button" className="community-outline-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <button type="button" className="community-outline-btn" onClick={handleLoginRedirect}>
            로그인
          </button>
        )}
      </div>
    </header>
  )
}

export default CommunityTopNav
