import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/loading-state'
import { useAuth } from '@/context/auth-context'
import type { UserRole } from '@/types'

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, initializing } = useAuth()
  const location = useLocation()
  if (initializing) return <LoadingState className="min-h-screen" label="Restoring your session…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) {
    const path = user.role === 'admin' ? '/admin' : user.role === 'organizer' ? '/organizer' : '/dashboard'
    return <Navigate to={path} replace />
  }
  return <Outlet />
}
