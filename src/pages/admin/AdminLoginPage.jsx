import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { ADMIN_EMAIL, emailIsAdmin } from '../../lib/admin'
import SEO from '../../components/SEO'
import '../Admin.css'

export default function AdminLoginPage({ dashboardHref = '/admin', homeHref }) {
  const { configured, ready, user, isAdmin, signIn, signOut } = useAuth()
  const [email, setEmail] = useState('Admin@gmail.com')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  /* After a successful login, wait until context marks admin, then enter */
  useEffect(() => {
    if (ready && user && isAdmin) {
      window.location.assign(dashboardHref)
    }
  }, [ready, user, isAdmin, dashboardHref])

  if (ready && user && isAdmin) {
    return (
      <div className="admin-login">
        <SEO title="Admin Login · Revivaa" noindex={true} />
        <div className="admin-login__panel">
          <p className="admin-login__eyebrow">revivaa</p>
          <h1>Admin</h1>
          <p className="admin-login__lead">Opening dashboard…</p>
        </div>
      </div>
    )
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (user && !isAdmin) {
        await signOut()
      }

      const { data, error: err } = await signIn({
        email: email.trim(),
        password,
      })
      if (err) throw err

      const signedEmail = data?.session?.user?.email || data?.user?.email
      if (!data?.session) {
        throw new Error(
          'Signed up but no session yet. In Supabase → Authentication → Users, confirm Admin@gmail.com (or disable “Confirm email”).',
        )
      }
      if (!emailIsAdmin(signedEmail)) {
        await signOut()
        throw new Error(
          `Signed in as ${signedEmail}, but admin must be ${ADMIN_EMAIL}. Check VITE_ADMIN_EMAIL.`,
        )
      }
      /* navigation happens via useEffect when isAdmin flips true */
    } catch (err) {
      const msg = err?.message || 'Sign in failed'
      if (/invalid login credentials/i.test(msg)) {
        setError(
          'Invalid login. Create user Admin@gmail.com / 123123 in Supabase → Authentication → Users (Auto Confirm User).',
        )
      } else if (/email not confirmed/i.test(msg)) {
        setError(
          'Email not confirmed. Open the user in Supabase Auth and confirm it, or turn off email confirmation.',
        )
      } else {
        setError(msg)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-login">
      <SEO title="Admin Login · Revivaa" noindex={true} />
      <div className="admin-login__panel">
        <p className="admin-login__eyebrow">revivaa</p>
        <h1>Admin</h1>
        <p className="admin-login__lead">Sign in to manage orders and inventory.</p>

        {!configured && (
          <p className="admin-banner admin-banner--warn">
            Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in{' '}
            <code>.env.local</code>, then restart <code>npm run dev</code>.
          </p>
        )}

        {configured && ready && user && !isAdmin && (
          <p className="admin-banner admin-banner--warn">
            Signed in as <code>{user.email}</code>, but not admin. Sign in with{' '}
            <code>Admin@gmail.com</code>.
          </p>
        )}

        <form className="admin-login__form" onSubmit={onSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && (
            <p className="admin-banner admin-banner--error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="admin-btn" disabled={busy || !configured}>
            {busy ? 'Signing in…' : 'Enter admin'}
          </button>
        </form>

        <p className="admin-login__hint">
          Supabase → Authentication → Users → Add user:{' '}
          <strong>Admin@gmail.com</strong> / <strong>123123</strong>, enable{' '}
          <em>Auto Confirm User</em>, then run <code>supabase/promote_admin.sql</code>.
        </p>

        <a href={homeHref || '/'} className="admin-login__home">
          ← Back to site
        </a>
      </div>
    </div>
  )
}
