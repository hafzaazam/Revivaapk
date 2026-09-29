import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { useAuth } from '../auth/AuthProvider'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './AuthPage.css'

const EASE = [0.22, 1, 0.36, 1]

export default function AuthPage() {
  const { configured, user, signIn, signUp, ready } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const reduced = usePrefersReducedMotion()
  const next = params.get('next') || '/checkout'
  const initialMode = params.get('mode') === 'signup' ? 'signup' : 'signin'

  const [mode, setMode] = useState(initialMode)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = mode === 'signup' ? 'Create account · revivaa' : 'Sign in · revivaa'
  }, [mode])

  useEffect(() => {
    if (ready && user) navigate(next, { replace: true })
  }, [ready, user, navigate, next])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)

    try {
      if (mode === 'signup') {
        const { error: err } = await signUp({ email, password, fullName })
        if (err) throw err
        setMessage('Account created. Check your email if confirmation is required, then sign in.')
        setMode('signin')
      } else {
        const { error: err } = await signIn({ email, password })
        if (err) throw err
        navigate(next, { replace: true })
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app auth-app">
      <SEO
        title={mode === 'signup' ? 'Create Account · Revivaa' : 'Sign In · Revivaa'}
        description={
          mode === 'signup'
            ? 'Create an account with Revivaa to place orders and track delivery progress.'
            : 'Sign in to your Revivaa account to manage orders and view order history.'
        }
        noindex={true}
      />
      <Cursor />
      <ScrollToTop />
      <Navbar />

      <main id="main" tabIndex={-1} className="auth-page">
        <div className="auth-page__shell container">
          <Link to="/shop" className="auth-page__back">
            <ArrowLeft size={16} strokeWidth={1.6} aria-hidden />
            Back
          </Link>

          <motion.div
            className="auth-page__panel"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <p className="section-label">{mode === 'signup' ? 'Join revivaa' : 'Welcome back'}</p>
            <h1 className="auth-page__title">
              {mode === 'signup' ? 'Create account' : 'Sign in'}
            </h1>
            <p className="auth-page__lead">
              Sign in to place orders and track them in your account.
            </p>

            {!configured && (
              <p className="auth-page__banner auth-page__banner--warn" role="status">
                Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to{' '}
                <code>.env.local</code> (see <code>.env.example</code>), then restart the dev server.
              </p>
            )}

            <form className="auth-page__form" onSubmit={onSubmit}>
              {mode === 'signup' && (
                <label className="auth-page__field">
                  <span>Full name</span>
                  <input
                    name="fullName"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </label>
              )}

              <label className="auth-page__field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="auth-page__field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              {error && (
                <p className="auth-page__banner auth-page__banner--error" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className="auth-page__banner" role="status">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="clay-btn auth-page__submit"
                disabled={busy || !configured}
              >
                {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <p className="auth-page__switch">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setMode('signin')}>
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New here?{' '}
                  <button type="button" onClick={() => setMode('signup')}>
                    Create account
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
