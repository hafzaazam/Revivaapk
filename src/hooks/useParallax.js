import { useEffect, useRef } from 'react'
import { getMotionCapability } from './useMotionCapability'

/**
 * Viewport-relative mouse parallax, driven entirely outside React.
 *
 * Returns a ref holding the current `{x, y}` offset plus a `target` element
 * that the hook writes `transform` to on every frame. The previous version
 * called `setState` inside its rAF loop, re-rendering the whole subtree 60x per
 * second for a two-number transform. Nothing renders now; the compositor does.
 *
 * Usage:
 *   const parallax = useParallax(15)
 *   <div ref={parallax.ref} style={{ transform: `translate3d(${parallax.current.x}px, ...)` }} />
 *
 * @param {number} [strength=15] max offset in px at the viewport edge
 * @param {{ lerp?: number, enabled?: boolean }} [options]
 */
export function useParallax(strength = 15, options = {}) {
  const lerpFactor = options.lerp ?? 0.08
  const enabledOpt = options.enabled

  const current = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const nodeRef = useRef(null)
  const raf = useRef(0)
  const running = useRef(false)

  /*
   * The rAF loop needs the latest `strength`/`lerp` without re-subscribing the
   * mousemove listener on every prop change. Assigning to a ref *during render*
   * is what the react-hooks lint rules (and React Compiler) reject, so the
   * values are mirrored into a ref from an effect instead. `useRef`'s initial
   * argument covers the first paint, before the effect has run.
   */
  const configRef = useRef({ strength, lerpFactor })
  useEffect(() => {
    configRef.current = { strength, lerpFactor }
  }, [strength, lerpFactor])

  useEffect(() => {
    const { allowParallax } = getMotionCapability()
    const enabled = enabledOpt !== false && allowParallax
    const node = nodeRef.current

    if (!enabled || !node) return undefined

    const stop = () => {
      running.current = false
      cancelAnimationFrame(raf.current)
    }

    const apply = () => {
      const p = current.current
      node.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
    }

    const tick = () => {
      const p = current.current
      const t = target.current
      const k = configRef.current.lerp
      const nx = p.x + (t.x - p.x) * k
      const ny = p.y + (t.y - p.y) * k
      const settled =
        Math.abs(nx - p.x) < 0.05 &&
        Math.abs(ny - p.y) < 0.05 &&
        Math.abs(t.x - nx) < 0.05 &&
        Math.abs(t.y - ny) < 0.05

      if (settled) {
        // Snap to target and stop: idling near zero avoids a permanent rAF loop.
        current.current = { x: t.x, y: t.y }
        apply()
        running.current = false
        return
      }

      current.current = { x: nx, y: ny }
      apply()
      raf.current = requestAnimationFrame(tick)
    }

    const start = () => {
      if (running.current) return
      running.current = true
      raf.current = requestAnimationFrame(tick)
    }

    let cx = window.innerWidth / 2
    let cy = window.innerHeight / 2

    const onResize = () => {
      cx = window.innerWidth / 2
      cy = window.innerHeight / 2
    }

    const onMove = (e) => {
      const s = configRef.current.strength
      target.current = {
        x: cx ? Math.max(-1, Math.min(1, (e.clientX - cx) / cx)) * s : 0,
        y: cy ? Math.max(-1, Math.min(1, (e.clientY - cy) / cy)) * s : 0,
      }
      start()
    }

    const onLeave = () => {
      target.current = { x: 0, y: 0 }
      start()
    }

    apply()
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      stop()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [enabledOpt])

  return { ref: nodeRef, current, target }
}
