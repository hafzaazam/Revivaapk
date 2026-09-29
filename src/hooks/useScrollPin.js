import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useScroll, useTransform } from 'framer-motion'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { useIsMobilePin } from './useMediaQuery'

/**
 * Scroll-scrubbed pin controller for sticky tab/panel sections.
 *
 * Scroll math: progress 0→1 across the tall track maps to panel index via
 * thresholds (e.g. [0.32, 0.62] → three acts). scrollToPanel jumps to ~35%
 * into each act’s segment so the active state is unambiguous after click.
 *
 * Safari note: sticky + 100dvh; unpin on mobile to avoid nested-scroll traps.
 *
 * `activeIndex` is the only thing that re-renders. The raw progress is exposed
 * as a MotionValue (`scrollYProgress`) and read imperatively; the previous
 * version mirrored every scroll frame into `useState`, re-rendering each pinned
 * section — tabs, three panels, progress dots — on every pixel of scroll.
 */
export function useScrollPin(ref, options = {}) {
  const panelCount = options.panels ?? 3
  const reducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobilePin()
  const [activeIndex, setActiveIndex] = useState(0)

  /** Unpin on mobile or reduced-motion — stacked readable layout instead. */
  const unpin = reducedMotion || isMobile

  const thresholds = useMemo(() => {
    if (options.thresholds?.length) return options.thresholds
    const cuts = []
    for (let i = 1; i < panelCount; i += 1) {
      cuts.push(i / panelCount)
    }
    return cuts
  }, [options.thresholds, panelCount])

  const jumpTargets = useMemo(() => {
    // Land slightly into each act so the active state is unambiguous
    return Array.from({ length: panelCount }, (_, i) => {
      if (panelCount <= 1) return 0
      const start = i === 0 ? 0 : thresholds[i - 1]
      const end = i === panelCount - 1 ? 1 : thresholds[i]
      return start + (end - start) * 0.35
    })
  }, [panelCount, thresholds])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  const progressWidth = useTransform(scrollYProgress, [0, 1], [0, 1])

  // Keep thresholds in a ref so the subscription is created once per mount
  // instead of being torn down and rebuilt whenever the array identity changes.
  // Mirrored from an effect rather than assigned during render, which the
  // react-hooks rules reject; `useRef`'s initial value covers the first pass.
  const cutsRef = useRef(thresholds)
  useEffect(() => {
    cutsRef.current = thresholds
  }, [thresholds])

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      const cuts = cutsRef.current
      let next = 0
      for (let i = 0; i < cuts.length; i += 1) {
        if (v >= cuts[i]) next = i + 1
      }
      // Functional update: React bails out when the value is unchanged, so this
      // does not re-render unless the active panel actually flipped.
      setActiveIndex((cur) => (cur === next ? cur : next))
    })
    return unsubscribe
  }, [scrollYProgress])

  const scrollToPanel = useCallback(
    (index) => {
      const el = ref.current
      if (!el || unpin) return
      const i = Math.max(0, Math.min(panelCount - 1, index))
      // Read both measurements in one pass, then do all writes: interleaving
      // reads and writes here is what forces a synchronous reflow.
      const rect = el.getBoundingClientRect()
      const range = Math.max(1, el.offsetHeight - window.innerHeight)
      const top = rect.top + window.scrollY
      const t = jumpTargets[i] ?? i / Math.max(1, panelCount - 1)
      window.scrollTo({ top: top + range * t, behavior: 'smooth' })
    },
    [ref, unpin, panelCount, jumpTargets],
  )

  return {
    scrollYProgress,
    activeIndex,
    progressWidth,
    reducedMotion,
    isMobile,
    unpin,
    panelCount,
    scrollToPanel,
  }
}

export function progressToIndex(progress, panelCount, thresholds) {
  const cuts =
    thresholds ??
    Array.from({ length: panelCount - 1 }, (_, i) => (i + 1) / panelCount)
  let next = 0
  for (let i = 0; i < cuts.length; i += 1) {
    if (progress >= cuts[i]) next = i + 1
  }
  return next
}
