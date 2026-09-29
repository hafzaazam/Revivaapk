/**
 * Reusable oil-edge clip-paths for section transitions.
 * progress is 0..1.
 */

function waveY(base, i, amplitude, phase) {
  // 12 sample points across width — soft liquid scallops
  const t = i / 11
  return (
    base +
    Math.sin(t * Math.PI * 3 + phase) * amplitude +
    Math.sin(t * Math.PI * 5 + phase * 1.4) * (amplitude * 0.35)
  )
}

/**
 * Pour-out (hero exiting): overlay drains downward.
 * 0 = fully visible, 1 = fully gone.
 */
export function oilPourClip(progress) {
  const p = Math.max(0, Math.min(1, progress))
  if (p <= 0.001) return 'none'
  if (p >= 0.999) return 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)'

  const top = p * 100
  const amp = 2.2 * (1 - p * 0.35)
  const pts = []
  for (let i = 0; i <= 11; i += 1) {
    const x = (i / 11) * 100
    const y = waveY(top, i, amp, p * 4)
    pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`)
  }
  return `polygon(${pts.join(', ')}, 100% 100%, 0% 100%)`
}

/**
 * Reveal-in (next section rising): content settles up through oil edge.
 * 0 = hidden below wavy edge, 1 = fully revealed.
 */
export function oilRevealClip(progress) {
  const p = Math.max(0, Math.min(1, progress))
  if (p >= 0.999) return 'none'
  if (p <= 0.001) return 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)'

  const edge = (1 - p) * 100
  const amp = 2.4 * (1 - p * 0.4)
  const pts = []
  for (let i = 0; i <= 11; i += 1) {
    const x = (i / 11) * 100
    const y = waveY(edge, i, amp, (1 - p) * 3.5)
    pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`)
  }
  return `polygon(${pts.join(', ')}, 100% 100%, 0% 100%)`
}
