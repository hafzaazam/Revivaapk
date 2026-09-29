import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { useAuth } from '../auth/AuthProvider'
import { fetchMyOrders } from '../lib/shop'
import { formatMoney } from '../data/product'
import './OrdersPage.css'

export default function OrdersPage() {
  const { configured, ready, user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!ready || !configured || !user) return undefined

    let alive = true
    fetchMyOrders().then(({ data, error: err }) => {
      if (!alive) return
      if (err) setError(err.message)
      setOrders(data || [])
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [ready, configured, user])

  const isLoading = ready && configured && user && loading

  return (
    <div className="app orders-app">
      <SEO
        title="Your Orders · Revivaa"
        description="Review and track your recent Revivaa botanical hair care purchases and delivery status."
        noindex={true}
      />
      <Cursor />
      <ScrollToTop />
      <Navbar />

      <main id="main" tabIndex={-1} className="orders-page">
        <div className="orders-page__shell container">
          <Link to="/shop" className="orders-page__back">
            <ArrowLeft size={16} strokeWidth={1.6} aria-hidden />
            Checkout
          </Link>

          <p className="section-label">Account</p>
          <h1 className="orders-page__title">Your orders</h1>
          <p className="orders-page__lead">Review and track your recent Revivaa botanical hair care purchases.</p>

          {!configured && (
            <p className="orders-page__empty">Configure Supabase in `.env.local` to load orders.</p>
          )}

          {configured && ready && !user && (
            <p className="orders-page__empty">
              <Link to="/auth?next=/orders">Sign in</Link> to see your orders.
            </p>
          )}

          {isLoading && user && <p className="orders-page__empty">Loading…</p>}
          {error && <p className="orders-page__error">{error}</p>}

          {!isLoading && user && orders.length === 0 && !error && (
            <p className="orders-page__empty">
              No orders yet. <Link to="/shop">Shop Revivaa Oil</Link>
            </p>
          )}

          <ul className="orders-page__list">
            {orders.map((order) => (
              <li key={order.id} className="orders-page__item">
                <div className="orders-page__item-top">
                  <span className="orders-page__ref">#{String(order.id).slice(0, 8)}</span>
                  <span className="orders-page__status">{order.status}</span>
                </div>
                <p className="orders-page__meta">
                  {new Date(order.created_at).toLocaleString()} ·{' '}
                  {formatMoney(order.total, order.currency)}
                </p>
                <ul className="orders-page__lines">
                  {(order.order_items || []).map((line) => (
                    <li key={line.id}>
                      {line.product_name} × {line.quantity}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  )
}
