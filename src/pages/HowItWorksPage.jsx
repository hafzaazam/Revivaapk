import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Droplets,
  Leaf,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import { PAGE_SEO, SITE_DOMAIN } from '../lib/seoConfig'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './HowItWorksPage.css'

const EASE = [0.22, 1, 0.36, 1]

const RITUAL_STEPS = [
  {
    number: '01',
    icon: Droplets,
    title: 'Warm & Activate',
    subtitle: '3 to 5 drops',
    desc: 'Dispense 3–5 drops of Revivaa Botanical Oil into clean, dry palms. Rub hands together gently for 5 seconds to warm and activate the cold-pressed botanical extracts.',
    tip: 'For dense or longer hair, use 6–8 drops.',
  },
  {
    number: '02',
    icon: Leaf,
    title: 'Scalp Massage',
    subtitle: '3 to 5 minutes',
    desc: 'Using your fingertips, gently massage into your scalp in small circular motions. Focus on crown, temples, and parting lines to stimulate blood circulation and follicle absorption.',
    tip: 'Breathe in the natural soothing botanical aroma.',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Seal Lengths & Ends',
    subtitle: 'Root to tip',
    desc: 'Smooth the remaining elixir through your mid-lengths down to the ends. This locks in moisture, seals cuticles, tames frizz, and prevents split ends without any greasy heaviness.',
    tip: 'Leave on for 45 minutes or overnight before gentle washing.',
  },
]

const TIMELINE = [
  {
    period: 'Weeks 1–2',
    title: 'Immediate Scalp Relief & Luster',
    desc: 'Scalp dryness and itchiness calm down. Hair strands feel visibly softer, more hydrated, with a healthy natural gloss.',
  },
  {
    period: 'Weeks 3–4',
    title: 'Reduced Frizz & Breakage',
    desc: 'Hair elasticity strengthens. Noticeably less hair fall on combs and in the shower as roots absorb botanical nutrition.',
  },
  {
    period: 'Weeks 6–8',
    title: 'Fuller, Thicker Botanical Revival',
    desc: 'Hair feels denser and more resilient. New baby hairs sprout along part lines and temples, restoring everyday confidence.',
  },
]

const HAIR_TYPES = [
  {
    type: 'Straight & Fine Hair',
    routine: 'Use 2–3 drops once or twice weekly as a 30-minute pre-shampoo treatment for weightless shine.',
  },
  {
    type: 'Wavy & Medium Hair',
    routine: 'Use 4–5 drops twice weekly. Can be left overnight or used as a leave-in split-end seal on damp ends.',
  },
  {
    type: 'Curly & Coily Hair',
    routine: 'Use 6–8 drops 3 times weekly. Excellent as an intensive overnight deep-scalp treatment and moisture lock.',
  },
  {
    type: 'Color & Chemically Treated',
    routine: 'Apply to damp ends before air-drying to shield against environmental stress and restore protein moisture balance.',
  },
]

export default function HowItWorksPage() {
  const reduced = usePrefersReducedMotion()

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Apply Revivaa Botanical Hair Oil (3-Step Ritual)',
    description: PAGE_SEO.howItWorks.description,
    image: `${SITE_DOMAIN}/images/hero-product.jpg`,
    totalTime: 'PT45M',
    step: RITUAL_STEPS.map((st, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: st.title,
      text: st.desc,
      url: `${SITE_DOMAIN}/how-it-works#step-${i + 1}`,
    })),
  }

  return (
    <div className="app how-it-works-app">
      <SEO
        title={PAGE_SEO.howItWorks.title}
        description={PAGE_SEO.howItWorks.description}
        canonical={PAGE_SEO.howItWorks.canonical}
        keywords={PAGE_SEO.howItWorks.keywords}
        ogType={PAGE_SEO.howItWorks.ogType}
        structuredData={howToSchema}
        schemaId="howto-schema"
      />
      <Cursor />
      <ScrollToTop />
      <Navbar />

      <main id="main" tabIndex={-1} className="how-page">
        <Breadcrumbs items={[{ label: 'How It Works', href: '/how-it-works' }]} />

        {/* ——— Hero Header ——— */}
        <section className="how-hero">
          <div className="container how-hero__inner">
            <motion.div
              className="how-hero__content"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: EASE }}
            >
              
              <h1 className="how-hero__title">
                How Revivaa Hair Oil Works
                <em> · The 3-Step Ritual &amp; Botanical Science</em>
              </h1>
              <p className="how-hero__lead">
                A simple, mindful 3-step ritual combining 13 pure cold-pressed botanicals with deep
                scalp nourishment for healthier, fuller-looking hair.
              </p>
            </motion.div>
          </div>
          <div className="how-hero__glow" aria-hidden />
        </section>

        {/* ——— 3-Step Ritual Section ——— */}
        <section className="how-ritual container">
          <div className="how-section-header">
            <span className="section-label">Application Method</span>
            <h2>The 3-Step Botanical Ritual</h2>
            <p>Designed to fit effortlessly into your everyday self-care routine.</p>
          </div>

          <div className="how-ritual__grid">
            {RITUAL_STEPS.map((step, idx) => {
              const Icon = step.icon
              return (
                <div key={idx} className="how-ritual__card clay">
                  <div className="how-ritual__card-top">
                    <span className="how-ritual__number">{step.number}</span>
                    <span className="how-ritual__icon-wrap">
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                  </div>
                  <span className="how-ritual__subtitle">{step.subtitle}</span>
                  <h3 className="how-ritual__card-title">{step.title}</h3>
                  <p className="how-ritual__card-desc">{step.desc}</p>
                  <div className="how-ritual__tip">
                    <strong>Tip:</strong> {step.tip}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ——— Science & Cold-Pressed Botanicals Section ——— */}
        <section className="how-science container">
          <div className="how-science__card clay-dark">
            <div className="how-science__copy">
              <span className="section-label">Botanical Science</span>
              <h2>Why Cold-Pressed Oils Make The Difference</h2>
              <p>
                Unlike conventional hair oils laden with synthetic silicones and mineral oil that only
                coat the hair surface, Revivaa uses cold-pressed extraction to preserve delicate plant
                nutrients, polyphenols, and fatty acids.
              </p>
              <ul className="how-science__list">
                <li>
                  <CheckCircle2 size={18} className="how-science__check" />
                  <span>
                    <strong>Micro-Nutrient Penetration:</strong> Lightweight molecular structure
                    absorbs directly into scalp pores without clogging follicles.
                  </span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="how-science__check" />
                  <span>
                    <strong>Non-Greasy Balance:</strong> Jojoba, Almond, and Rosemary mimic the scalp’s
                    natural sebum to regulate oil production.
                  </span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="how-science__check" />
                  <span>
                    <strong>Zero Toxin Guarantee:</strong> Free from parabens, mineral oils, sulfates,
                    and synthetic fragrances.
                  </span>
                </li>
              </ul>
            </div>
            <div className="how-science__visual">
              <img
                src="/images/box.png"
                alt="Revivaa 150ml Botanical Hair Oil Packaging"
                className="how-science__img"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* ——— Results Timeline Section ——— */}
        <section className="how-timeline container">
          <div className="how-section-header">
            <span className="section-label">Transformation Journey</span>
            <h2>What to Expect Over Time</h2>
            <p>Healthy hair is a habit. Here is what consistent use delivers.</p>
          </div>

          <div className="how-timeline__grid">
            {TIMELINE.map((item, idx) => (
              <div key={idx} className="how-timeline__card clay">
                <span className="how-timeline__badge">
                  <Clock size={14} /> {item.period}
                </span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ——— Hair Types Guide ——— */}
        <section className="how-types container">
          <div className="how-types__card">
            <h2>Tailored for Every Hair Texture</h2>
            <p className="how-types__sub">
              Whether straight, wavy, curly, or color-treated, Revivaa adapts naturally to your hair texture.
            </p>
            <div className="how-types__grid">
              {HAIR_TYPES.map((h, i) => (
                <div key={i} className="how-type-item">
                  <strong>{h.type}</strong>
                  <p>{h.routine}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ——— CTA Banner ——— */}
        <section className="how-cta container">
          <div className="how-cta__card clay">
            <div>
              <h2>Experience the Botanical Difference</h2>
              <p>150ml of pure botanical care crafted for your hair’s revival.</p>
            </div>
            <Link to="/shop" className="clay-btn how-cta__btn">
              Shop Botanical Oil <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
