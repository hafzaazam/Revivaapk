/**
 * Lightweight capability gate for decorative motion.
 * Call at effect-time (not during SSR render) — reads navigator/matchMedia.
 *
 * Low-end: Save-Data, ≤4 cores, or prefers-reduced-motion → strip heavy effects.
 * Safari sticky/orbit still run on "full"; low-end drops parallax + continuous orbit spin.
 */
export function getMotionCapability() {
  if (typeof window === 'undefined') {
    return { allowParallax: false, allowOrbit: false, allowHeavyScroll: false, tier: 'low' }
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const saveData = Boolean(navigator.connection?.saveData)
  const cores = navigator.hardwareConcurrency || 4
  const lowEnd = saveData || cores <= 4

  if (reduced) {
    return { allowParallax: false, allowOrbit: false, allowHeavyScroll: false, tier: 'reduced' }
  }

  return {
    allowParallax: !coarse && !lowEnd,
    allowOrbit: !lowEnd,
    allowHeavyScroll: !saveData,
    tier: lowEnd ? 'low' : 'full',
  }
}
