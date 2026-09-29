import { useCallback, useEffect, useRef, useState } from 'react'
import { preloadAssets, simulateProgress } from '../lib/preloadAssets'

const SESSION_KEY = 'revivaa-preloader-seen'

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function readMode() {
  if (typeof window === 'undefined') return 'full'
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1' ? 'lite' : 'full'
  } catch {
    return 'full'
  }
}

/**
 * Owns preloader lifecycle: load → exit wipe → done.
 *
 * @param {{ assets?: string[] }} [options]
 * @returns {{
 *   isLoading: boolean,
 *   progress: number,
 *   phase: 'loading' | 'exiting' | 'done',
 *   mode: 'full' | 'lite',
 *   reducedMotion: boolean,
 *   beginExit: () => void,
 *   complete: () => void,
 * }}
 */
export function usePreloader(options = {}) {
  const assets = options.assets ?? []
  const [mode] = useState(readMode)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('loading')
  const [reducedMotion] = useState(prefersReducedMotion)
  const started = useRef(false)

  const isLoading = phase !== 'done'

  // Scroll lock while loading.
  //
  // `aria-busy` is deliberately NOT set on <html>: it hides the whole document
  // from assistive tech for the entire preload, so a screen-reader user lands
  // on a silent page. The Preloader overlay already carries its own
  // role="progressbar"; locking scroll here is all that is required.
  useEffect(() => {
    if (isLoading) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
    document.body.style.overflow = ''
    return undefined
  }, [isLoading])

  const beginExit = useCallback(() => {
    setPhase((p) => (p === 'loading' ? 'exiting' : p))
  }, [])

  const complete = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* private mode */
    }
    setPhase('done')

    // Move focus to main landmark for screen readers / keyboard
    requestAnimationFrame(() => {
      const main = document.getElementById('main')
      if (main) {
        if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1')
        main.focus({ preventScroll: true })
      }
    })
  }, [])

  useEffect(() => {
    if (started.current) return undefined
    started.current = true
    let cancelled = false

    const run = async () => {
      if (mode === 'lite') {
        await simulateProgress(
          (n) => {
            if (!cancelled) setProgress(n)
          },
          { minMs: 260, maxMs: 420 },
        )
        if (!cancelled) beginExit()
        return
      }

      // Full: blend real asset progress with a viscous simulated floor.
      let real = 0
      let sim = 0
      const publish = () => {
        if (cancelled) return
        // Weighted blend — never finish before both are ready-ish
        const blended = Math.min(99, Math.round(real * 0.6 + sim * 0.4))
        setProgress(blended)
      }

      const simDone = simulateProgress(
        (n) => {
          sim = n
          publish()
        },
        // Short floor only. The previous 900-1400ms was awaited before the
        // wipe could start, adding ~1s of dead time to every cold first paint
        // even when the assets were already in cache.
        { minMs: 320, maxMs: 520 },
      )

      const realDone = preloadAssets(assets, (p) => {
        real = Math.round(p * 100)
        publish()
      })

      // Real assets gate the exit; the simulation only smooths the bar while
      // they load and is no longer awaited.
      await realDone
      if (cancelled) return
      simDone.catch(() => {})
      setProgress(100)
      // Brief hold on 100% so the bar reads as complete
      await new Promise((r) => setTimeout(r, reducedMotion ? 60 : 160))
      if (!cancelled) beginExit()
    }

    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [])

  return {
    isLoading,
    progress,
    phase,
    mode,
    reducedMotion,
    beginExit,
    complete,
  }
}
