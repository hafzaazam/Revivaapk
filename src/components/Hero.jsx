import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { useParallax } from '../hooks/useParallax'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { oilPourClip } from '../lib/liquidClip'
import { fetchProducts } from '../lib/shop'
import HeroBackdrop from './hero/HeroBackdrop'
import './Hero.css'

const EASE = [0.22, 1, 0.36, 1]

/**
 * Hero — oil backdrop already revealed by preloader wipe; staged entrances wait for `ready`.
 *
 * The pour clip and scroll cue are written straight to the DOM from the scroll
 * motion value. Driving them through `useState` re-rendered the whole hero on
 * every scroll frame, which is what made scrolling feel like stutter.
 */
export default function Hero({ ready = false }) {
  const ref = useRef(null)
  const cueRef = useRef(null)
  const reducedMotion = usePrefersReducedMotion()
  const [shopTarget, setShopTarget] = useState('/shop')

  useEffect(() => {
    let alive = true
    fetchProducts()
      .then(({ data }) => {
        if (!alive) return
        setShopTarget(data.length === 1 ? `/product/${data[0].slug}` : '/shop')
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

const { ref: bgParallaxRef } = useParallax(10)
const { ref: productParallaxRef } = useParallax(15)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const contentOpacity = useTransform(scrollYProgress, [0.15, 0.62], [1, 0])
  const contentScale = useTransform(scrollYProgress, [0.15, 0.7], [1, 0.96])
  const contentY = useTransform(scrollYProgress, [0.15, 0.7], [0, -28])
  const pour = useTransform(scrollYProgress, [0.28, 0.92], [0, 1])

  // Derived scroll effects run in one effect so they read a single layout
  // snapshot and write only composited properties.
  useEffect(() => {
    if (reducedMotion) return undefined

    let clipPending = true
    let cuePending = true
    let frame = 0

    const write = () => {
      frame = 0
      const el = ref.current
      if (el && clipPending) {
        el.style.clipPath = oilPourClip(pour.get())
        clipPending = false
      }
      const cue = cueRef.current
      if (cue && cuePending) {
        const o = Math.max(0, 1 - scrollYProgress.get() * 4.5)
        cue.style.opacity = String(o)
        cue.style.pointerEvents = o < 0.08 ? 'none' : 'auto'
        cuePending = false
      }
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(write)
    }

    const unsubPour = pour.on('change', () => {
      clipPending = true
      schedule()
    })
    const unsubScroll = scrollYProgress.on('change', () => {
      cuePending = true
      schedule()
    })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      unsubPour()
      unsubScroll()
    }
  }, [reducedMotion, pour, scrollYProgress])

  return (
    <section
      id="hero"
      className={`hero liquid-wipe liquid-wipe--pour ${ready ? 'is-ready' : ''}`}
      ref={ref}
    >
      <HeroBackdrop parallaxRef={bgParallaxRef} reducedMotion={reducedMotion} ready={ready} />

      <motion.div
        className="hero__stage"
        style={
          reducedMotion
            ? undefined
            : { opacity: contentOpacity, scale: contentScale, y: contentY }
        }
      >
        <div className="hero__content">
          <motion.p
            className="hero__eyebrow"
            initial={false}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
          >
            Soft &amp; Natural · 150ml
          </motion.p>

          <motion.h1
            className="hero__brand"
            initial={false}
            animate={
              ready
                ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                : { opacity: 0, y: 20, filter: 'blur(8px)' }
            }
            transition={{ delay: 0.22, duration: 0.95, ease: EASE }}
          >
            revivaa
            <span className="sr-only"> by Zaish · Revivaa Care · Botanical Hair Oil for Stronger Hair Pakistan</span>
          </motion.h1>

          <motion.div
            className="hero__rule"
            initial={false}
            animate={ready ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
            transition={{ delay: 0.38, duration: 0.7, ease: EASE }}
          />

          <motion.p
            className="hero__needs"
            initial={false}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ delay: 0.46, duration: 0.65, ease: EASE }}
          >
            basic human needs — oxygen, water, <em>revivaa oil</em>
          </motion.p>

          <motion.p
            className="hero__lead"
            initial={false}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ delay: 0.54, duration: 0.65, ease: EASE }}
          >
            Nourish. Strengthen. Shine. Botanical care from root to tip.
          </motion.p>

          <motion.div
            className="hero__cta"
            initial={false}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ delay: 0.62, duration: 0.65, ease: EASE }}
          >
            <Link to={shopTarget} className="clay-btn">
              Shop the oil
            </Link>
            <a href="#ingredients" className="clay-btn clay-btn-light">
              13 botanicals
            </a>
          </motion.div>
        </div>

        <motion.div
          className="hero__visual"
          initial={false}
          animate={
            ready
              ? { opacity: 1, x: 0, rotate: 0 }
              : { opacity: 0, x: 40, rotate: 6 }
          }
          transition={{ delay: 0.36, duration: 1.05, ease: EASE }}
        >
          <div className="hero__product-parallax" ref={productParallaxRef}>
            <picture>
              <source srcSet="/images/hero-product.webp" type="image/webp" />
              <img
                src="/images/hero-product.png"
                alt="revivaa oil bottle and box"
                className="hero__product"
                width={480}
                height={640}
                decoding="async"
                fetchPriority="high"
              />
            </picture>
          </div>
        </motion.div>
      </motion.div>

      <a
        href="#solution"
        className="hero__scroll"
        ref={cueRef}
        aria-label="Scroll to next section"
      >
        <span>Scroll</span>
        <ArrowDown size={14} strokeWidth={1.5} aria-hidden />
      </a>
    </section>
  )
}
