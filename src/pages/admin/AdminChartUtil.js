export function compactNumber(n) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(Math.round(n))
}

export function localISODate(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const CHART_PALETTE = [
  '#878038',
  '#f2970c',
  '#5a7d63',
  '#b5783d',
  '#4f6d8f',
  '#8f5f78',
  '#7a7f31',
  '#c98a4b',
  '#3f5d5d',
]

export function dayRange(days) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - (days - 1))
  start.setHours(0, 0, 0, 0)
  return { from: localISODate(start), to: localISODate(end) }
}