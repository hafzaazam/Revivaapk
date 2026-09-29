import { useAuth } from '../../auth/AuthProvider'
import { emailIsAdmin } from '../../lib/admin'
import AdminDashboardPage from './AdminDashboardPage'

export default function AdminGate() {
  const { ready, configured, user, isAdmin, profile } = useAuth()

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

  const allowed = Boolean(
    user && (isAdmin || emailIsAdmin(user.email) || profile?.role === 'admin'),
  )

  if (!user || !allowed) {
    window.location.replace('./admin-login.html')
    return null
  }

  return <AdminDashboardPage homeHref="/" />
}