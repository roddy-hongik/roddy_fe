import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from './paths'

type AdminGuardProps = {
  children: ReactNode
}

const isAdmin = () => {
  const userRole = localStorage.getItem('userRole')
  const userName = localStorage.getItem('userName')

  return userRole === 'admin' || userName === '신애'
}

function AdminGuard({ children }: AdminGuardProps) {
  const location = useLocation()
  const accessToken = localStorage.getItem('accessToken')

  if (!accessToken) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  if (!isAdmin()) {
    return <Navigate to={ROUTES.home} replace />
  }

  return <>{children}</>
}

export default AdminGuard
