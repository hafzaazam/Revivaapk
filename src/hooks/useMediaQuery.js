import { useEffect, useState } from 'react'

/** Match a CSS media query; SSR-safe default false. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mq = window.matchMedia(query)
    const sync = () => setMatches(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [query])

  return matches
}

/** True on mobile (<=768px) — unpin scrollytelling, use stacked ScrollReveal. */
export function useIsMobilePin() {
  return useMediaQuery('(max-width: 768px)')
}
