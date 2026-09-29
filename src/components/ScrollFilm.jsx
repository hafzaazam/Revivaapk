import { useCallback, useEffect, useRef, useState } from 'react'
import { useScroll, useInView } from 'framer-motion'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { getMotionCapability } from '../hooks/useMotionCapability'
import './ScrollFilm.css'

const SCRUB_END = 0.82

/** How many frames to keep decoded on either side of the current one. */
const WINDOW_AHEAD = 6
const WINDOW_BEHIND = 3
/** Frames fetched at a time — keeps the request queue shallow and ordered. */
const FETCH_BATCH = 6

/** Lazy module map — URLs resolved only when the section approaches the viewport */
const frameModules = import.meta.glob('../assets/reviva/*.jpg', {
  import: 'default',
})

/**
 * Frame sources in scrub order, resolved lazily.
 * `import.meta.glob` keys are sorted numerically here because
 * `_a_10` must come after `_a_9`, not after `_a_1`.
 */
const FRAME_LOADERS = Object.entries(frameModules)
  .map(([path, loader]) => {
    const match = path.match(/_a_(\d+)/)
    return { index: match ? Number(match[1]) : 0, loader }
  })
  .sort((a, b) => a.index - b.index)
  .map((entry) => entry.loader)

const FRAME_COUNT = FRAME_LOADERS.length

/**
 * Applies the circular reveal mask, but only when the value actually changes.
 *
 * Writing `mask-image` with a freshly built gradient string on every scroll
 * tick invalidates paint for the whole sticky section. Rounding to 2dp cuts
 * that to ~100 style writes over a full scrub instead of one per frame.
 */
function applyRevealMask(el, reveal) {
  if (!el) return
  const rounded = Math.round(Math.max(0, Math.min(1, reveal)) * 100) / 100
  if (el.__maskValue === rounded) return
  el.__maskValue = rounded

  /* Keep the film fully opaque until scrub finishes — no early bleed of the next section */
  if (rounded <= 0.001) {
    el.style.webkitMaskImage = 'none'
    el.style.maskImage = 'none'
    el.style.willChange = 'auto'
    el.classList.remove('is-passing')
    return
  }
  const hole = rounded * 145 - 18
  const soft = hole + 38
  const mask = `radial-gradient(circle at 50% 50%, transparent ${hole}%, #000 ${soft}%)`
  el.style.webkitMaskImage = mask
  el.style.maskImage = mask
  el.style.willChange = rounded < 0.98 ? 'mask-image' : 'auto'
  el.classList.toggle('is-passing', rounded > 0.55)
}

/**
 * Scroll-scrubbed packaging film.
 *
 * Frames stream in: only a window around the current frame is requested, and
 * only frames the user can actually scrub to get decoded. The previous version
 * resolved and instantiated all 144 frames (≈235 MB) as soon as the section
 * came within 200px of the viewport, which stalled scrolling, pinned the main
 * thread, and made the reveal stutter on every frame change.
 *
 * Reduced-motion: first frame only, no scrub or mask.
 */
export default function ScrollFilm() {
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const canvasRef = useRef(null)
  const imageCache = useRef(new Map()) // index -> { loaded, img }
  const frameIndexRef = useRef(0)
  const needsRedraw = useRef(true)
  /**
   * Canvas geometry, measured by a ResizeObserver rather than read during
   * paint. `ctx` is memoised because `getContext` is cheap but not free, and
   * `drawFrame` runs on every scroll tick.
   */
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1, ctx: null })

  const [ready, setReady] = useState(false)
  const reduced = usePrefersReducedMotion()
  const near = useInView(sectionRef, { once: true, margin: '400px 0px' })

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 768px)').matches
  })

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    const onChange = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const { scrollYProgress: desktopProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const { scrollYProgress: mobileProgress } = useScroll({
    target: sectionRef,
    offset: ['start 30%', 'end 65%'],
  })

  /**
   * Paints `index` to the canvas.
   *
   * Reads geometry exclusively from `sizeRef`, which a ResizeObserver keeps
   * current. The previous version read `canvas.clientWidth`/`clientHeight` on
   * every frame change — a forced synchronous layout immediately before a
   * full-canvas repaint, which is exactly the scroll-jank pattern we are
   * removing. Nothing in here touches layout now.
   */
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current
    const img = imageCache.current.get(index)?.img
    if (!canvas || !img?.complete || !img.naturalWidth) return

    const cached = sizeRef.current
    const { w: width, h: height } = cached
    if (!width || !height) return

    // The backing store is sized in the ResizeObserver callback, alongside the
    // CSS-pixel measurement it was derived from, so they can never disagree.
    const ctx = cached.ctx || (cached.ctx = canvas.getContext('2d', { alpha: false }))
    if (!ctx) return

    const isPortrait = height > width
    let scale
    if (isPortrait) {
      // In portrait/mobile: fit width comfortably so packaging action is fully framed
      const fitW = width / img.naturalWidth
      const fitH = height / img.naturalHeight
      scale = Math.min(fitW * 1.12, fitH)
    } else {
      scale = Math.max(width / img.naturalWidth, height / img.naturalHeight)
    }

    const drawW = img.naturalWidth * scale
    const drawH = img.naturalHeight * scale
    const x = (width - drawW) / 2
    const y = (height - drawH) / 2

    const dpr = cached.dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#1b1c1e'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, x, y, drawW, drawH)
    needsRedraw.current = false
  }, [])

  /** Ensures frames [lo, hi] have been requested and are decoding. */
  const ensureWindow = useCallback((center) => {
    if (!FRAME_COUNT) return Promise.resolve()
    const lo = Math.max(0, center - WINDOW_BEHIND)
    const hi = Math.min(FRAME_COUNT - 1, center + WINDOW_AHEAD)
    const cache = imageCache.current

    const pending = []
    for (let i = lo; i <= hi; i += 1) {
      if (cache.has(i)) continue
      // Reserve the slot synchronously so rapid scrubbing never queues the
      // same index twice.
      const record = { loaded: false, img: null }
      cache.set(i, record)
      pending.push(i)
    }
    if (!pending.length) return Promise.resolve()

    return (async () => {
      for (let b = 0; b < pending.length; b += FETCH_BATCH) {
        const batch = pending.slice(b, b + FETCH_BATCH)
        // eslint-disable-next-line no-await-in-loop -- intentionally serial so
        // the visible frame is always requested before its neighbours.
        const srcs = await Promise.all(batch.map((i) => FRAME_LOADERS[i]()))
        batch.forEach((i, n) => {
          const record = cache.get(i)
          if (!record || record.img) return
          const img = new Image()
          img.decoding = 'async'
          record.img = img
          const finish = () => {
            record.loaded = true
            // Frames arrive out of order; repaint only if the one that just
            // landed is the one on screen.
            if (i === frameIndexRef.current) drawFrame(i)
          }
          img.addEventListener('load', finish, { once: true })
          img.addEventListener(
            'error',
            () => {
              cache.delete(i)
            },
            { once: true },
          )
          img.src = srcs[n]
        })
        needsRedraw.current = true
        if (frameIndexRef.current <= hi) drawFrame(frameIndexRef.current)
      }
    })()
  }, [drawFrame])

  /* Resolve the opening frame, then hold it until the section is in view. */
  useEffect(() => {
    if (!near || !FRAME_COUNT) return undefined
    let cancelled = false

    const first = FRAME_LOADERS[0]().then((src) => {
      if (cancelled) return
      const img = new Image()
      img.decoding = 'async'
      img.src = src
      imageCache.current.set(0, { loaded: false, img })
      const onReady = () => {
        if (cancelled) return
        imageCache.current.set(0, { loaded: true, img })
        drawFrame(0)
        setReady(true)
        applyRevealMask(stickyRef.current, 0)
      }
      if (img.complete && img.naturalWidth) onReady()
      else img.addEventListener('load', onReady, { once: true })
    })

    first.catch(() => {})
    return () => {
      cancelled = true
    }
  }, [near, drawFrame])

  /**
   * Owns canvas geometry.
   *
   * A ResizeObserver fires after layout is already settled, so the one
   * `clientWidth`/`clientHeight` pair it reads costs nothing, and every
   * subsequent `drawFrame` call is layout-read free. This also catches the
   * cases a `resize` listener misses: mobile URL-bar collapse, orientation
   * change, container queries, and the sticky section growing its own header.
   */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const measure = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return
      // Cap DPR: a 3x backing store on a full-bleed canvas costs ~4.5x the
      // fill rate of 2x for no perceptible gain on photographic frames.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cached = sizeRef.current
      const changed = cached.w !== width || cached.h !== height || cached.dpr !== dpr
      if (!changed) return

      // Writing width/height clears the backing store, so the repaint below is
      // required. Order matters: measure CSS px, resize, then re-memoise ctx.
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      sizeRef.current = { w: width, h: height, dpr, ctx: canvas.getContext('2d', { alpha: false }) }
      drawFrame(frameIndexRef.current)
    }

    const ro = new ResizeObserver(measure)
    ro.observe(canvas)
    // The observer does not fire for a zero-size start, and DPR can change
    // without a box change (moving a window between monitors).
    measure()
    const onDprChange = () => {
      sizeRef.current = { w: 0, h: 0, dpr: 0, ctx: null }
      measure()
    }
    window.addEventListener('resize', onDprChange, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onDprChange)
    }
  }, [drawFrame])

  /* Reduced-motion / low-tier: show one static frame and skip the scrub. */
  useEffect(() => {
    if (!reduced) return undefined
    frameIndexRef.current = 0
    applyRevealMask(stickyRef.current, 0)
    drawFrame(0)
    return undefined
  }, [reduced, drawFrame])

  useEffect(() => {
    if (!near) return undefined
    const { allowHeavyScroll } = getMotionCapability()
    if (reduced || !allowHeavyScroll) return undefined

    let frame = 0
    let inFlight = 0
    const activeProgress = isMobile ? mobileProgress : desktopProgress

    const write = () => {
      frame = 0
      const progress = activeProgress.get()

      if (!isMobile) {
        const fade =
          progress <= SCRUB_END ? 0 : (progress - SCRUB_END) / (1 - SCRUB_END)
        applyRevealMask(stickyRef.current, fade)
      } else {
        applyRevealMask(stickyRef.current, 0)
      }

      const scrub = isMobile
        ? Math.min(1, Math.max(0, progress))
        : progress <= SCRUB_END ? progress / SCRUB_END : 1
      const next = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.round(scrub * (FRAME_COUNT - 1))),
      )
      if (next !== frameIndexRef.current) {
        frameIndexRef.current = next
        needsRedraw.current = true
      }

      const record = imageCache.current.get(next)
      if (record?.loaded) {
        if (needsRedraw.current) drawFrame(next)
      } else {
        // Render nearest loaded frame to avoid visual blanks while streaming
        if (needsRedraw.current) {
          for (let offset = 1; offset <= 5; offset += 1) {
            const before = next - offset
            const after = next + offset
            if (before >= 0 && imageCache.current.get(before)?.loaded) {
              drawFrame(before)
              break
            }
            if (after < FRAME_COUNT && imageCache.current.get(after)?.loaded) {
              drawFrame(after)
              break
            }
          }
        }
        if (!inFlight) {
          inFlight += 1
          ensureWindow(next).finally(() => {
            inFlight -= 1
          })
        }
      }
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(write)
    }

    const unsubscribe = activeProgress.on('change', schedule)
    // Paint once on mount in case the section starts already scrubbed.
    schedule()

    return () => {
      if (frame) cancelAnimationFrame(frame)
      unsubscribe()
    }
  }, [near, reduced, isMobile, desktopProgress, mobileProgress, drawFrame, ensureWindow])

  const touchStartRef = useRef(null)

  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      frame: frameIndexRef.current,
      dragging: false,
    }
  }, [isMobile])

  const handleTouchMove = useCallback((e) => {
    if (!isMobile || !touchStartRef.current) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (!touchStartRef.current.dragging) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        touchStartRef.current.dragging = true
      } else if (Math.abs(dy) > 8) {
        touchStartRef.current = null
        return
      }
    }

    if (touchStartRef.current?.dragging) {
      if (e.cancelable) e.preventDefault()
      const sensitivity = 0.55
      const frameDelta = Math.round(dx * sensitivity)
      const targetFrame = Math.max(
        0,
        Math.min(FRAME_COUNT - 1, touchStartRef.current.frame + frameDelta),
      )
      if (targetFrame !== frameIndexRef.current) {
        frameIndexRef.current = targetFrame
        drawFrame(targetFrame)
        ensureWindow(targetFrame)
      }
    }
  }, [isMobile, drawFrame, ensureWindow])

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null
  }, [])

  return (
    <section
      id="scroll-film"
      className="scroll-film"
      ref={sectionRef}
      aria-label="Product packaging scroll sequence"
    >
      <header className="scroll-film__head">
        <p className="section-label">Made by hand</p>
        <h2 className="section-title">
          From press to <em>parcel</em>
        </h2>
      </header>
      <div
        className="scroll-film__sticky"
        ref={stickyRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          className={`scroll-film__canvas ${ready ? 'is-ready' : ''}`}
          role="img"
          aria-label="Scroll-scrubbed sequence showing the revivaa oil bottle being bottled and boxed"
        />
        {!ready && <div className="scroll-film__placeholder" aria-hidden />}
      </div>
    </section>
  )
}
