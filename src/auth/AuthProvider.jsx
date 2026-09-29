import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { emailIsAdmin } from '../lib/admin'

const AuthContext = createContext({
  configured: false,
  ready: false,
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  signUp: async () => ({ error: new Error('Supabase not configured') }),
  signIn: async () => ({ error: new Error('Supabase not configured') }),
  signOut: async () => ({ error: null }),
  refreshProfile: async () => {},
})

async function loadProfile(userId) {
  if (!supabase || !userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.warn('[auth] profile load failed', error.message)
    return null
  }
  return data
}

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(!isSupabaseConfigured)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setReady(true)
      return undefined
    }

    let alive = true

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session ?? null)
      setReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) {
      setProfile(null)
      return undefined
    }

    let alive = true
    loadProfile(userId).then((p) => {
      if (alive) setProfile(p)
    })
    return () => {
      alive = false
    }
  }, [session?.user?.id])

  const signUp = useCallback(async ({ email, password, fullName }) => {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || '' },
      },
    })
    if (data?.session) setSession(data.session)
    return { data, error }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    /* Set session immediately so /admin gate does not bounce before onAuthStateChange */
    if (data?.session) setSession(data.session)
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return { error: null }
    const { error } = await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    return { error }
  }, [])

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id
    if (!userId) return
    setProfile(await loadProfile(userId))
  }, [session?.user?.id])

  const isAdmin = Boolean(
    profile?.role === 'admin' || emailIsAdmin(session?.user?.email),
  )

  const value = useMemo(
    () => ({
      configured: isSupabaseConfigured,
      ready,
      session,
      user: session?.user ?? null,
      profile,
      isAdmin,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }),
    [ready, session, profile, isAdmin, signUp, signIn, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
