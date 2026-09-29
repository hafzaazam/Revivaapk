import { Children, forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import './ScrollPinnedSection.css'

/**
 * Shared shell for scroll-scrubbed sticky tab sections.
 * Pass `unpin` (mobile / reduced-motion) to stack without pinning.
 *
 * Do NOT put multiple panels in a horizontal flex/grid row — use PinPanelStack
 * so only one panel is interactive/visible at a time.
 */
const ScrollPinnedSection = forwardRef(function ScrollPinnedSection(
  {
    id,
    height = '240vh',
    className = '',
    reducedMotion = false,
    unpin = false,
    children,
  },
  ref,
) {
  const staticMode = reducedMotion || unpin
  const rootClass = [
    'scroll-pin',
    className,
    staticMode ? 'is-static' : '',
    unpin && !reducedMotion ? 'is-mobile-stack' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      id={id}
      ref={ref}
      className={rootClass}
      style={staticMode ? undefined : { '--scroll-pin-h': height }}
    >
      <div className="scroll-pin__sticky">{children}</div>
    </section>
  )
})

const PANEL_EASE = [0.22, 1, 0.36, 1]

/**
 * Exactly one panel in normal document flow at a time.
 * Inactive: position absolute (out of flow), opacity 0, pointer-events none.
 * Never side-by-side flex/grid — that was squeezing cards to ~1/3 width.
 * Transition: ~200ms opacity + slight X slide.
 */
export function PinPanelStack({ activeIndex = 0, children, className = '' }) {
  const panels = Children.toArray(children)
  const [dir, setDir] = useState(1)
  const [trackedIndex, setTrackedIndex] = useState(activeIndex)

  /* Adjust slide direction when the active tab changes (React-supported render-time sync) */
  if (activeIndex !== trackedIndex) {
    setDir(activeIndex > trackedIndex ? 1 : -1)
    setTrackedIndex(activeIndex)
  }

  return (
    <div className={['pin-panel-stack', className].filter(Boolean).join(' ')}>
      {panels.map((child, i) => {
        const active = i === activeIndex
        return (
          <motion.div
            key={child.key ?? i}
            className={`pin-panel-stack__panel ${active ? 'is-active' : ''}`}
            /* `inert` is what actually removes the hidden panels' links and
               buttons from the tab order. `aria-hidden` alone left them
               focusable, so keyboard users tabbed into invisible content. */
            inert={!active ? true : undefined}
            aria-hidden={!active}
            initial={false}
            animate={{
              opacity: active ? 1 : 0,
              x: active ? 0 : dir * (i < activeIndex ? -28 : 28),
              visibility: active ? 'visible' : 'hidden',
            }}
            transition={{
              opacity: { duration: 0.2, ease: PANEL_EASE },
              x: { duration: 0.22, ease: PANEL_EASE },
              visibility: { delay: active ? 0 : 0.2 },
            }}
          >
            {child}
          </motion.div>
        )
      })}
    </div>
  )
}

export function PinProgress({ progressWidth, activeIndex = 0, labels = [] }) {
  return (
    <div className="scroll-pin__progress" aria-hidden>
      {/* scaleX (not width) — GPU-friendly scroll scrub */}
      {progressWidth ? (
        <motion.div
          className="scroll-pin__progress-fill"
          style={{ scaleX: progressWidth, transformOrigin: 'left center' }}
        />
      ) : (
        <div className="scroll-pin__progress-fill" style={{ transform: 'scaleX(0)' }} />
      )}
      {labels.length > 0 && (
        <div className="scroll-pin__dots">
          {labels.map((label, i) => (
            <span
              key={label}
              className={`scroll-pin__dot ${i === activeIndex ? 'is-active' : ''} ${i < activeIndex ? 'is-passed' : ''}`}
              title={label}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Display tabs reflecting scroll-scrubbed active panel.
 * Clickable buttons jump via scrollToPanel — not true ARIA tabs (no tabpanels);
 * use aria-pressed so keyboard users get selection state without trapping focus.
 */
export function PinTabs({
  tabs = [],
  activeIndex = 0,
  label = 'Section panels',
  className = '',
  onSelect,
}) {
  return (
    <div
      className={['scroll-pin__tabs', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={label}
    >
      {tabs.map((tabLabel, i) => (
        <button
          key={tabLabel}
          type="button"
          aria-pressed={i === activeIndex}
          className={`scroll-pin__tab ${i === activeIndex ? 'is-active' : ''}`}
          onClick={() => onSelect?.(i)}
        >
          <em>0{i + 1}</em>
          {tabLabel}
        </button>
      ))}
    </div>
  )
}

export default ScrollPinnedSection
