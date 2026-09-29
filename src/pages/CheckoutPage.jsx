import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  ShieldCheck,
  Truck,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { useAuth } from '../auth/AuthProvider'
import { useCart } from '../lib/CartContext'
import { formatMoney } from '../data/product'
import { placeCartOrder, validateVoucher } from '../lib/shop'
import { downloadReceiptImage } from '../lib/receiptImage'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import {
  PAKISTAN_PROVINCE_OPTIONS,
  citiesForProvince,
  DELIVERY_CHARGE,
} from '../data/pakistan'
import './CheckoutPage.css'

const EASE = [0.22, 1, 0.36, 1]
const PHONE_RE = /^03[0-9]{9}$/

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  street: '',
  province: '',
  city: '',
  postalCode: '',
  notes: '',
}

export default function CheckoutPage() {
  const reduced = usePrefersReducedMotion()
  const { configured, user, profile } = useAuth()
  const { items, subtotal, clear } = useCart()

  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [copied, setCopied] = useState(false)

  const [voucherCode, setVoucherCode] = useState('')
  const [voucher, setVoucher] = useState(null)
  const [voucherBusy, setVoucherBusy] = useState(false)
  const [voucherError, setVoucherError] = useState('')

  const currency = items[0]?.currency || 'PKR'
  const delivery = DELIVERY_CHARGE
  const discount = voucher?.discount || 0
  const total = Math.max(0, subtotal + delivery - discount)
  const cityOptions = form.province ? citiesForProvince(form.province) : []

  useEffect(() => {
    const prev = document.title
    document.title = 'Checkout · Revivaa Botanical Care'
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || profile?.full_name || user.user_metadata?.full_name || '',
      email: prev.email || user.email || '',
      phone: prev.phone || profile?.phone || '',
      city: prev.city || profile?.city || '',
    }))
  }, [user, profile])

  const onField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const onProvince = (e) => {
    const next = e.target.value
    const cities = citiesForProvince(next)
    setForm((prev) => ({
      ...prev,
      province: next,
      city: cities.includes(prev.city) ? prev.city : '',
    }))
  }

  const applyVoucher = async () => {
    const code = voucherCode.trim().toUpperCase()
    if (!code) return
    setVoucherBusy(true)
    setVoucherError('')
    setVoucher(null)
    const { data, error: err } = await validateVoucher({
      code,
      subtotal,
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.street.trim(),
    })
    if (err) setVoucherError(err.message)
    else setVoucher(data)
    setVoucherBusy(false)
  }

  const removeVoucher = () => {
    setVoucher(null)
    setVoucherError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!configured) {
      setError('Add Supabase keys to .env.local to place live orders.')
      return
    }

    if (!PHONE_RE.test(form.phone.trim())) {
      setError('Please enter a valid 11-digit Pakistani phone number starting with 03 (e.g. 03440888847).')
      return
    }

    setBusy(true)
    try {
      const lines = items.map((i) => ({
        product_id: i.productId,
        variation_id: i.variationId || null,
        quantity: i.qty,
      }))
      const { data, error: err } = await placeCartOrder({
        lines,
        customerName: form.name.trim(),
        customerEmail: form.email.trim(),
        customerPhone: form.phone.trim(),
        customerAddress: form.street.trim(),
        customerProvince: form.province.trim(),
        customerCity: form.city.trim(),
        customerPostalCode: form.postalCode.trim(),
        notes: form.notes.trim(),
        voucherCode: voucher?.code || null,
      })
      if (err) throw err
      const code = String(data || '').trim().toUpperCase()
      const snapshot = {
        trackingCode: code || `RVN-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        lines: items.map((i) => ({
          name: i.name,
          size: i.size,
          unitPrice: i.unitPrice,
          currency: i.currency,
          qty: i.qty,
        })),
        subtotal,
        delivery,
        discount,
        voucherCode: voucher?.code || '',
        total,
        currency,
        customerName: form.name.trim(),
        placedAt: new Date(),
      }
      clear()
      setReceipt(snapshot)
    } catch (err) {
      setError(err?.message || 'Could not place order. Please check connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app checkout-app">
      <SEO
        title="Secure Checkout · Revivaa"
        description="Complete your order for Revivaa Botanical Hair Oil with nationwide Cash on Delivery across Pakistan."
        noindex={true}
      />
      <Cursor />
      <ScrollToTop />
      <Navbar />

      <main id="main" tabIndex={-1} className="checkout">
        <div className="checkout__shell container">
          <Link to="/shop" className="checkout__back">
            <ArrowLeft size={16} strokeWidth={1.8} aria-hidden />
            Return to Collection
          </Link>

          <motion.header
            className="checkout__header"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            
            <h1 className="checkout__title">Complete Your Ritual</h1>
            <p className="checkout__lead">
              Cash on Delivery (COD) across Pakistan. Delivery in 2–4 business days.
            </p>
          </motion.header>

          {/* ——— Success State ——— */}
          {receipt ? (
            <motion.div
              className="checkout__success"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <div className="checkout__success-card clay">
                <div className="checkout__success-badge">
                  <Check size={18} />
                  <span>Order Confirmed &amp; Queued</span>
                </div>
                <h2 className="checkout__success-title">Thank you, {receipt.customerName}!</h2>
                <p className="checkout__success-p">
                  We have received your botanical order. Keep your tracking ID safe to monitor dispatch and delivery updates.
                </p>

                <button
                  type="button"
                  className="checkout__code-box"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(receipt.trackingCode)
                    } catch {
                      /* clipboard unavailable */
                    }
                    setCopied(true)
                    window.setTimeout(() => setCopied(false), 1600)
                  }}
                  title="Click to copy tracking ID"
                >
                  <div>
                    <small>Tracking ID</small>
                    <strong>{receipt.trackingCode}</strong>
                  </div>
                  {copied ? (
                    <span className="checkout__code-copied">
                      <Check size={16} /> Copied
                    </span>
                  ) : (
                    <Copy size={16} aria-hidden />
                  )}
                </button>

                <dl className="checkout__receipt-totals">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatMoney(receipt.subtotal, receipt.currency)}</dd>
                  </div>
                  <div>
                    <dt>Delivery</dt>
                    <dd>{formatMoney(receipt.delivery, receipt.currency)}</dd>
                  </div>
                  {receipt.discount > 0 && (
                    <div className="checkout__receipt-discount">
                      <dt>Voucher Discount{receipt.voucherCode ? ` (${receipt.voucherCode})` : ''}</dt>
                      <dd>−{formatMoney(receipt.discount, receipt.currency)}</dd>
                    </div>
                  )}
                  <div className="checkout__receipt-grand-total">
                    <dt>Total (COD)</dt>
                    <dd>{formatMoney(receipt.total, receipt.currency)}</dd>
                  </div>
                </dl>
              </div>

              <div className="checkout__success-actions">
                <button
                  type="button"
                  className="clay-btn"
                  onClick={() => downloadReceiptImage(receipt)}
                >
                  <Download size={16} strokeWidth={1.8} aria-hidden />
                  Download Receipt
                </button>
                <Link
                  to={`/track?code=${encodeURIComponent(receipt.trackingCode)}`}
                  className="clay-btn clay-btn-light"
                >
                  Track Parcel Status
                </Link>
                <a
                  href={`https://wa.me/923440888847?text=Hi%20Revivaa!%20I%20just%20placed%20order%20${receipt.trackingCode}.%20Can%20you%20confirm%20details?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="checkout__wa-confirm"
                >
                  <MessageCircle size={16} /> Confirm via WhatsApp
                </a>
              </div>
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div
              className="checkout__empty clay"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <ShoppingBag size={48} className="checkout__empty-icon" />
              <h2 className="checkout__empty-title">Your shopping bag is empty</h2>
              <p className="checkout__empty-sub">
                Explore our botanical collection to add your favourite hair elixirs.
              </p>
              <Link to="/shop" className="clay-btn">
                Browse Collection
              </Link>
            </motion.div>
          ) : (
            <motion.div
              className="checkout__layout"
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.7, ease: EASE }}
            >
              {/* ——— Left Column: Shipping & Delivery Form ——— */}
              <section className="checkout__details" aria-labelledby="checkout-details-heading">
                <div className="checkout__panel clay">
                  <h2 id="checkout-details-heading" className="checkout__section-title">
                    Delivery Information
                  </h2>

                  {!configured && (
                    <p className="checkout__auth-hint checkout__auth-hint--warn">
                      Supabase connection keys missing. Add to <code>.env.local</code> to place live orders.
                    </p>
                  )}

                  <form id="checkout-form" className="checkout__form" onSubmit={onSubmit}>
                    <div className="checkout__fields-grid">
                      <label className="checkout__field checkout__field--full">
                        <span>Full Name *</span>
                        <input
                          name="name"
                          autoComplete="name"
                          required
                          placeholder="e.g. Ayesha Khan"
                          value={form.name}
                          onChange={onField('name')}
                        />
                      </label>

                      <label className="checkout__field">
                        <span>Email Address *</span>
                        <input
                          type="email"
                          name="email"
                          autoComplete="email"
                          required
                          placeholder="ayesha@example.com"
                          value={form.email}
                          onChange={onField('email')}
                        />
                      </label>

                      <label className="checkout__field">
                        <span>WhatsApp / Mobile Phone *</span>
                        <input
                          type="tel"
                          name="phone"
                          autoComplete="tel"
                          required
                          placeholder="03440888847"
                          pattern="03[0-9]{9}"
                          maxLength={11}
                          title="11-digit Pakistani number, e.g. 03440888847"
                          value={form.phone}
                          onChange={onField('phone')}
                        />
                      </label>

                      <label className="checkout__field checkout__field--full">
                        <span>Street Address (House / Apt, Street, Area) *</span>
                        <input
                          name="street"
                          autoComplete="street-address"
                          required
                          placeholder="House 12, Street 4, Sector F-7"
                          value={form.street}
                          onChange={onField('street')}
                        />
                      </label>

                      <label className="checkout__field">
                        <span>Province *</span>
                        <select
                          name="province"
                          required
                          autoComplete="address-level1"
                          value={form.province}
                          onChange={onProvince}
                        >
                          <option value="" disabled>
                            Select province…
                          </option>
                          {PAKISTAN_PROVINCE_OPTIONS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="checkout__field">
                        <span>City *</span>
                        <select
                          name="city"
                          required
                          autoComplete="address-level2"
                          value={form.city}
                          onChange={onField('city')}
                          disabled={!form.province}
                        >
                          <option value="" disabled>
                            {form.province ? 'Select city…' : 'Choose province first'}
                          </option>
                          {cityOptions.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="checkout__field checkout__field--full">
                        <span>Special Delivery Notes (Optional)</span>
                        <textarea
                          name="notes"
                          rows={2}
                          placeholder="Call before arrival, gate code, gift note…"
                          value={form.notes}
                          onChange={onField('notes')}
                        />
                      </label>
                    </div>

                    {/* Cash On Delivery Assurance */}
                    <div className="checkout__payment-card">
                      <div className="checkout__payment-head">
                        <Truck size={20} className="checkout__payment-icon" />
                        <div>
                          <strong>Cash on Delivery (COD)</strong>
                          <p>Pay cash safely when your parcel arrives at your doorstep.</p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <p className="checkout__error" role="alert">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="clay-btn checkout__submit-btn"
                      disabled={busy || !configured}
                    >
                      {busy ? 'Placing Order…' : `Place Order (COD) · ${formatMoney(total, currency)}`}
                    </button>

                    <div className="checkout__guarantees">
                      <span>
                        <ShieldCheck size={15} /> 100% Satisfaction Guarantee
                      </span>
                      <span>
                        <Truck size={15} /> Dispatch within 24h
                      </span>
                    </div>
                  </form>
                </div>
              </section>

              {/* ——— Right Column: Order Summary & Voucher ——— */}
              <section className="checkout__order" aria-labelledby="checkout-order-heading">
                <div className="checkout__panel clay">
                  <h2 id="checkout-order-heading" className="checkout__section-title">
                    Order Summary ({items.length})
                  </h2>

                  <ul className="checkout__lines">
                    {items.map((item) => (
                      <li key={item.key} className="checkout__line">
                        <Link to={`/product/${item.slug}`} className="checkout__thumb-wrap">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="checkout__thumb" />
                          ) : (
                            <div className="checkout__thumb checkout__thumb--empty" />
                          )}
                          <span className="checkout__thumb-qty">{item.qty}</span>
                        </Link>
                        <div className="checkout__line-copy">
                          <p className="checkout__product-name">{item.name}</p>
                          <p className="checkout__product-meta">
                            {item.size ? `${item.size} · ` : ''}
                            {formatMoney(item.unitPrice, item.currency)}
                          </p>
                        </div>
                        <p className="checkout__line-total">
                          {formatMoney(item.unitPrice * item.qty, item.currency)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {/* Voucher Box */}
                  <div className="checkout__voucher">
                    <label className="checkout__voucher-label" htmlFor="voucher-code">
                      Promo or Voucher Code
                    </label>
                    {voucher ? (
                      <div className="checkout__voucher-applied">
                        <div>
                          <span className="checkout__voucher-applied-code">{voucher.code}</span>
                          <span className="checkout__voucher-applied-amount">
                            {formatMoney(discount, currency)} discount
                          </span>
                        </div>
                        <button
                          type="button"
                          className="checkout__voucher-remove"
                          onClick={removeVoucher}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="checkout__voucher-row">
                        <input
                          id="voucher-code"
                          name="voucherCode"
                          autoComplete="off"
                          placeholder="e.g. REVIVAA10"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          className="checkout__voucher-input"
                        />
                        <button
                          type="button"
                          className="checkout__voucher-apply"
                          onClick={applyVoucher}
                          disabled={voucherBusy || !voucherCode.trim()}
                        >
                          {voucherBusy ? 'Checking…' : 'Apply'}
                        </button>
                      </div>
                    )}
                    {voucherError && (
                      <p className="checkout__voucher-msg checkout__voucher-msg--error" role="alert">
                        {voucherError}
                      </p>
                    )}
                  </div>

                  {/* Price Totals */}
                  <dl className="checkout__totals">
                    <div>
                      <dt>Subtotal</dt>
                      <dd>{formatMoney(subtotal, currency)}</dd>
                    </div>
                    <div>
                      <dt>Express Delivery</dt>
                      <dd>{formatMoney(delivery, currency)}</dd>
                    </div>
                    {discount > 0 && (
                      <div className="checkout__totals-discount">
                        <dt>Discount ({voucher?.code})</dt>
                        <dd>−{formatMoney(discount, currency)}</dd>
                      </div>
                    )}
                    <div className="checkout__totals-grand">
                      <dt>Total Amount</dt>
                      <dd>{formatMoney(total, currency)}</dd>
                    </div>
                  </dl>
                </div>
              </section>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}