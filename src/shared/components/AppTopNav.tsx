import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AUTH_CHANGE_EVENT, emitAuthChange } from '../../auth/utils/authEvents'
import NotificationsDropdown from '../../notifications/components/NotificationsDropdown'
import { ROUTES } from '../../routes/paths'
import '../styles/app-top-nav.css'

type AppTopNavProps = {
  loginRedirectPath?: string
  onLogout?: () => void
  rightSlot?: ReactNode
  showSavedLink?: boolean
  userNameOverride?: string
}

type AuthSnapshot = {
  isLoggedIn: boolean
  storedUserName: string
  userRole: string
}

const readAuthSnapshot = (): AuthSnapshot => ({
  isLoggedIn: Boolean(localStorage.getItem('accessToken')),
  storedUserName: localStorage.getItem('userName') ?? '사용자',
  userRole: localStorage.getItem('userRole') ?? '',
})

function AppTopNav({ loginRedirectPath = ROUTES.home, onLogout, rightSlot, showSavedLink = false, userNameOverride }: AppTopNavProps) {
  const navigate = useNavigate()
  const [authSnapshot, setAuthSnapshot] = useState<AuthSnapshot>(() => readAuthSnapshot())

  useEffect(() => {
    const syncAuthSnapshot = () => {
      setAuthSnapshot(readAuthSnapshot())
    }

    syncAuthSnapshot()
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthSnapshot)
    window.addEventListener('storage', syncAuthSnapshot)

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthSnapshot)
      window.removeEventListener('storage', syncAuthSnapshot)
    }
  }, [])

  const userName = userNameOverride ?? authSnapshot.storedUserName
  const isAdmin = authSnapshot.userRole === 'admin'

  const handleLoginRedirect = () => {
    navigate(ROUTES.login, { state: { from: { pathname: loginRedirectPath } } })
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    emitAuthChange()
    setAuthSnapshot(readAuthSnapshot())
    onLogout?.()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <header className="app-top-nav">
      <div className="app-top-nav__left">
        <button type="button" className="app-top-nav__brand" aria-label="Roddy 메인으로 이동" onClick={() => navigate(ROUTES.home)}>
          <div className="app-top-nav__logo" aria-hidden="true">
            <span className="app-top-nav__logo-ear left" />
            <span className="app-top-nav__logo-ear right" />
            <span className="app-top-nav__logo-face" />
          </div>
          <strong>Roddy</strong>
        </button>

        <nav className="app-top-nav__menu" aria-label="메인 메뉴">
          <NavLink to={ROUTES.home} end className={({ isActive }) => `app-top-nav__link ${isActive ? 'is-active' : ''}`.trim()}>
            홈
          </NavLink>
          <NavLink to={ROUTES.jobs} className={({ isActive }) => `app-top-nav__link ${isActive ? 'is-active' : ''}`.trim()}>
            채용공고
          </NavLink>
          <NavLink to={ROUTES.mockInterview} className={({ isActive }) => `app-top-nav__link ${isActive ? 'is-active' : ''}`.trim()}>
            모의면접
          </NavLink>
          <NavLink to={ROUTES.roadmap} className={({ isActive }) => `app-top-nav__link ${isActive ? 'is-active' : ''}`.trim()}>
            로드맵
          </NavLink>
          <NavLink to={ROUTES.community} className={({ isActive }) => `app-top-nav__link ${isActive ? 'is-active' : ''}`.trim()}>
            커뮤니티
          </NavLink>
          {authSnapshot.isLoggedIn ? (
            <NavLink to={ROUTES.reports} className={({ isActive }) => `app-top-nav__link ${isActive ? 'is-active' : ''}`.trim()}>
              내 리포트
            </NavLink>
          ) : null}
          {authSnapshot.isLoggedIn && isAdmin ? (
            <NavLink to={ROUTES.adminCrawling} className={({ isActive }) => `app-top-nav__link ${isActive ? 'is-active' : ''}`.trim()}>
              관리자
            </NavLink>
          ) : null}
        </nav>
      </div>

      <div className="app-top-nav__right">
        {rightSlot ? (
          rightSlot
        ) : authSnapshot.isLoggedIn ? (
          <>
            <NotificationsDropdown />
            <NavLink
              to={ROUTES.profile}
              end
              className={({ isActive }) => `app-top-nav__link app-top-nav__link--action ${isActive ? 'is-active' : ''}`.trim()}
            >
              마이페이지
            </NavLink>
            {showSavedLink ? (
              <NavLink to={ROUTES.profileSaved} className={({ isActive }) => `app-top-nav__link ${isActive ? 'is-active' : ''}`.trim()}>
                저장 콘텐츠
              </NavLink>
            ) : null}
            <span className="app-top-nav__divider">|</span>
            <span className="app-top-nav__user-name">{userName}님</span>
            <span className="app-top-nav__divider">|</span>
            <button type="button" className="app-top-nav__action-button" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <button type="button" className="app-top-nav__action-button" onClick={handleLoginRedirect}>
            로그인
          </button>
        )}
      </div>
    </header>
  )
}

export default AppTopNav
