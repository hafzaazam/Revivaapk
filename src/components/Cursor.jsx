import { useEffect, useRef, useState } from 'react'
import { useMousePositionRef } from '../hooks/useEffects'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './Cursor.css'

const HOVER_SEL =
  'a, button, [role="button"], .clay-btn, .nav__item, .nav__theme, .nav-dock__item, .nav-dock__home, .ring-label, .mega__link, .footer__social, .footer-cta, input, textarea, summary'

/**
 * Oil-flow cursor
 * - `.cursor-oil`   : the sharp droplet that tracks the pointer instantly
 * - `.cursor-film`  : a lagging, viscous ring that drifts behind like oil
 * - `.cursor-trail` : a short comet of droplets that fades out (spawned on move)
 *
 * All three layers are moved by writing `transform` from a single rAF loop.
 * Routing pointer position through React state re-rendered the component on
 * every mouse event, which is the single most expensive thing on a page that
 * also runs several scroll-scrubbed sections.
 *
 * Hidden on touch / reduced-motion / coarse pointers.
 */
export default function Cursor() {
  const reduced = usePrefersReducedMotion()
  const pointer = useMousePositionRef()
  const [state, setState] = useState('')
  const [fine, setFine] = useState(false)

  const oilRef = useRef(null)
  const filmRef = useRef(null)
  const trailRef = useRef(null)
  const filmPos = useRef({ x: 0, y: 0 })
  const lastSpawn = useRef(0)

  /* Detect fine pointer */
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const sync = () => setFine(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /* Hide native cursor while ours is active */
  useEffect(() => {
    const root = document.documentElement
    if (fine && !reduced) root.classList.add('custom-cursor')
    else root.classList.remove('custom-cursor')
    return () => root.classList.remove('custom-cursor')
  }, [fine, reduced])

  const active = fine && !reduced

  /* Hover / press detection — one combined state string so a move across a
     hover target does not queue two renders. */
  useEffect(() => {
    if (!active) return undefined

    let current = ''
    const commit = (next) => {
      if (next === current) return
      current = next
      setState(next)
    }

    const onOver = (e) => {
      const t = e.target
      if (!(t instanceof Element)) return
      commit(t.closest(HOVER_SEL) ? 'is-hover' : '')
    }
    const onDown = () => commit('is-down')
    const onUp = () => commit(current === 'is-down' ? 'is-hover' : current)

    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [active])

  /* Single rAF loop drives the droplet 1:1 and the viscous film behind it. */
  useEffect(() => {
    if (!active) return undefined

    const film = filmPos.current
    let frame = requestAnimationFrame(function tick() {
      const t = pointer.current
      const oil = oilRef.current
      if (oil) {
        oil.style.transform = `translate3d(${t.x}px, ${t.y}px, 0)`
      }

      // Viscosity: oil flows slowly toward the pointer.
      film.x += (t.x - film.x) * 0.14
      film.y += (t.y - film.y) * 0.14
      const ring = filmRef.current
      if (ring) ring.style.transform = `translate3d(${film.x}px, ${film.y}px, 0)`

      frame = requestAnimationFrame(tick)
    })

    return () => cancelAnimationFrame(frame)
  }, [active, pointer])

  /* Spawn trail droplets on pointer move (throttled). */
  useEffect(() => {
    if (!active) return undefined

    const onMove = (e) => {
      const now = performance.now()
      if (now - lastSpawn.current < 55) return
      lastSpawn.current = now
      const host = trailRef.current
      if (!host) return

      const drop = document.createElement('span')
      drop.className = 'cursor-drop'
      drop.style.left = `${e.clientX}px`
      drop.style.top = `${e.clientY}px`
      const size = 4 + Math.random() * 5
      drop.style.setProperty('--s', `${size}px`)
      drop.style.setProperty('--dx', `${(Math.random() - 0.5) * 26}px`)
      drop.style.setProperty('--dy', `${(Math.random() - 0.5) * 26}px`)
      host.appendChild(drop)
      window.setTimeout(() => drop.remove(), 900)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [active])

  if (!active) return null

  return (
    <>
      {/* Trailing droplets layer (behind everything) */}
      <div ref={trailRef} className="cursor-trail" aria-hidden />

      {/* Viscous film ring — drifts behind the pointer */}
      <div ref={filmRef} className={`cursor-film ${state}`} aria-hidden>
        <span className="cursor-film__sheen" />
      </div>

      {/* Sharp oil droplet — tracks pointer 1:1 */}
      <div ref={oilRef} className={`cursor-oil ${state}`} aria-hidden>
        <span className="cursor-oil__core" />
      </div>
    </>
  )
}
