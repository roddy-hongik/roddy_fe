import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAdminSession } from '../auth/utils/authStorage'
import { ROUTES } from './paths'

type AdminGuardProps = {
  children: ReactNode
}

function AdminGuard({ children }: AdminGuardProps) {
  const location = useLocation()
  const accessToken = localStorage.getItem('accessToken')

  if (!accessToken) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  if (!isAdminSession()) {
    return <Navigate to={ROUTES.home} replace />
  }

  return <>{children}</>
}

export default AdminGuard
