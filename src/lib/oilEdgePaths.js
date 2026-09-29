/**
 * Precomputed oil-edge SVG paths (viewBox 0 0 1440 48).
 * Open wavy polylines for stroke-based dividers — never a solid filled band.
 */

function waveStroke(phase, amp = 6) {
  const mid = 24
  const yAt = (x, p) => {
    const n = x / 1440
    return (
      mid +
      Math.sin(n * Math.PI * 3 + p) * amp +
      Math.sin(n * Math.PI * 5 + p * 1.3) * (amp * 0.45) +
      Math.sin(n * Math.PI * 1.2 + p * 0.6) * (amp * 0.25)
    )
  }
  const steps = 20
  const pts = []
  for (let i = 0; i <= steps; i += 1) {
    const x = (i / steps) * 1440
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${yAt(x, phase).toFixed(1)}`)
  }
  return pts.join(' ')
}

/** 8 keyframes spanning one pour cycle */
export const OIL_EDGE_PATHS = Array.from({ length: 8 }, (_, i) =>
  waveStroke((i / 7) * Math.PI * 2, 5 + (i % 3) * 0.6),
)

/**
 * @param {number} progress 0..1
 * @returns {number} keyframe index
 */
export function oilEdgeIndex(progress) {
  const p = Math.max(0, Math.min(1, progress))
  return Math.round(p * (OIL_EDGE_PATHS.length - 1))
}
