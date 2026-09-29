import { useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion'
import { Leaf, Search, FlaskConical, Heart } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import OilAtmosphere from './OilAtmosphere'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './About.css'

const steps = [
  {
    icon: Leaf,
    title: 'The Spark',
    text: 'We wanted hair care that felt honest — botanical, gentle, and made for real routines.',
  },
  {
    icon: Search,
    title: 'The Research',
    text: 'We studied time-honored oils and modern scalp science to target the root, not the symptom.',
  },
  {
    icon: FlaskConical,
    title: 'The Creation',
    text: 'Thirteen natural ingredients blended into one soft, non-greasy oil — 150ml of care.',
  },
  {
    icon: Heart,
    title: 'The Purpose',
    text: 'To reverse, revitalize, and revive — raising the standard with transparent formulas.',
  },
]

const DRIP_EASE = [0.34, 1.56, 0.64, 1]

export default function About() {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()
  const [lit, setLit] = useState(0)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 70%', 'end 35%'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(steps.length - 1, Math.floor(v * steps.length + 0.001))
    setLit((c) => (c === next ? c : next))
  })

  return (
    <section id="wanted" className="about section" ref={ref}>
      <OilAtmosphere className="about__atmosphere" />

      <div className="container about__layout">
        <div className="about__intro">
          <ScrollReveal variant="fade-up">
            <p className="section-label">Our story</p>
            <h2 className="section-title">What we wanted</h2>
            <p className="section-lead">
              A ritual that feels like nature in your hands — soft shadows, golden oil, and care you can trust.
            </p>
          </ScrollReveal>

          <motion.div
            className="about__media"
            initial={reduced ? false : { opacity: 0, y: -36, scale: 0.86 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.85, ease: DRIP_EASE }}
          >
            <img
              src="/images/oil-splash.jpg"
              alt="Golden oil droplet splash"
              className="about__droplet"
              width={440}
              height={440}
              loading="lazy"
              decoding="async"
            />
          </motion.div>
        </div>

        <div className="about__timeline" aria-label="Story timeline">
          {steps.map(({ icon: Icon, title, text }, i) => {
            const active = reduced || i <= lit
            return (
              <ScrollReveal
                key={title}
                variant="fade-up"
                delay={0.05 * i}
                className={`about__step ${active ? 'is-lit' : ''}`}
              >
                <span className={`clay-icon about__icon ${active ? 'is-lit' : ''}`}>
                  <Icon />
                </span>
                <div className="about__note clay-cream">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
