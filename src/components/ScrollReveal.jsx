import { Children, isValidElement } from 'react'
import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './ScrollReveal.css'

/**
 * Shared entrance vocabulary for the site.
 *
 * Variants: "fade-up" | "blur-in" | "mask-wipe-left" | "mask-wipe-right" |
 *           "scale-in" | "stagger-children"
 *
 * Usage:
 *   <ScrollReveal variant="fade-up">…</ScrollReveal>
 *   <ScrollReveal variant="stagger-children" stagger={0.08}>
 *     <div>A</div><div>B</div>
 *   </ScrollReveal>
 *
 * Reduced-motion / failed JS: children render fully visible in DOM order.
 * Do not invent one-off section entrances — use these variants.
 */

const EASE = [0.22, 1, 0.36, 1]

const VARIANT_MAP = {
  'fade-up': {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
  },
  'blur-in': {
    hidden: { opacity: 0, y: 16, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
  'mask-wipe-left': {
    hidden: { opacity: 1, clipPath: 'inset(0 100% 0 0)' },
    visible: { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
  },
  'mask-wipe-right': {
    hidden: { opacity: 1, clipPath: 'inset(0 0 0 100%)' },
    visible: { opacity: 1, clipPath: 'inset(0 0 0 0%)' },
  },
  'scale-in': {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1 },
  },
  'stagger-children': {
    hidden: {},
    visible: {},
  },
}

const STAGGER_CHILD = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const VISIBLE_STATIC = { opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)', clipPath: 'none' }

/**
 * @param {{
 *   variant?: keyof typeof VARIANT_MAP,
 *   delay?: number,
 *   duration?: number,
 *   stagger?: number,
 *   once?: boolean,
 *   amount?: number | 'some' | 'all',
 *   as?: keyof JSX.IntrinsicElements,
 *   className?: string,
 *   children?: React.ReactNode,
 * }} props
 */
export default function ScrollReveal({
  variant = 'fade-up',
  delay = 0,
  duration = 0.7,
  stagger = 0.08,
  once = true,
  amount = 0.25,
  as = 'div',
  className = '',
  children,
  ...rest
}) {
  const reduced = usePrefersReducedMotion()
  const MotionTag = motion[as] ?? motion.div
  const key = VARIANT_MAP[variant] ? variant : 'fade-up'
  const baseClass = ['scroll-reveal', `scroll-reveal--${key}`, className]
    .filter(Boolean)
    .join(' ')

  if (reduced) {
    const StaticTag = as
    return (
      <StaticTag className={`${baseClass} is-static`} {...rest}>
        {children}
      </StaticTag>
    )
  }

  if (key === 'stagger-children') {
    return (
      <MotionTag
        className={baseClass}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: stagger, delayChildren: delay },
          },
        }}
        {...rest}
      >
        {Children.map(children, (child, i) => {
          if (!isValidElement(child)) return child
          return (
            <motion.div
              key={child.key ?? i}
              className="scroll-reveal__item"
              variants={STAGGER_CHILD}
              transition={{ duration, ease: EASE }}
            >
              {child}
            </motion.div>
          )
        })}
      </MotionTag>
    )
  }

  const states = VARIANT_MAP[key]

  return (
    <MotionTag
      className={baseClass}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: states.hidden,
        visible: {
          ...states.visible,
          transition: { duration, delay, ease: EASE },
        },
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

/** Static visible state export for tests / fallbacks */
export const SCROLL_REVEAL_STATIC = VISIBLE_STATIC

const VARIANT_KEYS = Object.keys(VARIANT_MAP)
export { VARIANT_KEYS as SCROLL_REVEAL_VARIANTS }
