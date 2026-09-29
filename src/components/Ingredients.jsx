import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { INGREDIENTS, INGREDIENT_COUNT } from '../data/ingredients'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useMediaQuery } from '../hooks/useMediaQuery'
import './Ingredients.css'

/**
 * Three-tier responsive image URLs optimized with auto=format,compress, fm=webp,
 * and device-targeted dimensions to drastically reduce network payload on mobile and tablets.
 */
const INGREDIENT_BASE_URLS = {
  rosemary: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662',
  amla: 'https://images.unsplash.com/photo-1676043967557-2b70d9facd71',
  Retha: 'https://images.unsplash.com/photo-1633299888396-b3691b718855',
  Sikakai: 'https://images.unsplash.com/photo-1603729657598-9470c0ddc66d',
  dhaniya: 'https://images.unsplash.com/photo-1607767582993-8431e01b0952',
  Alsi: 'https://plus.unsplash.com/premium_photo-1726072357487-d5f62862a220',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb',
  'lavender-leaves': 'https://plus.unsplash.com/premium_photo-1673728254015-9a437bdb44aa',
  vitamine: 'https://plus.unsplash.com/premium_photo-1661775293846-7533a50c371f',
  'aloe-vera': 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921',
  coconut: 'https://images.unsplash.com/photo-1580984969071-a8da5656c2fb',
  almond: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46',
  'black-seed': 'https://plus.unsplash.com/premium_photo-1671130295885-19cd68bde34f',
  default: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662',
}

const INGREDIENT_TINT = {
  rosemary: 'rgba(28, 42, 24, 0.62)',
  amla: 'rgba(56, 66, 22, 0.58)',
  Retha: 'rgba(20, 30, 20, 0.68)',
  Sikakai: 'rgba(30, 46, 28, 0.60)',
  dhaniya: 'rgba(60, 18, 30, 0.60)',
  Alsi: 'rgba(64, 48, 20, 0.60)',
  onion: 'rgba(52, 38, 28, 0.62)',
  'lavender-leaves': 'rgba(24, 38, 22, 0.65)',
  vitamine: 'rgba(18, 32, 18, 0.68)',
  'aloe-vera': 'rgba(28, 46, 32, 0.58)',
  coconut: 'rgba(56, 42, 22, 0.60)',
  almond: 'rgba(58, 42, 30, 0.60)',
  'black-seed': 'rgba(10, 8, 6, 0.72)',
  default: 'rgba(20, 20, 14, 0.62)',
}

function keyFor(item) {
  return item?.id || item?.slug || item?.name?.toLowerCase().replace(/\s+/g, '-')
}

function stockFor(item, tier = 'desktop') {
  const base = INGREDIENT_BASE_URLS[keyFor(item)] || INGREDIENT_BASE_URLS.default
  let width = 1080
  let quality = 62

  if (tier === 'mobile') {
    width = 480
    quality = 50
  } else if (tier === 'tablet') {
    width = 720
    quality = 55
  }

  return `${base}?w=${width}&q=${quality}&auto=format,compress&fm=webp&fit=crop`
}

function tintFor(item) {
  return INGREDIENT_TINT[keyFor(item)] || INGREDIENT_TINT.default
}

export default function Ingredients() {
  const sectionRef = useRef(null)
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const reduced = usePrefersReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const [active, setActive] = useState(0)
  const lastIndexRef = useRef(0)
  const preloadedMapRef = useRef(new Set())

  // Touch gesture coordinates for fluid mobile/tablet swipe
  const touchStartXRef = useRef(0)
  const touchStartYRef = useRef(0)

  // Direct, zero-lag scroll tracking mapped precisely to 13 chapters
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const raw = Math.max(0, Math.min(0.9999, v))
    const scaled = raw * INGREDIENT_COUNT
    const base = Math.floor(scaled)
    const frac = scaled - base

    let next = base
    if (frac > 0.65 && base < INGREDIENT_COUNT - 1) {
      next = base + 1
    } else if (frac < 0.35 && base > 0) {
      next = base
    }

    next = Math.min(INGREDIENT_COUNT - 1, Math.max(0, next))

    if (next !== lastIndexRef.current) {
      lastIndexRef.current = next
      setActive(next)
    }
  })

  const current = INGREDIENTS[active] || INGREDIENTS[0]
  const nextItem = INGREDIENTS[(active + 1) % INGREDIENT_COUNT]

  // Device tier resolution for predictive preloading
  const currentTier = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

  // On-demand predictive preloading: preloads both next & previous images for current device tier
  useEffect(() => {
    const nextIdx = (active + 1) % INGREDIENT_COUNT
    const prevIdx = (active - 1 + INGREDIENT_COUNT) % INGREDIENT_COUNT
    const targets = [INGREDIENTS[nextIdx], INGREDIENTS[prevIdx]]

    targets.forEach((item) => {
      const url = stockFor(item, currentTier)
      if (!preloadedMapRef.current.has(url)) {
        preloadedMapRef.current.add(url)
        const img = new Image()
        img.decoding = 'async'
        img.src = url
      }
    })
  }, [active, currentTier])

  // Desktop & mobile chapter scrolling helper
  const scrollToChapter = useCallback((index) => {
    if (!sectionRef.current) return
    const sectionTop = sectionRef.current.offsetTop
    const sectionHeight = sectionRef.current.offsetHeight
    const viewportHeight = window.innerHeight
    const scrollableDistance = sectionHeight - viewportHeight

    if (scrollableDistance <= 0) {
      setActive(index)
      return
    }

    const targetFraction = Math.max(0, Math.min(1, index / (INGREDIENT_COUNT - 1)))
    const targetY = sectionTop + targetFraction * scrollableDistance

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    })
  }, [])

  const nextChapter = useCallback(() => {
    scrollToChapter((active + 1) % INGREDIENT_COUNT)
  }, [active, scrollToChapter])

  const prevChapter = useCallback(() => {
    scrollToChapter((active - 1 + INGREDIENT_COUNT) % INGREDIENT_COUNT)
  }, [active, scrollToChapter])

  // Mobile & tablet horizontal swipe detection
  const handleTouchStart = useCallback((e) => {
    if (!e.touches || !e.touches[0]) return
    touchStartXRef.current = e.touches[0].clientX
    touchStartYRef.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current

      // Horizontal swipe threshold: 40px, predominantly horizontal
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
        if (deltaX < 0) {
          nextChapter()
        } else {
          prevChapter()
        }
      }
    },
    [nextChapter, prevChapter]
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        nextChapter()
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        prevChapter()
      }
    },
    [nextChapter, prevChapter]
  )

  return (
    <section
      id="ingredients"
      ref={sectionRef}
      className="cine section"
      aria-label="13 Botanical Ingredients Showcase"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ '--scene-count': INGREDIENT_COUNT }}
    >
      <div className="cine__sticky">
        {/* Full-bleed cinematic backdrop with instant cross-fade */}
        <div className="cine__backdrop" aria-hidden>
          <AnimatePresence initial={false}>
            <motion.div
              key={current.id}
              className="cine__scene"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reduced ? 0 : 0.28,
                ease: 'easeOut',
              }}
            >
              <img
                src={stockFor(current, currentTier)}
                srcSet={`${stockFor(current, 'mobile')} 480w, ${stockFor(current, 'tablet')} 720w, ${stockFor(current, 'desktop')} 1080w`}
                sizes="(max-width: 640px) 480px, (max-width: 1024px) 720px, 1080px"
                alt={current.name}
                className="cine__scene-img"
                decoding="async"
                loading="eager"
              />
              <div
                className="cine__scene-tint"
                style={{ background: tintFor(current) }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Pure CSS hardware-accelerated vignette & letterbox bars */}
          <div className="cine__vignette" />
          <div className="cine__bars" />
        </div>

        {/* Foreground content grid */}
        <div className="cine__inner container">
          {/* LEFT: bottle + chapter header */}
          <div className="cine__left">
            <div className="cine__eyebrow">
              <span className="cine__eyebrow-rule" />
              <span>
                The Formula · Chapter {String(active + 1).padStart(2, '0')}
              </span>
            </div>

            <h2 className="cine__title">
              Thirteen botanicals,
              <em>in motion.</em>
            </h2>

            <p className="cine__lead">
              A quiet procession of roots, leaves, and flowers — each one revealed
              for the intentional role it plays in Revivaa.
            </p>

            <div className="cine__bottle-wrap">
              <div className="cine__bottle-glow" aria-hidden />
              <img
                src="/images/bottle-solo.png"
                alt="Revivaa Botanical Hair Oil bottle"
                className={`cine__bottle ${reduced ? 'is-static' : ''}`}
                width={180}
                height={360}
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Scene progress rail with responsive stepper buttons */}
            <div className="cine__rail">
              <button
                type="button"
                className="cine__rail-nav-btn"
                onClick={prevChapter}
                aria-label="Previous botanical"
                title="Previous"
              >
                <ChevronLeft size={15} />
              </button>

              <span className="cine__rail-num">
                {String(active + 1).padStart(2, '0')}
              </span>

              <div className="cine__rail-track" aria-hidden="true">
                <motion.span
                  className="cine__rail-fill"
                  style={{ scaleX: scrollYProgress }}
                />
                <span className="cine__rail-ticks">
                  {INGREDIENTS.map((it, i) => (
                    <span
                      key={it.id}
                      className={`cine__rail-tick ${i <= active ? 'is-on' : ''}`}
                    />
                  ))}
                </span>
              </div>

              <span className="cine__rail-total">
                {String(INGREDIENT_COUNT).padStart(2, '0')}
              </span>

              <button
                type="button"
                className="cine__rail-nav-btn"
                onClick={nextChapter}
                aria-label="Next botanical"
                title="Next"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* RIGHT: frosted ingredient reveal card */}
          <div className="cine__right">
            <AnimatePresence initial={false}>
              <motion.article
                key={current.id}
                className="cine__card"
                initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -8 }}
                transition={{
                  duration: reduced ? 0 : 0.22,
                  ease: 'easeOut',
                }}
                aria-live="polite"
              >
                <header className="cine__card-head">
                  <div className="cine__card-meta">
                    <span className="cine__card-index">
                      <em>
                        {String(current.order || active + 1).padStart(2, '0')}
                      </em>
                      <span aria-hidden>/</span>
                      {String(INGREDIENT_COUNT).padStart(2, '0')}
                    </span>
                    <span className="cine__card-category">
                      {current.category}
                    </span>
                  </div>
                  {isTablet && (
                    <span className="cine__card-swipe-hint" aria-hidden>
                      Swipe ↔
                    </span>
                  )}
                </header>

                <h3 className="cine__card-name">{current.name}</h3>

                <p className="cine__card-desc">{current.description}</p>

                {current.benefit && (
                  <div className="cine__card-benefit">
                    <span className="cine__card-benefit-label">
                      Hair benefit
                    </span>
                    <p>{current.benefit}</p>
                  </div>
                )}

                <footer className="cine__card-foot">
                  <div className="cine__card-next-wrap">
                    <span className="cine__card-foot-label">Up next</span>
                    <span className="cine__card-foot-next">{nextItem.name}</span>
                  </div>
                  <Link to="/ingredients" className="cine__card-glossary-link">
                    Full glossary <ArrowRight size={13} />
                  </Link>
                </footer>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom scroll cue */}
        <div className="cine__cue" aria-hidden>
          <span className="cine__cue-line" />
          <span className="cine__cue-label">Scroll to reveal</span>
        </div>

        {/* Desktop & Tablet chapter index */}
        {!isMobile && (
          <nav className="cine__chapters" aria-label="13 Botanical Chapters">
            {INGREDIENTS.map((it, i) => (
              <button
                key={it.id}
                type="button"
                className={`cine__chapter ${i === active ? 'is-active' : ''}`}
                onClick={() => scrollToChapter(i)}
                aria-label={`Jump to Chapter ${i + 1}: ${it.name}`}
              >
                <span className="cine__chapter-dot" />
                <span className="cine__chapter-label">{it.name}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </section>
  )
}