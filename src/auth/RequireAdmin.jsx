import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { emailIsAdmin } from '../lib/admin'

/** Gate admin routes — waits for session, then requires admin role */
export default function RequireAdmin({ children }) {
  const { configured, ready, user, isAdmin, profile } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="admin-gate">
        <p>Loading…</p>
      </div>
    )
  }

  if (!configured) {
    return (
      <div className="admin-gate">
        <p>
          Add Supabase keys to <code>.env.local</code>, then restart the app.
        </p>
      </div>
    )
  }

  /* Session present: allow by role OR admin email (profile may still be loading) */
  const allowed = Boolean(user && (isAdmin || emailIsAdmin(user.email) || profile?.role === 'admin'))

  if (!user || !allowed) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return children
}
