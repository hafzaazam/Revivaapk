import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Leaf,
  Heart,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  Droplets,
  CheckCircle2,
} from 'lucide-react'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import { PAGE_SEO, SITE_DOMAIN, ORGANIZATION_SCHEMA } from '../lib/seoConfig'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import logoUrl from '../assets/logo-r.png'
import './AboutPage.css'

function InstagramIcon({ size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

const EASE = [0.22, 1, 0.36, 1]

const PILLARS = [
  {
    icon: Leaf,
    title: 'Natural Care',
    desc: 'Combining the purest botanical extracts with gentle, thoughtful care for root-to-tip health.',
  },
  {
    icon: Heart,
    title: 'Confidence & Self-Love',
    desc: 'Empowering you to feel confident in your natural hair with simple, daily nurturing rituals.',
  },
  {
    icon: ShieldCheck,
    title: 'Consistency & Honesty',
    desc: 'Transparent formulations, toxin-free promises, and sustainable care that delivers long-term results.',
  },
  {
    icon: Droplets,
    title: 'Thoughtful Formulations',
    desc: 'Crafted specifically to address everyday hair concerns—from nourishing oils to refreshing mists.',
  },
]

export default function AboutPage() {
  const reduced = usePrefersReducedMotion()

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: PAGE_SEO.about.h1,
    description: PAGE_SEO.about.description,
    url: `${SITE_DOMAIN}/about`,
    mainEntity: ORGANIZATION_SCHEMA,
  }

  return (
    <div className="app about-app">
      <SEO
        title={PAGE_SEO.about.title}
        description={PAGE_SEO.about.description}
        canonical={PAGE_SEO.about.canonical}
        keywords={PAGE_SEO.about.keywords}
        ogType={PAGE_SEO.about.ogType}
        structuredData={aboutSchema}
        schemaId="about-page-schema"
      />
      <Cursor />
      <ScrollToTop />
      <Navbar />

      <main id="main" tabIndex={-1} className="about-page">
        <Breadcrumbs items={[{ label: 'About', href: '/about' }]} />

        {/* ——— Hero Section ——— */}
        <section className="about-hero">
          <div className="container about-hero__inner">
            <motion.div
              className="about-hero__content"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <span className="section-label">Our Essence</span>
              <h1 className="about-hero__title">
                The Story Behind Revivaa
                <em> · Rooted in Natural Care</em>
              </h1>
              <p className="about-hero__lead">
                Revivaa was created with a simple belief: taking care of your hair should be a natural
                and enjoyable part of your self-care routine.
              </p>
            </motion.div>
          </div>
          <div className="about-hero__glow" aria-hidden />
        </section>

        {/* ——— The Core Belief Section ——— */}
        <section className="about-belief container">
          <div className="about-belief__card clay">
            <div className="about-belief__badge">
              <span>The Revivaa Belief</span>
            </div>
            <div className="about-belief__grid">
              <div className="about-belief__main">
                <h2>The Goodness of Nature, Bottled with Care</h2>
                <p className="about-belief__p">
                  We combine the goodness of nature with thoughtful formulations to create hair-care
                  products designed to nourish, strengthen, and support healthier-looking hair. Every
                  Revivaa product is made with care, keeping your everyday hair concerns and needs in
                  mind.
                </p>
                <p className="about-belief__p">
                  We aim to make quality hair care simple, accessible, and easy to include in your daily
                  routine. From nourishing oils to refreshing hair mists, Revivaa is here to help you
                  give your hair the care it deserves. Our journey is all about encouraging healthier
                  hair, greater confidence, and a little more self-love—one routine at a time.
                </p>
              </div>
              <div className="about-belief__visual">
                <div className="about-belief__img-wrap">
                  <img
                    src="/images/box.png"
                    alt="Revivaa Botanical Care Packaging"
                    className="about-belief__img"
                    loading="lazy"
                  />
                  <div className="about-belief__stamp">
                    <img src={logoUrl} alt="" width={32} height={32} />
                    <span>100% Botanical Care</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ——— Brand Story & Ideology Section ——— */}
        <section className="about-ideology">
          <div className="container">
            <div className="about-ideology__header">
              <span className="section-label">Brand Story</span>
              <h2 className="about-ideology__title">Revivaa's Ideology</h2>
              <p className="about-ideology__sub">
                Rooted in natural care, confidence, and consistency.
              </p>
            </div>

            <div className="about-ideology__content">
              <div className="about-ideology__quote clay-dark">
                <p className="about-ideology__quote-text">
                  "At Revivaa, our ideology is rooted in natural care, confidence, and consistency. We
                  believe that healthy hair starts with healthy habits and the right care. Our aim is to
                  create products that make hair care simple, enjoyable, and accessible while
                  encouraging people to feel confident in their natural selves."
                </p>
                <p className="about-ideology__quote-sub">
                  "We want Revivaa to become more than a hair-care brand. Our vision is to build a
                  trusted, meaningful, and long-lasting brand that people can connect with. We believe in
                  growing through quality, honesty, innovation, and understanding what our customers
                  truly need."
                </p>
              </div>

              {/* Pillars Grid */}
              <div className="about-pillars">
                {PILLARS.map((p, idx) => {
                  const Icon = p.icon
                  return (
                    <div key={idx} className="about-pillar-card clay">
                      <div className="about-pillar-card__icon">
                        <Icon size={22} strokeWidth={1.7} />
                      </div>
                      <h3>{p.title}</h3>
                      <p>{p.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ——— Quality Promises ——— */}
        <section className="about-promises container">
          <div className="about-promises__card">
            <h2>Our Quality Commitments</h2>
            <div className="about-promises__grid">
              <div className="about-promise-item">
                <CheckCircle2 size={20} className="about-promise-item__check" />
                <div>
                  <strong>Pure Botanical Goodness</strong>
                  <p>Thoughtfully formulated without harsh parabens, silicones, or heavy synthetic additives.</p>
                </div>
              </div>
              <div className="about-promise-item">
                <CheckCircle2 size={20} className="about-promise-item__check" />
                <div>
                  <strong>Everyday Ease</strong>
                  <p>Lightweight textures and non-greasy finishes made to fit your daily routine smoothly.</p>
                </div>
              </div>
              <div className="about-promise-item">
                <CheckCircle2 size={20} className="about-promise-item__check" />
                <div>
                  <strong>Honest & Transparent</strong>
                  <p>We believe in growing through genuine customer connections, listening to real feedback.</p>
                </div>
              </div>
              <div className="about-promise-item">
                <CheckCircle2 size={20} className="about-promise-item__check" />
                <div>
                  <strong>For All Hair Textures</strong>
                  <p>Gentle and deeply nourishing, tailored for all hair types and daily lifestyles.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ——— Social & Direct Channels Section ——— */}
        <section className="about-channels container">
          <div className="about-channels__header">
            <span className="section-label">Connect With Us</span>
            <h2>Join the Revivaa Community</h2>
            <p>Have questions about your hair routine or want to connect with our care team directly?</p>
          </div>

          <div className="about-channels__grid">
            <a
              href="https://www.instagram.com/revivaaa_care?stkn=NDRpbG1tbTR6eDZm"
              target="_blank"
              rel="noopener noreferrer"
              className="about-channel-card about-channel-card--ig clay"
            >
              <div className="about-channel-card__icon-wrap">
                <InstagramIcon size={28} />
              </div>
              <div className="about-channel-card__info">
                <span className="about-channel-card__platform">Follow us on Instagram</span>
                <strong className="about-channel-card__handle">@revivaaa_care</strong>
                <p>Discover real hair transformations, botanical tips, and product updates.</p>
              </div>
              <span className="about-channel-card__action">
                Open Instagram <ArrowRight size={16} />
              </span>
            </a>

            <a
              href="https://wa.me/923440888847"
              target="_blank"
              rel="noopener noreferrer"
              className="about-channel-card about-channel-card--wa clay"
            >
              <div className="about-channel-card__icon-wrap">
                <MessageCircle size={28} />
              </div>
              <div className="about-channel-card__info">
                <span className="about-channel-card__platform">Chat on WhatsApp</span>
                <strong className="about-channel-card__handle">+92 344 0888847</strong>
                <p>Instant order support, personalized hair advice, and tracking queries.</p>
              </div>
              <span className="about-channel-card__action">
                Message Us <ArrowRight size={16} />
              </span>
            </a>
          </div>

          <div className="about-cta-banner clay-dark">
            <div className="about-cta-banner__copy">
              <h3>Ready to begin your botanical ritual?</h3>
              <p>Experience our signature botanical formula crafted for deep nourishment and revival.</p>
            </div>
            <Link to="/shop" className="clay-btn about-cta-banner__btn">
              Explore Collection
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}