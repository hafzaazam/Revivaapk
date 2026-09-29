import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useInView } from 'framer-motion'
import { Mail, MessageCircle } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import logoUrl from '../assets/logo-r.png'
import './Footer.css'

function InstagramIcon({ size = 18, ...props }) {
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

const BANNER = [
  { text: 'Made with intention.', glow: false },
  { text: 'Rooted in nature.', glow: false },
  { text: 'Revive with ', glow: false, suffix: true },
]

const NEEDS = ['oxygen', 'water', 'revivaa oil']

/** Only real on-page anchors + mailto — no invented destinations */
const FOOTER_COLUMNS = [
  {
    heading: 'Shop & Care',
    links: [
      { label: 'The Collection', to: '/shop' },
      { label: 'Botanical Oil 150ml', to: '/product/revivaa-oil-150' },
      { label: 'How It Works Ritual', to: '/how-it-works' },
      { label: 'Track Your Order', to: '/track' },
      { label: 'Shipping & Delivery', to: '/shipping-policy' },
    ],
  },
  {
    heading: 'Brand & Journal',
    links: [
      { label: 'About Revivaa', to: '/about' },
      { label: 'Brand Story & Ideology', to: '/about' },
      { label: 'Hair Care Journal', to: '/blog' },
      { label: 'Contact & Concierge', to: '/contact' },
      { label: 'Refund & Returns', to: '/refund-policy' },
    ],
  },
  {
    heading: 'Trust & Science',
    links: [
      { label: '13 Pure Botanicals', to: '/ingredients' },
      { label: 'Customer Reviews', to: '/reviews' },
      { label: 'Frequently Asked Questions', to: '/faq' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms & Conditions', to: '/terms' },
    ],
  },
]

const SOCIAL = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/revivaaa_care?stkn=NDRpbG1tbTR6eDZm',
    Icon: InstagramIcon,
    external: true,
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/923440888847',
    Icon: MessageCircle,
    external: true,
  },
  {
    label: 'Email revivaa',
    href: 'mailto:hello@revivaa.com',
    Icon: Mail,
  },
]

export default function Footer() {
  const bannerRef = useRef(null)
  const needsRef = useRef(null)
  const bannerInView = useInView(bannerRef, { once: true, amount: 0.55 })
  const needsInView = useInView(needsRef, { once: true, amount: 0.4 })
  const reduced = usePrefersReducedMotion()

  return (
    <footer id="cta" className="footer">
      <div className="footer__banner" ref={bannerRef}>
        <p className={`footer__banner-line ${bannerInView ? 'is-in' : ''} ${reduced ? 'is-static' : ''}`}>
          {BANNER.map((part, i) => (
            <span
              key={part.text}
              className="footer__banner-clause"
              style={{ '--i': i }}
            >
              {part.text}
            </span>
          ))}
          <em className="footer__banner-brand">revivaa</em>
          <span className="footer__banner-clause footer__banner-clause--end" style={{ '--i': 3 }}>
            .
          </span>
        </p>
      </div>

      <div className="footer__cta container">
        <ScrollReveal variant="fade-up" className="footer__card clay">
          <div className="footer__copy">
            <p className="section-label">Ready to revive?</p>
            <h2 className="section-title">basic human needs</h2>
            <ol
              className={`footer__needs ${needsInView ? 'is-in' : ''} ${reduced ? 'is-static' : ''}`}
              ref={needsRef}
            >
              {NEEDS.map((item, i) => (
                <li
                  key={item}
                  className={i === 2 ? 'is-brand' : undefined}
                  style={{ '--i': i }}
                >
                  <span className="footer__needs-text">{item}</span>
                </li>
              ))}
            </ol>
            <p className="footer__lead">
              Soft and Natural. Premium Quality. 150ml of botanical care for every hair type.
            </p>
            <div className="footer__actions">
              <LiquidCta href="mailto:hello@revivaa.com">
                <Mail size={16} strokeWidth={1.5} className="footer-cta__icon" />
                Order Now
              </LiquidCta>
              <a href="#ingredients" className="footer-cta footer-cta--secondary">
                Explore Formula
              </a>
            </div>
          </div>

          <div className="footer__visual">
            <img
              src="/images/box.png"
              alt="revivaa oil packaging"
              className={`footer__box ${reduced ? 'is-static' : ''}`}
              width={160}
              height={200}
              loading="lazy"
              decoding="async"
            />
          </div>
        </ScrollReveal>
      </div>

      <div className="footer__site">
        <div className="footer__edge" aria-hidden />

        <ScrollReveal variant="fade-up" className="container footer__grid">
          <div className="footer__brand-block">
            <Link to="/" className="footer__brand">
              <span className="footer__mark" aria-hidden>
                <img src={logoUrl} alt="" width={36} height={36} />
              </span>
              <span className="footer__wordmark">revivaa</span>
            </Link>
            <p className="footer__tagline">
              Real ingredients. Real results. Real revival.
            </p>
          </div>

          <nav className="footer__columns" aria-label="Footer">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading} className="footer__col">
                <p className="footer__col-heading">{col.heading}</p>
                <ul className="footer__col-links">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <a href={link.href} className="footer__link">
                          {link.label}
                        </a>
                      ) : (
                        <Link to={link.to} className="footer__link">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="footer__connect">
            <p className="footer__col-heading">Connect</p>
            <div className="footer__socials">
              {SOCIAL.map(({ label, href, Icon, external }) => (
                <a
                  key={label}
                  href={href}
                  className="footer__social"
                  aria-label={label}
                  {...(external
                    ? { target: '_blank', rel: 'noreferrer' }
                    : {})}
                >
                  <Icon size={18} strokeWidth={1.5} aria-hidden />
                </a>
              ))}
            </div>
            <a href="mailto:hello@revivaa.com" className="footer__email">
              hello@revivaa.com
            </a>
          </div>
        </ScrollReveal>

        <div className="footer__bottom">
          <div className="footer__legal-links">
            <Link to="/refund-policy" className="footer__legal-link">Refund Policy</Link>
            <span className="footer__legal-sep" aria-hidden>·</span>
            <Link to="/shipping-policy" className="footer__legal-link">Shipping Policy</Link>
            <span className="footer__legal-sep" aria-hidden>·</span>
            <Link to="/privacy-policy" className="footer__legal-link">Privacy Policy</Link>
            <span className="footer__legal-sep" aria-hidden>·</span>
            <Link to="/terms" className="footer__legal-link">Terms &amp; Conditions</Link>
          </div>
          <p className="footer__legal">
            © {new Date().getFullYear()} revivaa · Soft &amp; natural hair oil
          </p>
        </div>
      </div>
    </footer>
  )
}

function LiquidCta({ href, children }) {
  const [origin, setOrigin] = useState({ x: '50%', y: '50%' })

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({ x: `${x}%`, y: `${y}%` })
  }

  return (
    <a
      href={href}
      className="footer-cta footer-cta--primary"
      onMouseEnter={onMove}
      onMouseMove={onMove}
      style={{ '--wipe-x': origin.x, '--wipe-y': origin.y }}
    >
      <span className="footer-cta__fill" aria-hidden />
      <span className="footer-cta__label">{children}</span>
    </a>
  )
}
