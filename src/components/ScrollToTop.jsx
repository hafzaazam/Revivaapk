import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './ScrollToTop.css'

/**
 * Fixed scroll-to-top control — appears after scrolling past the hero.
 * Bottom-right, clear of safe areas; hidden while near the top.
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setVisible(window.scrollY > window.innerHeight * 0.55)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goTop = () => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      className={`scroll-top ${visible ? 'is-visible' : ''}`}
      onClick={goTop}
      aria-label="Scroll to top"
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp size={18} strokeWidth={1.6} aria-hidden />
    </button>
  )
}
