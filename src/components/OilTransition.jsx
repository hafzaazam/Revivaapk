import { useId, useEffect, useRef, useState } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import { OIL_EDGE_PATHS, oilEdgeIndex } from '../lib/oilEdgePaths'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './OilTransition.css'

/**
 * Thin liquid-edge divider between major sections.
 *
 * Place BETWEEN full sections (not inside them).
 *
 * Critical: never use position:sticky here. Sticky + N instances previously
 * stacked opaque SVG bands across the viewport on top of section content.
 * This is a short absolute watermark (z-index 0) behind foreground UI.
 *
 * There are seven of these on the landing page and each one used to open its
 * own `useScroll` + `useMotionValueEvent` pair against the window scroll. They
 * now share a single `useScroll()` with no target (page-level progress) and
 * swap the SVG path imperatively, so scrolling costs seven closure calls and
 * zero renders instead of seven layout measurements and seven renders.
 *
 * Reduced-motion: collapses to a 1px static gradient rule.
 */
export default function OilTransition({
  height = '48px',
  className = '',
  ...rest
}) {
  const pathRef = useRef(null)
  const gradId = useId().replace(/:/g, '')
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)

  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])
  // Opacity stays a MotionValue on the layer so it animates on the compositor
  // rather than through React state.
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  // Page-level progress is shared by every instance; only react when this
  // divider's own path actually needs to change.
  useEffect(() => {
    if (reduced) return undefined
    const unsubscribe = scrollYProgress.on('change', (v) => {
      const next = oilEdgeIndex(v)
      const node = pathRef.current
      if (node) {
        const d = OIL_EDGE_PATHS[next]
        if (node.getAttribute('d') !== d) {
          node.setAttribute('d', d)
          const mirror = node.nextElementSibling
          if (mirror && mirror.tagName === 'path' && mirror.getAttribute('d') !== d) {
            mirror.setAttribute('d', d)
          }
        }
        return
      }
      setIndex((cur) => (cur === next ? cur : next))
    })
    return unsubscribe
  }, [scrollYProgress, reduced])

  if (reduced) {
    return (
      <div
        className={`oil-transition oil-transition--static ${className}`.trim()}
        aria-hidden
        {...rest}
      />
    )
  }

  const d = OIL_EDGE_PATHS[index]
  const stroke = `url(#oil-grad-${gradId})`

  return (
    <div
      className={`oil-transition ${className}`.trim()}
      style={{ '--oil-zone-h': height }}
      aria-hidden
      {...rest}
    >
      <div className="oil-transition__stage">
        <motion.div className="oil-transition__layer" style={{ y, opacity }}>
          <svg
            className="oil-transition__svg"
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={`oil-grad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-olive, #878038)" stopOpacity="0.55" />
                <stop offset="50%" stopColor="var(--color-orange, #f2970c)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="var(--color-olive, #878038)" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Soft under-glow (narrow — avoid thick opaque slabs) */}
            <path
              ref={pathRef}
              d={d}
              fill="none"
              stroke={stroke}
              strokeWidth="6"
              strokeLinecap="round"
              className="oil-transition__glow"
            />
            {/* Crisp wave line */}
            <path
              d={d}
              fill="none"
              stroke={stroke}
              strokeWidth="1.75"
              strokeLinecap="round"
              className="oil-transition__path"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}
