import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Search, FlaskConical, Heart, ArrowRight } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import OilAtmosphere from './OilAtmosphere'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './StoryJourney.css'

const journey = [
  {
    icon: Leaf,
    title: 'The Spark',
    tag: 'Honest Care',
    text: 'Revivaa was created with a simple belief: taking care of your hair should be a natural and enjoyable part of your self-care routine, without harsh synthetics or false promises.',
  },
  {
    icon: Search,
    title: 'The Research',
    tag: 'Time-Honored Oils',
    text: 'We studied ancient cold-pressing traditions and modern hair lipid science to formulate a gentle, highly bioavailable oil that nourishes the root and strengthens the shaft.',
  },
  {
    icon: FlaskConical,
    title: 'The Formulation',
    tag: '13 Pure Botanicals',
    text: 'Thirteen concentrated plant botanicals blended into one soft, lightweight, non-greasy elixir — pure care poured into every 150ml signature amber bottle.',
  },
  {
    icon: Heart,
    title: 'The Purpose',
    tag: 'Confidence & Love',
    text: 'Our journey is all about encouraging healthier hair, greater confidence, and a little more self-love — one mindful routine at a time.',
  },
]

export default function StoryJourney() {
  const [open, setOpen] = useState(0)
  const reduced = usePrefersReducedMotion()

  return (
    <section id="about" className="story-journey section" aria-label="Brand Story">
      <OilAtmosphere />

      <div className="story-journey__layout container">
        <div className="story-journey__copy">
          <ScrollReveal variant="fade-up">
            <p className="section-label">Our Story</p>
            <h2 className="section-title">A journey rooted in natural care</h2>
            <p className="section-lead">
              From a mindful spark to an uncompromised botanical formula — discover how Revivaa was born to elevate your daily self-care ritual.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.08} className="story-journey__acc">
            {journey.map(({ icon: Icon, title, tag, text }, i) => {
              const active = reduced || open === i
              return (
                <div
                  key={title}
                  className={`story-journey__item ${active ? 'is-open' : ''}`}
                >
                  <button
                    type="button"
                    className="story-journey__trigger"
                    aria-expanded={active}
                    aria-controls={`journey-panel-${i}`}
                    id={`journey-trigger-${i}`}
                    onClick={() => setOpen(i)}
                  >
                    <span className={`story-journey__icon clay-icon ${active ? 'is-active' : ''}`}>
                      <Icon size={18} />
                    </span>
                    <span className="story-journey__label">
                      <em>0{i + 1}</em>
                      <strong>{title}</strong>
                      <span className="story-journey__tag">{tag}</span>
                    </span>
                  </button>

                  <div
                    id={`journey-panel-${i}`}
                    role="region"
                    aria-labelledby={`journey-trigger-${i}`}
                    className="story-journey__panel"
                    style={{ gridTemplateRows: active ? '1fr' : '0fr' }}
                  >
                    <div className="story-journey__panel-inner">
                      <p>{text}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.15} className="story-journey__cta-wrap">
            <Link to="/about" className="story-journey__btn clay-btn">
              <span>Read Our Full Story &amp; Ideology</span>
              <ArrowRight size={16} />
            </Link>
          </ScrollReveal>
        </div>

        <ScrollReveal variant="scale-in" delay={0.1} className="story-journey__visual">
          <div className="story-journey__frame">
            <img
              src="/images/product-box.png"
              alt="Revivaa Botanical Hair Oil signature bottle and luxury box"
              className="story-journey__product"
              width={340}
              height={360}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.src = '/images/bottle-box.png'
              }}
            />
            <div className="story-journey__badge clay-cream">
              <strong>150ml</strong>
              <span>Signature Elixir</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
