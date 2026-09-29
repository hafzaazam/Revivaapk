import { useEffect, useRef, useState } from 'react'
import { compactNumber } from './AdminChartUtil'
import './AdminCharts.css'

function useElementWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width
      if (w) setWidth(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

function niceMax(values) {
  const raw = Math.max(...values, 1)
  const pow = 10 ** Math.floor(Math.log10(raw))
  const unit = raw / pow
  const factor = unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10
  return factor * pow
}

/* Hand-rolled SVG series chart — area (revenue/discount) or bars (orders) */
export function SeriesChart({
  data = [],
  metric = 'revenue',
  mode = 'area',
  color = '#878038',
  height = 260,
  format = (n) => n,
}) {
  const [ref, width] = useElementWidth()
  const [hover, setHover] = useState(null)
  const pad = { l: 46, r: 14, t: 16, b: 34 }

  if (width < 40) {
    return <div ref={ref} className="ac-chart" style={{ height }} />
  }

  const values = data.map((d) => d[metric] || 0)
  const max = niceMax(values)
  const innerW = width - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  const n = data.length
  const step = n > 1 ? innerW / (n - 1) : innerW
  const barW = n > 1 ? Math.min(innerW / n * 0.62, 46) : 46
  const yOf = (v) => pad.t + innerH - (innerH * (v / max))
  const pts = data.map((d, i) => {
    const x = n > 1 ? pad.l + i * step : pad.l + innerW / 2
    return { x, y: yOf(d[metric] || 0), d }
  })

  const yTicks = [0, 0.25, 0.5, 0.75, 1]
  const maxLabels = Math.max(1, Math.floor(innerW / 92))
  const labelEvery = Math.ceil(n / maxLabels)

  const hoverD = data[hover]

  return (
    <div ref={ref} className="ac-chart" style={{ height }}>
      {!n && <p className="ac-chart__empty">No sales in this period yet.</p>}
      {n > 0 && (
        <div className="ac-chart__wrap">
          <svg
            width={width}
            height={height}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const px = e.clientX - rect.left
              const idx = Math.max(
                0,
                Math.min(n - 1, Math.round((px - pad.l) / (step || 1))),
              )
              setHover(idx)
            }}
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id={`ac-fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {yTicks.map((t) => {
              const y = pad.t + innerH - innerH * t
              return (
                <g key={t}>
                  <line x1={pad.l} x2={width - pad.r} y1={y} y2={y} className="ac-grid" />
                  <text x={pad.l - 8} y={y + 4} className="ac-axis-y" textAnchor="end">
                    {compactNumber(max * t)}
                  </text>
                </g>
              )
            })}

            {data.map((d, i) => {
              const p = pts[i]
              if (i === 0 || i % labelEvery === 0 || i === n - 1) {
                return (
                  <text key={`x${i}`} x={p.x} y={height - 10} className="ac-axis-x" textAnchor="middle">
                    {d.label}
                  </text>
                )
              }
              return null
            })}

            {mode === 'area' && n > 1 && (
              <>
                <path
                  d={`M ${pts.map((p) => `${p.x},${p.y}`).join(' L ')}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={`M ${pts[0].x},${pad.t + innerH} L ${pts
                    .map((p) => `${p.x},${p.y}`)
                    .join(' L ')} L ${pts[n - 1].x},${pad.t + innerH} Z`}
                  fill={`url(#ac-fill-${metric})`}
                />
              </>
            )}
            {mode === 'area' && n === 1 && (
              <circle cx={pts[0].x} cy={pts[0].y} r={4} fill={color} />
            )}

            {mode === 'bar' &&
              pts.map((p, i) => (
                <rect
                  key={i}
                  x={p.x - barW / 2}
                  y={p.y}
                  width={barW}
                  height={Math.max(1, pad.t + innerH - p.y)}
                  rx={4}
                  fill={color}
                  opacity={hover === i ? 1 : 0.82}
                />
              ))}

            {hover !== null && hoverD && (
              <line
                x1={pts[hover].x}
                x2={pts[hover].x}
                y1={pad.t - 4}
                y2={height - pad.b + 4}
                className="ac-cursor"
              />
            )}
          </svg>

          {hover !== null && hoverD && (
            <div
              className="ac-tooltip"
              style={{ left: Math.min(Math.max(pts[hover].x - 70, 4), width - 150) }}
            >
              <strong>{hoverD.label}</strong>
              <span>{format(hoverD[metric] || 0)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* Donut chart for share breakdowns */
export function DonutChart({ parts = [], size = 180, format }) {
  const total = parts.reduce((s, p) => s + (p.value || 0), 0)
  const r = size / 2 - 18
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  let acc = 0

  return (
    <div className="ac-donut" style={{ maxWidth: size }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} className="ac-donut__track" />
        {total > 0 &&
          parts.map((p, i) => {
            const frac = (p.value || 0) / total
            const dash = Math.max(frac * circ - 2, 0)
            const off = -acc * circ
            acc += frac
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                className="ac-donut__arc"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={off}
                stroke={p.color}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            )
          })}
        <text x={cx} y={cy - 4} className="ac-donut__total" textAnchor="middle">
          {total}
        </text>
        <text x={cx} y={cy + 14} className="ac-donut__label" textAnchor="middle">
          total
        </text>
      </svg>
      <ul className="ac-donut__legend">
        {parts.map((p, i) => (
          <li key={i}>
            <span className="ac-donut__swatch" style={{ background: p.color }} />
            <span className="ac-donut__name">{p.label}</span>
            <span className="ac-donut__value">
              {format ? format(p.value) : p.value}
              {total > 0 ? ` · ${Math.round((100 * (p.value || 0)) / total)}%` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}