import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Home,
  PackageSearch,
  Truck,
  XCircle,
  MessageCircle,
  
  MapPin,
  Calendar,
  User,
} from 'lucide-react'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import { useAuth } from '../auth/AuthProvider'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { getOrderStatus } from '../lib/shop'
import { formatMoney } from '../data/product'
import { PAGE_SEO } from '../lib/seoConfig'
import './TrackPage.css'

const EASE = [0.22, 1, 0.36, 1]

const STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'Order received & queued', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', desc: 'Packed & quality verified', icon: CheckCircle2 },
  { key: 'shipped', label: 'In Transit', desc: 'On its way with courier', icon: Truck },
  { key: 'delivered', label: 'Delivered', desc: 'Arrived at destination', icon: Home },
]

const STATUS_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Confirmed & Packed',
  shipped: 'Shipped (In Transit)',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function TrackPage() {
  const reduced = usePrefersReducedMotion()
  const { configured } = useAuth()
  const [params] = useSearchParams()

  const [query, setQuery] = useState('')
  const [order, setOrder] = useState(null)
  const [phase, setPhase] = useState('idle')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const autoRan = useRef(false)

  useEffect(() => {
    const prev = document.title
    document.title = 'Track Your Order · Revivaa Care'
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    const next = (params.get('code') || '').trim()
    if (autoRan.current || !next) return
    autoRan.current = true
    setQuery(next)
    run(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const run = async (raw) => {
    const code = raw.trim()
    if (code.length < 4) {
      setError('Please enter the valid tracking ID from your confirmation receipt.')
      setPhase('error')
      return
    }
    setPhase('loading')
    setError('')
    if (!configured) {
      setError('Add Supabase keys to .env.local to query realtime tracking status.')
      setPhase('error')
      return
    }
    const { data: result, error: err } = await getOrderStatus(code)
    if (err) {
      setError(err?.message || 'Could not find that tracking order ID. Please check and try again.')
      setOrder(null)
      setPhase('error')
      return
    }
    setOrder(result)
    setPhase('success')
  }

  const onSubmit = (e) => {
    e.preventDefault()
    run(query)
  }

  const onCopy = async () => {
    if (!order) return
    try {
      await navigator.clipboard.writeText(order.tracking_code)
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const isCancelled = order?.status === 'cancelled'
  const currentIndex = order && !isCancelled ? STEPS.findIndex((s) => s.key === order.status) : -1

  return (
    <div className="app track-app">
      <SEO
        title={PAGE_SEO.track.title}
        description={PAGE_SEO.track.description}
        canonical={PAGE_SEO.track.canonical}
        keywords={PAGE_SEO.track.keywords}
        ogType={PAGE_SEO.track.ogType}
      />
      <Cursor />
      <ScrollToTop />
      <Navbar />

      <main id="main" tabIndex={-1} className="track-page">
        <Breadcrumbs items={[{ label: 'Track Order', href: '/track' }]} />
        <div className="track-page__shell container">
          <motion.header
            className="track-page__header"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            
            <h1 className="track-page__title">Track Your Revivaa Order</h1>
            <p className="track-page__lead">
              Enter your tracking code (e.g. RVN-XXXXXX) to view live dispatch progress and delivery
              estimates across Pakistan.
            </p>
          </motion.header>

          <motion.form
            className="track-page__form clay"
            onSubmit={onSubmit}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
          >
            <label className="track-page__field">
              <span className="track-page__field-label">Order Tracking ID</span>
              <div className="track-page__input-row">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value.toUpperCase())}
                  placeholder="e.g. RVN-1A2B3C4D"
                  spellCheck={false}
                  autoComplete="off"
                  autoFocus
                  className="track-page__input"
                />
                <button
                  type="submit"
                  className="clay-btn track-page__submit-btn"
                  disabled={phase === 'loading' || !query.trim()}
                >
                  {phase === 'loading' ? 'Searching…' : 'Track Order'}
                </button>
              </div>
            </label>
          </motion.form>

          {error && (
            <motion.p
              className="track-page__error"
              role="alert"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          {phase === 'success' && order && (
            <motion.div
              className="track-page__card clay"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
            >
              <div className="track-page__card-top">
                <span className="track-page__eyebrow">
                  <PackageSearch size={16} strokeWidth={1.8} aria-hidden />
                  Live Parcel Status
                </span>
                <span className={`track-page__badge track-page__badge--${order.status}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              <div className="track-page__code-row">
                <button
                  type="button"
                  className="track-page__code-pill"
                  onClick={onCopy}
                  title="Click to copy tracking ID"
                >
                  <span className="track-page__code-label">Tracking ID</span>
                  <strong className="track-page__code-val">{order.tracking_code}</strong>
                  {copied ? (
                    <span className="track-page__copied-tag">
                      <Check size={14} /> Copied
                    </span>
                  ) : (
                    <Copy size={15} className="track-page__copy-icon" aria-hidden />
                  )}
                </button>
              </div>

              {isCancelled ? (
                <div className="track-page__cancelled">
                  <XCircle size={24} aria-hidden />
                  <div>
                    <strong>This order has been cancelled.</strong>
                    <p>If you have any questions, please contact our support team on WhatsApp.</p>
                  </div>
                </div>
              ) : (
                <div className="track-page__timeline-wrap">
                  <ol className="track-page__steps">
                    {STEPS.map((step, i) => {
                      const { icon: Icon } = step
                      const reached = i <= currentIndex
                      const isCurrent = i === currentIndex
                      return (
                        <li
                          key={step.key}
                          className={`track-page__step ${reached ? 'is-reached' : ''} ${
                            isCurrent ? 'is-current' : ''
                          }`}
                        >
                          <span className="track-page__step-dot">
                            <Icon size={17} strokeWidth={2} aria-hidden />
                          </span>
                          <span className="track-page__step-copy">
                            <strong>{step.label}</strong>
                            <small>{step.desc}</small>
                          </span>
                          {i < STEPS.length - 1 && <span className="track-page__step-line" />}
                        </li>
                      )
                    })}
                  </ol>
                </div>
              )}

              {/* Delivery info summary grid */}
              <div className="track-page__meta-grid">
                <div className="track-page__meta-item">
                  <Calendar size={18} className="track-page__meta-icon" />
                  <div>
                    <span className="track-page__meta-label">Placed On</span>
                    <strong className="track-page__meta-val">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </strong>
                  </div>
                </div>
                <div className="track-page__meta-item">
                  <User size={18} className="track-page__meta-icon" />
                  <div>
                    <span className="track-page__meta-label">Customer</span>
                    <strong className="track-page__meta-val">{order.customer_name || '—'}</strong>
                  </div>
                </div>
                <div className="track-page__meta-item">
                  <MapPin size={18} className="track-page__meta-icon" />
                  <div>
                    <span className="track-page__meta-label">Delivery Destination</span>
                    <strong className="track-page__meta-val">{order.customer_city || 'Pakistan'}</strong>
                  </div>
                </div>
              </div>

              {/* Order Items & Totals Breakdown */}
              <div className="track-page__receipt-box">
                <h4>Items in Package</h4>
                <ul className="track-page__lines">
                  {order.items.map((item, i) => (
                    <li
                      key={`${item.product_name}-${i}-${item.unit_price}-${item.quantity}`}
                      className="track-page__line"
                    >
                      <span className="track-page__line-name">
                        {item.product_name} <em>× {item.quantity}</em>
                      </span>
                      <span className="track-page__line-price">
                        {formatMoney(item.line_total, order.currency)}
                      </span>
                    </li>
                  ))}
                </ul>

                <dl className="track-page__totals">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatMoney(order.subtotal, order.currency)}</dd>
                  </div>
                  {order.discount > 0 && (
                    <div className="track-page__discount-row">
                      <dt>Voucher Discount</dt>
                      <dd>-{formatMoney(order.discount, order.currency)}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Delivery Charges</dt>
                    <dd>{formatMoney(order.delivery_charge, order.currency)}</dd>
                  </div>
                  <div className="track-page__total">
                    <dt>Total Amount (COD)</dt>
                    <dd>{formatMoney(order.total, order.currency)}</dd>
                  </div>
                </dl>
              </div>

              {/* Direct WhatsApp Concierge Support */}
              <div className="track-page__support-box">
                <div className="track-page__support-info">
                  <MessageCircle size={22} className="track-page__wa-icon" />
                  <div>
                    <strong>Need Help with this Order?</strong>
                    <p>Chat with our care concierge directly on WhatsApp for status updates or address changes.</p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/923440888847?text=Hi%20Revivaa!%20I%20need%20an%20update%20on%20my%20order%20${order.tracking_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clay-btn track-page__wa-btn"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}