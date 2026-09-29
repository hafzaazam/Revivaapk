import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Leaf,
  ChevronDown,
  Sun,
  Moon,
  ShoppingBag,
  Compass,
  MapPin,
  Truck,
  LogOut,
  Settings,
} from 'lucide-react'
import logoUrl from '../assets/logo-r.png'
import { useTheme } from '../theme/ThemeProvider'
import { useAuth } from '../auth/AuthProvider'
import { useCart } from '../lib/CartContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { CART_BOUNCE_EVENT } from '../lib/flyToCart'
import './Navbar.css'

const ICON = 18
const ICON_STROKE = 1.75

const mega = {
  collection: {
    title: 'The Collection',
    eyebrow: 'Pure Botanical Formulations',
    description:
      "Nourish, strengthen, and support healthier-looking hair with nature's finest cold-pressed oils.",
    columns: [
      {
        heading: 'Products',
        links: [
          { label: 'All Products', href: '/shop', desc: 'Browse our complete range' },
          { label: 'Revivaa Botanical Oil 150ml', href: '/product/revivaa-oil-150', desc: 'Our signature botanical elixir' },
          { label: 'Shop Best Sellers', href: '/shop', desc: 'Loved by hundreds across Pakistan' },
        ],
      },
      {
        heading: 'Explore On-Page',
        links: [
          { label: '13 Pure Botanicals', href: '/#ingredients', desc: 'Cold-pressed root-to-tip care' },
          { label: 'The Daily Ritual', href: '/#why', desc: 'Lightweight & non-greasy' },
          { label: '100% Toxin-Free', href: '/#difference', desc: 'No parabens, no mineral oils' },
        ],
      },
    ],
  },
  about: {
    title: 'About Revivaa',
    eyebrow: 'Our Story & Ideology',
    description:
      'Rooted in natural care, confidence, and consistency. Discover our brand journey.',
    columns: [
      {
        heading: 'Our Story',
        links: [
          { label: 'About Revivaa', href: '/about', desc: 'Our philosophy & core belief' },
          { label: "Revivaa's Ideology", href: '/about', desc: 'Natural care & self-love journey' },
          { label: 'Quality Pillars', href: '/about', desc: 'Purity, performance & ethics' },
        ],
      },
      {
        heading: 'The Ritual',
        links: [
          { label: 'How It Works', href: '/how-it-works', desc: '3-step ritual & hair timeline' },
          { label: 'The Difference', href: '/#difference', desc: 'Botanicals vs synthetics' },
        ],
      },
    ],
  },
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { isAdmin, signOut } = useAuth()
  const cart = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const solidBar = location.pathname !== '/'
  const showDock = useMediaQuery('(max-width: 960px)')
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(null)
  const [bounce, setBounce] = useState(false)
  const headerRef = useRef(null)

  useEffect(() => {
    const onBounce = () => {
      setBounce(true)
      window.setTimeout(() => setBounce(false), 900)
    }
    window.addEventListener(CART_BOUNCE_EVENT, onBounce)
    return () => window.removeEventListener(CART_BOUNCE_EVENT, onBounce)
  }, [])

  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false

    const update = () => {
      const y = window.scrollY
      const delta = y - lastY
      setScrolled(y > 40)

      if (open || y < 80) {
        setHidden(false)
      } else if (delta > 6) {
        setHidden(true)
      } else if (delta < -6) {
        setHidden(false)
      }

      lastY = y
      ticking = false
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  useEffect(() => {
    document.body.classList.toggle('menu-open', !!open)
  }, [open])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /**
   * Keyboard users need a way out of the mega panel. The panel is driven by
   * `onFocus` (opens) so it never closes on hover alone; without this, tabbing
   * past the last link leaves an open panel stranded over the page.
   */
  useEffect(() => {
    if (!open) return undefined
    const onFocusIn = (e) => {
      const header = headerRef.current
      if (header && !header.contains(e.target)) setOpen(null)
    }
    document.addEventListener('focusin', onFocusIn)
    return () => document.removeEventListener('focusin', onFocusIn)
  }, [open])

  const close = () => setOpen(null)

  /**
   * Handles anchor links like "/#ingredients".
   * - If we're already on the target route: smooth-scroll to the element.
   * - Otherwise: full navigation so the browser lands on the hash.
   */
  const handleHashNav = (e, href) => {
    e.preventDefault()
    close()

    const [path, hash] = href.split('#')
    const targetPath = path || '/'
    const onTargetRoute = window.location.pathname === targetPath

    if (hash && onTargetRoute) {
      const el = document.getElementById(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        window.history.replaceState(null, '', href)
        return
      }
    }

    navigate(href)
  }

  return (
    <>
      <header
        ref={headerRef}
        className={[
          'nav',
          scrolled || solidBar ? 'nav--scrolled' : '',
          open ? 'nav--mega' : '',
          hidden ? 'nav--hidden' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="nav__bar container">
          <Link to="/" className="nav__logo" onClick={close} aria-label="Revivaa home">
            <span className="nav__mark">
              <img
                src={logoUrl}
                alt=""
                className="nav__mark-img"
                width={32}
                height={32}
                decoding="async"
              />
            </span>
          </Link>

          <nav className="nav__links" aria-label="Primary Navigation">
            <button
              type="button"
              className={`nav__item ${open === 'collection' ? 'is-active' : ''}`}
              aria-expanded={open === 'collection'}
              aria-controls="mega-collection"
              onMouseEnter={() => setOpen('collection')}
              onFocus={() => setOpen('collection')}
              onClick={() =>
                setOpen(open === 'collection' ? null : 'collection')
              }
            >
              Collection{' '}
              <ChevronDown size={14} strokeWidth={2} className="nav__chev" aria-hidden />
            </button>

            <Link
              to="/how-it-works"
              className={`nav__item ${
                location.pathname === '/how-it-works' ? 'is-active' : ''
              }`}
              aria-current={
                location.pathname === '/how-it-works' ? 'page' : undefined
              }
              onMouseEnter={() => setOpen(null)}
              onClick={close}
            >
              <Compass
                size={ICON}
                strokeWidth={ICON_STROKE}
                className="nav__item-icon"
                aria-hidden
              />
              How It Works
            </Link>

            <button
              type="button"
              className={`nav__item ${
                open === 'about' || location.pathname === '/about'
                  ? 'is-active'
                  : ''
              }`}
              aria-expanded={open === 'about'}
              aria-controls="mega-about"
              onMouseEnter={() => setOpen('about')}
              onFocus={() => setOpen('about')}
              onClick={() => setOpen(open === 'about' ? null : 'about')}
            >
              About{' '}
              <ChevronDown size={14} strokeWidth={2} className="nav__chev" aria-hidden />
            </button>

            <Link
              to="/contact"
              className={`nav__item ${
                location.pathname === '/contact' ? 'is-active' : ''
              }`}
              aria-current={
                location.pathname === '/contact' ? 'page' : undefined
              }
              onMouseEnter={() => setOpen(null)}
              onClick={close}
            >
              <MapPin
                size={ICON}
                strokeWidth={ICON_STROKE}
                className="nav__item-icon"
                aria-hidden
              />
              Contact
            </Link>

            <Link
              to="/track"
              className={`nav__item ${
                location.pathname === '/track' ? 'is-active' : ''
              }`}
              aria-current={
                location.pathname === '/track' ? 'page' : undefined
              }
              onMouseEnter={() => setOpen(null)}
              onClick={close}
            >
              <Truck
                size={ICON}
                strokeWidth={ICON_STROKE}
                className="nav__item-icon"
                aria-hidden
              />
              Track Order
            </Link>
          </nav>

          <div className="nav__actions">
            <button
              type="button"
              className="nav__theme"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark'
                  ? 'Switch to light theme'
                  : 'Switch to dark theme'
              }
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                <Sun size={18} strokeWidth={ICON_STROKE} />
              ) : (
                <Moon size={18} strokeWidth={ICON_STROKE} />
              )}
            </button>

            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className="nav__item nav__account"
                  onClick={close}
                >
                  <Settings size={16} strokeWidth={ICON_STROKE} />
                  Admin
                </Link>
                <button
                  type="button"
                  className="nav__item nav__account"
                  onClick={() => {
                    close()
                    signOut()
                  }}
                >
                  <LogOut size={16} strokeWidth={ICON_STROKE} />
                  Sign out
                </button>
              </>
            ) : null}

            <button
              type="button"
              className={`nav__cart ${bounce ? 'is-bouncing' : ''}`}
              onClick={() => cart.setOpen(true)}
              aria-label={`Cart, ${cart.count} items`}
            >
              <ShoppingBag size={ICON} strokeWidth={ICON_STROKE} aria-hidden />
              {cart.count > 0 && (
                <span className="nav__cart-count" aria-hidden>
                  {cart.count > 99 ? '99+' : cart.count}
                </span>
              )}
            </button>

            <Link to="/shop" className="clay-btn nav__cta" onClick={close}>
              <Leaf size={16} strokeWidth={2} />
              Shop Now
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {open && mega[open] && (
            <motion.div
              id={`mega-${open}`}
              className="mega"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onMouseLeave={() => setOpen(null)}
            >
              <div className="mega__inner container">
                <div className="mega__intro clay-dark">
                  <p className="mega__eyebrow">
                    {mega[open].eyebrow || mega[open].title}
                  </p>
                  <h3>{mega[open].title}</h3>
                  <p>{mega[open].description}</p>
                  <div className="mega__intro-box">
                    <img
                      src="/images/box.png"
                      alt="Revivaa botanical hair oil box packaging"
                      width={140}
                      height={140}
                      loading="lazy"
                      decoding="async"
                    />
                    <Link
                      to="/product/revivaa-oil-150"
                      onClick={close}
                      className="mega__intro-link"
                    >
                      View Signature 150ml →
                    </Link>
                  </div>
                </div>

                {mega[open].columns.map((col) => (
                  <div key={col.heading} className="mega__col">
                    <h4>{col.heading}</h4>
                    <ul>
                      {col.links.map(({ label, href, desc, external }) => {
                        const hasHash = href.includes('#')

                        if (external) {
                          return (
                            <li key={label}>
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={close}
                                className="mega__link clay-cream"
                              >
                                <span>
                                  <strong>{label}</strong>
                                  <small>{desc}</small>
                                </span>
                              </a>
                            </li>
                          )
                        }

                        return (
                          <li key={label}>
                            <Link
                              to={href}
                              onClick={(e) =>
                                hasHash ? handleHashNav(e, href) : close()
                              }
                              className="mega__link clay-cream"
                            >
                              <span>
                                <strong>{label}</strong>
                                <small>{desc}</small>
                              </span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {open && (
          /* Click-outside target only. Escape and focus-out already close the
             menu, so this stays out of the a11y tree and the tab order. */
          <div className="mega__backdrop" aria-hidden onClick={() => setOpen(null)} />
        )}
      </header>

      {/* Mobile bottom dock — only mounted below 960px. Rendering it at every
          width duplicated the primary nav in the accessibility tree while
          `display: none` kept it out of the visual layout. */}
      {showDock && (
        <nav
          className={`nav-dock ${hidden ? 'nav-dock--hidden' : ''}`}
          aria-label="Mobile quick actions"
        >
        <Link
          to="/shop"
          className={`nav-dock__item ${
            location.pathname === '/shop' ? 'is-active' : ''
          }`}
        >
          <ShoppingBag size={20} strokeWidth={ICON_STROKE} aria-hidden />
          <span>Shop</span>
        </Link>

        <Link
          to="/how-it-works"
          className={`nav-dock__item ${
            location.pathname === '/how-it-works' ? 'is-active' : ''
          }`}
        >
          <Compass size={20} strokeWidth={ICON_STROKE} aria-hidden />
          <span>How It Works</span>
        </Link>

        <Link to="/" className="nav-dock__home" aria-label="Home">
          <span className="nav-dock__home-ring">
            <img src={logoUrl} alt="" width={28} height={28} />
          </span>
        </Link>

        <Link
          to="/track"
          className={`nav-dock__item ${
            location.pathname === '/track' ? 'is-active' : ''
          }`}
        >
          <Truck size={20} strokeWidth={ICON_STROKE} aria-hidden />
          <span>Track</span>
        </Link>

        <button
          type="button"
          data-cart="true"
          className={`nav-dock__item ${bounce ? 'is-bouncing' : ''}`}
          onClick={() => cart.setOpen(true)}
          aria-label={`Cart, ${cart.count} items`}
        >
          <ShoppingBag size={20} strokeWidth={ICON_STROKE} aria-hidden />
          <span>Cart</span>
          {cart.count > 0 && (
            <span className="nav-dock__count" aria-hidden>
              {cart.count > 99 ? '99+' : cart.count}
            </span>
          )}
        </button>
        </nav>
      )}
    </>
  )
}