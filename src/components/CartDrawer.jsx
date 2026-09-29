import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart } from '../lib/CartContext'
import { formatMoney } from '../data/product'
import { DELIVERY_CHARGE } from '../data/pakistan'
import './CartDrawer.css'

const EASE = [0.22, 1, 0.36, 1]

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function CartDrawer() {
  const { items, subtotal, open, setOpen, setQty, remove, clear } = useCart()
  const panelRef = useRef(null)
  const currency = items[0]?.currency || 'PKR'
  const count = items.reduce((n, i) => n + i.qty, 0)

  useEffect(() => {
    document.body.classList.toggle('cart-open', open)
    return () => document.body.classList.remove('cart-open')
  }, [open])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      // `aria-modal` promises focus stays inside the drawer. Without a trap,
      // Tab walked straight out into the page behind the open overlay.
      if (e.key !== 'Tab' || !open) return
      const panel = panelRef.current
      if (!panel) return
      const items = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  /* Move focus into the drawer on open, and hand it back on close. */
  useEffect(() => {
    if (!open) return undefined
    const panel = panelRef.current
    const restoreTo = document.activeElement

    // Wait for the enter animation to mount the panel contents.
    const raf = requestAnimationFrame(() => {
      const target =
        panel?.querySelector('.cart-drawer__close') ?? panel ?? null
      target?.focus({ preventScroll: true })
    })

    return () => {
      cancelAnimationFrame(raf)
      if (restoreTo instanceof HTMLElement && document.contains(restoreTo)) {
        restoreTo.focus({ preventScroll: true })
      }
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <motion.aside
            ref={panelRef}
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <header className="cart-drawer__head">
              <div>
                <h2 className="cart-drawer__title" id="cart-drawer-title">
                  <span className="cart-drawer__brand">
                    <span className="cart-drawer__icon">
                      <ShoppingBag size={16} strokeWidth={1.8} aria-hidden />
                    </span>
                    Your cart
                  </span>
                  {count > 0 && <span className="cart-drawer__count">{count}</span>}
                </h2>
                <p className="cart-drawer__tagline">
                  {items.length === 0
                    ? 'Nothing here yet — 13 botanicals await.'
                    : `${count} item${count === 1 ? '' : 's'} · delivery ${formatMoney(
                        DELIVERY_CHARGE,
                        currency,
                      )}`}
                </p>
              </div>
              <button
                type="button"
                className="cart-drawer__close"
                onClick={() => setOpen(false)}
                aria-label="Close cart"
              >
                <X size={20} strokeWidth={1.8} aria-hidden />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="cart-drawer__empty">
                <span className="cart-drawer__empty-icon">
                  <ShoppingBag size={26} strokeWidth={1.5} aria-hidden />
                </span>
                <p className="cart-drawer__empty-title">Your cart is empty</p>
                <p>Soft, natural care is one click away.</p>
                <Link to="/shop" className="clay-btn" onClick={() => setOpen(false)}>
                  Browse products
                </Link>
              </div>
            ) : (
              <>
                <ul className="cart-drawer__items">
                  {items.map((item) => (
                    <li key={item.key} className="cart-drawer__item">
                      <Link to={`/product/${item.slug}`} onClick={() => setOpen(false)}>
                        {item.image ? (
                          <img src={item.image} alt="" width={64} height={80} loading="lazy" decoding="async" />
                        ) : (
                          <div className="cart-drawer__item-img" />
                        )}
                      </Link>
                      <div className="cart-drawer__item-body">
                        <div className="cart-drawer__item-top">
                          <Link
                            to={`/product/${item.slug}`}
                            className="cart-drawer__item-name"
                            onClick={() => setOpen(false)}
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            className="cart-drawer__remove"
                            onClick={() => remove(item.key)}
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 size={15} strokeWidth={1.7} aria-hidden />
                          </button>
                        </div>
                        <p className="cart-drawer__item-meta">
                          {formatMoney(item.unitPrice, item.currency)}
                          {item.size ? ` · ${item.size}` : ''}
                        </p>
                        <div
                          className="cart-drawer__stepper"
                          role="group"
                          aria-label={`Quantity for ${item.name}`}
                        >
                          <button
                            type="button"
                            onClick={() => setQty(item.key, item.qty - 1)}
                            disabled={item.qty <= item.minQty}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus size={14} strokeWidth={1.8} aria-hidden />
                          </button>
                          <span aria-live="polite" aria-label={`Quantity ${item.qty}`}>
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(item.key, item.qty + 1)}
                            disabled={item.qty >= item.maxQty}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus size={14} strokeWidth={1.8} aria-hidden />
                          </button>
                        </div>
                      </div>
                      <p className="cart-drawer__item-line">
                        {formatMoney(item.unitPrice * item.qty, item.currency)}
                      </p>
                    </li>
                  ))}
                </ul>

                <footer className="cart-drawer__foot">
                  <div className="cart-drawer__delivery">
                    <span>Delivery</span>
                    <strong>{formatMoney(DELIVERY_CHARGE, currency)}</strong>
                  </div>
                  <div className="cart-drawer__subtotal">
                    <span>Total</span>
                    <strong>
                      {formatMoney(subtotal + DELIVERY_CHARGE, currency)}
                    </strong>
                  </div>
                  <Link to="/checkout" className="clay-btn cart-drawer__cta" onClick={() => setOpen(false)}>
                    Checkout
                  </Link>
                  <p className="cart-drawer__note">Flat delivery — all across Pakistan</p>
                  <button type="button" className="cart-drawer__clear" onClick={clear}>
                    Clear cart
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}