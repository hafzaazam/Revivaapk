import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bell,
  CheckCheck,
  LayoutDashboard,
  Menu,
  Moon,
  Package,
  ShoppingBag,
  Star,
  Sun,
  Tags,
  Ticket,
  Volume2,
  VolumeX,
  X,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Truck,
  Home,
  XCircle,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider'
import { useTheme } from '../../theme/ThemeProvider'
import { formatMoney } from '../../data/product'
import { useNewOrders } from '../../hooks/useNewOrders'
import SEO from '../../components/SEO'
import {
  adminFetchOrders,
  adminFetchCategories,
  adminFetchProductsAll,
  adminFetchReviews,
  adminFetchVouchers,
  adminUpdateOrderStatus,
  adminSaveCategory,
  adminDeleteCategory,
  adminSaveProduct,
  adminDeleteProduct,
  adminUpdateReviewStatus,
  adminUpdateReview,
  adminDeleteReview,
  adminSaveReview,
  adminSaveVoucher,
  adminDeleteVoucher,
} from '../../lib/adminApi'
import CategoryEditor from './CategoryEditor'
import ProductEditor from './ProductEditor'
import ReviewsManager from './ReviewsManager'
import ReviewEditor from './ReviewEditor'
import VouchersManager from './VouchersManager'
import VoucherEditor from './VoucherEditor'
import DashboardOverview from './DashboardOverview'
import '../Admin.css'
import './AdminReviews.css'
import './AdminVouchers.css'
import './DashboardOverview.css'
import './AdminCharts.css'
import './AdminNotifications.css'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle2,
  shipped: Truck,
  delivered: Home,
  cancelled: XCircle,
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Tags },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'vouchers', label: 'Vouchers', icon: Ticket },
]

export default function AdminDashboardPage({ homeHref }) {
  const { user, signOut } = useAuth()
  const [section, setSection] = useState('overview')
  const [navOpen, setNavOpen] = useState(false)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [reviews, setReviews] = useState([])
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [editor, setEditor] = useState(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    document.title = `Admin · ${section.charAt(0).toUpperCase() + section.slice(1)} · Revivaa`
  }, [section])

  const refresh = useCallback(async () => {
    setNotice('')
    const [o, p, c, r, v] = await Promise.all([
      adminFetchOrders(),
      adminFetchProductsAll(),
      adminFetchCategories(),
      adminFetchReviews(),
      adminFetchVouchers(),
    ])
    if (o.error) setError((prev) => prev || o.error.message)
    else setOrders(o.data || [])
    if (p.error) setError((prev) => prev || p.error.message)
    else setProducts(p.data || [])
    if (c.error) setError((prev) => prev || c.error.message)
    else setCategories(c.data || [])
    if (r.error) setError((prev) => prev || r.error.message)
    else setReviews(r.data || [])
    if (v.error) setError((prev) => prev || v.error.message)
    else setVouchers(v.data || [])
    setLoading(false)
  }, [])

  const [notifOpen, setNotifOpen] = useState(false)
  const {
    notifications,
    unread,
    muted,
    toggleMuted,
    dismissNotification,
    markAllRead,
    clearNotifications,
  } = useNewOrders({ orders, onNewOrder: refresh })

  useEffect(() => {
    refresh()
  }, [refresh])

  /* ── Filter states ─────────────────────────────────────────── */
  const [ordersSearch, setOrdersSearch] = useState('')
  const [ordersStatus, setOrdersStatus] = useState('')
  const [ordersSort, setOrdersSort] = useState('newest')

  const [productsSearch, setProductsSearch] = useState('')
  const [productsCategory, setProductsCategory] = useState('')
  const [productsStock, setProductsStock] = useState('all')

  const [categoriesSearch, setCategoriesSearch] = useState('')

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'pending').length
    const confirmed = orders.filter((o) => o.status === 'confirmed').length
    const shipped = orders.filter((o) => o.status === 'shipped').length
    const delivered = orders.filter((o) => o.status === 'delivered').length
    const cancelled = orders.filter((o) => o.status === 'cancelled').length
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0)
    const stock = products.reduce((sum, p) => Math.max(0, sum + Math.max(0, p.stock || 0)), 0)
    const pendingReviews = reviews.filter((re) => re.status === 'pending').length
    return {
      pending,
      confirmed,
      shipped,
      delivered,
      cancelled,
      totalRevenue,
      stock,
      productCount: products.length,
      pendingOrders: pending,
      pendingReviews,
      voucherCount: vouchers.length,
    }
  }, [orders, products, reviews, vouchers])

  const setActive = (id) => {
    setSection(id)
    setEditor(null)
    setNavOpen(false)
  }

  const onStatus = async (orderId, status) => {
    setNotice('')
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    )
    const { error: err } = await adminUpdateOrderStatus(orderId, status)
    if (err) {
      setError(err.message)
      refresh()
      return
    }
    setNotice(`Order #${String(orderId).slice(0, 8)} status updated to ${status}`)
  }

  const saveCategory = async (cat) => {
    const { error: err } = await adminSaveCategory(cat)
    if (err) {
      setError(err.message)
      return
    }
    setNotice('Category saved successfully')
    setEditor(null)
    refresh()
  }

  const deleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    const { error: err } = await adminDeleteCategory(id)
    if (err) setError(err.message)
    else {
      setNotice('Category deleted')
      refresh()
    }
  }

  const saveProduct = async (data) => {
    const { error: err } = await adminSaveProduct(data)
    if (err) {
      setError(err.message)
      return
    }
    setNotice('Product saved successfully')
    setEditor(null)
    refresh()
  }

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    const { error: err } = await adminDeleteProduct(id)
    if (err) setError(err.message)
    else {
      setNotice('Product deleted')
      refresh()
    }
  }

  const updateReviewStatus = async (id, status) => {
    setNotice('')
    const { error: err } = await adminUpdateReviewStatus(id, status)
    if (err) {
      setError(err.message)
      return
    }
    setNotice(`Review marked as ${status}`)
    refresh()
  }

  const featureReview = async (review) => {
    const { error: err } = await adminUpdateReview(review.id, {
      featured: !review.featured,
    })
    if (err) setError(err.message)
    else {
      setNotice(review.featured ? 'Unfeatured review' : 'Featured review on storefront')
      refresh()
    }
  }

  const deleteReview = async (review) => {
    if (!confirm('Delete review permanently?')) return
    const { error: err } = await adminDeleteReview(review)
    if (err) setError(err.message)
    else {
      setNotice('Review deleted')
      refresh()
    }
  }

  const saveReview = async (data) => {
    const { error: err } = await adminSaveReview(data)
    if (err) {
      setError(err.message)
      return
    }
    setNotice('Review saved')
    setEditor(null)
    refresh()
  }

  const saveVoucher = async (data) => {
    const { error: err } = await adminSaveVoucher(data)
    if (err) {
      setError(err.message)
      return
    }
    setNotice('Voucher saved successfully')
    setEditor(null)
    refresh()
  }

  const deleteVoucher = async (voucher) => {
    if (!confirm(`Delete voucher ${voucher.code}?`)) return
    const { error: err } = await adminDeleteVoucher(voucher.id)
    if (err) setError(err.message)
    else {
      setNotice('Voucher deleted')
      refresh()
    }
  }

  const toggleVoucher = async (voucher) => {
    const { error: err } = await adminSaveVoucher({
      ...voucher,
      is_active: !voucher.is_active,
    })
    if (err) setError(err.message)
    else {
      setNotice(voucher.is_active ? 'Voucher deactivated' : 'Voucher activated')
      refresh()
    }
  }

  const categoriesById = useMemo(() => {
    const map = {}
    categories.forEach((c) => {
      map[c.id] = c
    })
    return map
  }, [categories])

  /* ── Filtered Orders ────────────────────────────────────────── */
  const filteredOrders = useMemo(() => {
    let list = orders.filter((o) => {
      if (ordersStatus && o.status !== ordersStatus) return false
      if (ordersSearch.trim()) {
        const q = ordersSearch.toLowerCase().trim()
        const matchName = o.customer_name?.toLowerCase().includes(q)
        const matchEmail = o.customer_email?.toLowerCase().includes(q)
        const matchPhone = o.customer_phone?.toLowerCase().includes(q)
        const matchCity = o.customer_city?.toLowerCase().includes(q)
        const matchCode = (o.tracking_code || '').toLowerCase().includes(q)
        const matchId = String(o.id || '').toLowerCase().includes(q)
        const matchNotes = o.notes?.toLowerCase().includes(q)
        if (
          !matchName &&
          !matchEmail &&
          !matchPhone &&
          !matchCity &&
          !matchCode &&
          !matchId &&
          !matchNotes
        ) {
          return false
        }
      }
      return true
    })

    switch (ordersSort) {
      case 'oldest':
        list = [...list].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'highest':
        list = [...list].sort((a, b) => (b.total || 0) - (a.total || 0))
        break
      case 'lowest':
        list = [...list].sort((a, b) => (a.total || 0) - (b.total || 0))
        break
      default: // 'newest'
        list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    return list
  }, [orders, ordersStatus, ordersSearch, ordersSort])

  /* ── Filtered Products ──────────────────────────────────────── */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productsCategory && p.category_id !== productsCategory) return false
      if (productsStock === 'in' && p.stock <= 0) return false
      if (productsStock === 'low' && (p.stock <= 0 || p.stock > (p.low_stock_threshold ?? 10)))
        return false
      if (productsStock === 'out' && p.stock !== 0) return false
      if (productsSearch.trim()) {
        const q = productsSearch.toLowerCase().trim()
        const matchName = p.name?.toLowerCase().includes(q)
        const matchSlug = p.slug?.toLowerCase().includes(q)
        const matchDesc = p.description?.toLowerCase().includes(q)
        if (!matchName && !matchSlug && !matchDesc) return false
      }
      return true
    })
  }, [products, productsCategory, productsStock, productsSearch])

  /* ── Filtered Categories ────────────────────────────────────── */
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (categoriesSearch.trim()) {
        const q = categoriesSearch.toLowerCase().trim()
        const matchName = c.name?.toLowerCase().includes(q)
        const matchSlug = c.slug?.toLowerCase().includes(q)
        if (!matchName && !matchSlug) return false
      }
      return true
    })
  }, [categories, categoriesSearch])

  const activeLabel = NAV_ITEMS.find((n) => n.id === section)?.label || 'Overview'

  return (
    <div className="admin-shell">
      <SEO title="Executive Admin Dashboard · Revivaa" noindex={true} />
      {/* ——— Sidebar ——— */}
      <aside className={`admin-shell__side${navOpen ? ' is-open' : ''}`}>
        <div className="admin-shell__brand">
          <span className="admin-login__eyebrow">revivaa</span>
          <strong>Executive Admin</strong>
        </div>
        <nav className="admin-shell__nav" aria-label="Admin sections">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const badge =
              (item.id === 'orders' && stats.pendingOrders > 0 && stats.pendingOrders) ||
              (item.id === 'reviews' && stats.pendingReviews > 0 && stats.pendingReviews) ||
              null
            return (
              <button
                type="button"
                key={item.id}
                className={section === item.id ? 'is-active' : ''}
                onClick={() => setActive(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {badge != null && <span className="admin-shell__badge">{badge}</span>}
              </button>
            )
          })}
        </nav>
        <div className="admin-shell__side-foot">
          <span className="admin__user">{user?.email}</span>
          <a href={homeHref || '/'} className="admin-link">
            View Live Store
          </a>
          <button type="button" className="admin-link admin-link--danger" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </aside>

      {navOpen && (
        <button
          type="button"
          className="admin-shell__scrim"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* ——— Main Content Area ——— */}
      <div className="admin-shell__main">
        <header className="admin-shell__topbar">
          <div className="admin-shell__topbar-left">
            <button
              type="button"
              className="admin-shell__hamburger"
              aria-label="Open menu"
              onClick={() => setNavOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1>{activeLabel}</h1>
          </div>

          <div className="admin-shell__topbar-actions">
            <div className="admin-notif">
              <button
                type="button"
                className="admin-icon-btn"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={() => toggleTheme()}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                type="button"
                className="admin-icon-btn admin-icon-btn--bell"
                aria-label={notifOpen ? 'Close notifications' : 'Notifications'}
                aria-expanded={notifOpen}
                onClick={() => {
                  setNotifOpen((open) => !open)
                  if (!notifOpen) markAllRead()
                }}
              >
                <Bell size={18} />
                {unread > 0 && <span className="admin-notif__badge">{unread}</span>}
              </button>
              {notifOpen && (
                <div className="admin-notif__panel">
                  <div className="admin-notif__head">
                    <strong>New order alerts</strong>
                    <span className="admin-notif__tools">
                      <button
                        type="button"
                        className="admin-notif__tool"
                        aria-pressed={muted}
                        onClick={() => toggleMuted()}
                        title={muted ? 'Unmute chime' : 'Mute chime'}
                      >
                        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <button
                        type="button"
                        className="admin-notif__tool"
                        onClick={() => {
                          markAllRead()
                          clearNotifications()
                        }}
                        title="Clear all notifications"
                      >
                        <CheckCheck size={16} />
                      </button>
                    </span>
                  </div>
                  <div className="admin-notif__body">
                    {notifications.length === 0 ? (
                      <p className="admin-notif__empty">
                        No new orders right now. Orders appear here live when placed.
                      </p>
                    ) : (
                      <ul className="admin-notif__list">
                        {notifications.map((n) => (
                          <li key={n.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSection('orders')
                                setEditor(null)
                                setNotifOpen(false)
                              }}
                            >
                              <span className="admin-notif__dot" />
                              <span className="admin-notif__who">
                                <strong>{n.name}</strong>
                                <span>
                                  {n.city} · {formatMoney(n.total, n.currency)}
                                </span>
                              </span>
                              <span className="admin-notif__at">
                                {new Date(n.at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="admin-notif__foot">
                    {muted ? 'Audio muted' : 'Audio chime enabled'}
                  </p>
                </div>
              )}
            </div>
            <button type="button" className="admin-btn admin-btn--small" onClick={() => refresh()}>
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <p className="admin-banner admin-banner--error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="admin-banner" role="status">
            {notice}
          </p>
        )}
        {loading && <p className="admin__muted">Loading administration data…</p>}

        {/* ——— Section 1: Overview ——— */}
        {!loading && section === 'overview' && (
          <DashboardOverview
            products={products}
            categories={categories}
            vouchers={vouchers}
            orders={orders}
          />
        )}

        {/* ——— Section 2: Orders Management ——— */}
        {!loading && section === 'orders' && (
          <section className="admin-section">
            {/* Status Metric Filter Chips */}
            <div className="admin-metrics-chips">
              <button
                type="button"
                className={`admin-metric-chip ${ordersStatus === '' ? 'is-active' : ''}`}
                onClick={() => setOrdersStatus('')}
              >
                <span>All Orders</span>
                <strong>{orders.length}</strong>
              </button>
              <button
                type="button"
                className={`admin-metric-chip admin-metric-chip--pending ${ordersStatus === 'pending' ? 'is-active' : ''}`}
                onClick={() => setOrdersStatus('pending')}
              >
                <span>Pending</span>
                <strong>{stats.pending}</strong>
              </button>
              <button
                type="button"
                className={`admin-metric-chip admin-metric-chip--confirmed ${ordersStatus === 'confirmed' ? 'is-active' : ''}`}
                onClick={() => setOrdersStatus('confirmed')}
              >
                <span>Confirmed</span>
                <strong>{stats.confirmed}</strong>
              </button>
              <button
                type="button"
                className={`admin-metric-chip admin-metric-chip--shipped ${ordersStatus === 'shipped' ? 'is-active' : ''}`}
                onClick={() => setOrdersStatus('shipped')}
              >
                <span>In Transit</span>
                <strong>{stats.shipped}</strong>
              </button>
              <button
                type="button"
                className={`admin-metric-chip admin-metric-chip--delivered ${ordersStatus === 'delivered' ? 'is-active' : ''}`}
                onClick={() => setOrdersStatus('delivered')}
              >
                <span>Delivered</span>
                <strong>{stats.delivered}</strong>
              </button>
              <button
                type="button"
                className={`admin-metric-chip admin-metric-chip--cancelled ${ordersStatus === 'cancelled' ? 'is-active' : ''}`}
                onClick={() => setOrdersStatus('cancelled')}
              >
                <span>Cancelled</span>
                <strong>{stats.cancelled}</strong>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="admin-filter-bar">
              <div className="admin-filter-search">
                <Search size={16} className="admin-filter-icon" />
                <input
                  type="text"
                  placeholder="Search by customer name, phone, email, city, tracking ID, order #…"
                  value={ordersSearch}
                  onChange={(e) => setOrdersSearch(e.target.value)}
                />
                {ordersSearch && (
                  <button
                    type="button"
                    className="admin-filter-clear"
                    onClick={() => setOrdersSearch('')}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="admin-filter-selects">
                <label className="admin-filter-label">
                  <Filter size={14} /> Status:
                  <select
                    value={ordersStatus}
                    onChange={(e) => setOrdersStatus(e.target.value)}
                  >
                    <option value="">All Statuses ({orders.length})</option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)} ({orders.filter((o) => o.status === s).length})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-filter-label">
                  <ArrowUpDown size={14} /> Sort:
                  <select
                    value={ordersSort}
                    onChange={(e) => setOrdersSort(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Amount</option>
                    <option value="lowest">Lowest Amount</option>
                  </select>
                </label>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="admin__empty-box">
                <p className="admin__muted">
                  {ordersSearch || ordersStatus
                    ? 'No orders match your search criteria.'
                    : 'No customer orders placed yet.'}
                </p>
              </div>
            ) : (
              <ul className="admin-orders">
                {filteredOrders.map((order) => {
                  const StatusIcon = STATUS_ICONS[order.status] || Clock
                  return (
                    <li key={order.id} className="admin-orders__item">
                      <div className="admin-orders__head">
                        <div className="admin-orders__head-id">
                          <span className="admin-orders__hash">#{String(order.id).slice(0, 8)}</span>
                          {order.tracking_code && (
                            <span className="admin-orders__tracking-tag">
                              {order.tracking_code}
                            </span>
                          )}
                          <span className="admin__muted">
                            · {new Date(order.created_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="admin-orders__status-wrap">
                          <StatusIcon size={16} className={`admin-orders__status-icon is-${order.status}`} />
                          <label className="admin-orders__status">
                            <span className="visually-hidden">Status</span>
                            <select
                              value={order.status}
                              onChange={(e) => onStatus(order.id, e.target.value)}
                              className={`admin-orders__select is-${order.status}`}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>

                      <div className="admin-orders__customer">
                        <strong>{order.customer_name}</strong>
                        <span> · {order.customer_email}</span>
                        <span> · 📱 {order.customer_phone}</span>
                      </div>

                      <p className="admin__muted admin-orders__address">
                        📍 {order.customer_address ? `${order.customer_address}, ` : ''}
                        {order.customer_city}
                        {order.customer_province ? `, ${order.customer_province}` : ''}
                        {order.notes ? ` · Note: "${order.notes}"` : ''}
                      </p>

                      <ul className="admin-orders__lines">
                        {(order.order_items || []).map((line) => (
                          <li key={line.id}>
                            <span>
                              {line.product_name} <strong>× {line.quantity}</strong>
                            </span>
                            <span>{formatMoney(line.line_total, order.currency)}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="admin-orders__foot">
                        <div className="admin-orders__discount-box">
                          {order.discount > 0 && (
                            <span className="admin-orders__discount">
                              Discount −{formatMoney(order.discount, order.currency)}
                              {order.voucher_code ? ` (${order.voucher_code})` : ''}
                            </span>
                          )}
                          <span className="admin__muted">
                            Delivery: {formatMoney(order.delivery_charge || 200, order.currency)}
                          </span>
                        </div>
                        <p className="admin-orders__total">
                          Total: <strong>{formatMoney(order.total, order.currency)}</strong>
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )}

        {/* ——— Section 3: Products Management ——— */}
        {!loading && section === 'products' && (
          <section className="admin-section">
            {editor?.type === 'product' ? (
              <ProductEditor
                initial={editor.product}
                categories={categories}
                onSave={saveProduct}
                onClose={() => setEditor(null)}
              />
            ) : (
              <>
                <div className="admin-section__top-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                    onClick={() => setEditor({ type: 'product', product: null })}
                  >
                    <Plus size={16} /> New Product
                  </button>
                </div>

                {/* Products Filter Bar */}
                <div className="admin-filter-bar">
                  <div className="admin-filter-search">
                    <Search size={16} className="admin-filter-icon" />
                    <input
                      type="text"
                      placeholder="Search products by title, slug…"
                      value={productsSearch}
                      onChange={(e) => setProductsSearch(e.target.value)}
                    />
                    {productsSearch && (
                      <button
                        type="button"
                        className="admin-filter-clear"
                        onClick={() => setProductsSearch('')}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="admin-filter-selects">
                    <label className="admin-filter-label">
                      <Filter size={14} /> Category:
                      <select
                        value={productsCategory}
                        onChange={(e) => setProductsCategory(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-filter-label">
                      Stock:
                      <select
                        value={productsStock}
                        onChange={(e) => setProductsStock(e.target.value)}
                      >
                        <option value="all">All Inventory</option>
                        <option value="in">In Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                      </select>
                    </label>
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="admin__empty-box">
                    <p className="admin__muted">
                      {productsSearch || productsCategory || productsStock !== 'all'
                        ? 'No products match your filters.'
                        : 'No products in database.'}
                    </p>
                  </div>
                ) : (
                  <ul className="admin-product-list">
                    {filteredProducts.map((p) => (
                      <li key={p.id} className="admin-product-list__item">
                        <div className="admin-product-list__img">
                          {p.image_url ? (
                            <img src={p.image_url} alt="" />
                          ) : (
                            <div className="admin-product-list__img-placeholder" />
                          )}
                        </div>
                        <div className="admin-product-list__body">
                          <strong>{p.name}</strong>
                          <span className="admin__muted">
                            {p.id} · {formatMoney(p.unit_price, p.currency)}
                            {p.sale_price ? ` → ${formatMoney(p.sale_price)}` : ''}
                            {' · stock '}
                            {p.stock === -1 ? '∞' : p.stock}
                          </span>
                          <span className="admin-product-list__tags">
                            {!p.active && (
                              <span className="admin-tag admin-tag--off">Inactive</span>
                            )}
                            {p.draft && (
                              <span className="admin-tag admin-tag--draft">Draft</span>
                            )}
                            {p.featured && (
                              <span className="admin-tag admin-tag--feat">Featured</span>
                            )}
                            {p.is_new && <span className="admin-tag admin-tag--new">New</span>}
                            {p.best_seller && (
                              <span className="admin-tag admin-tag--best">Best seller</span>
                            )}
                            {p.stock > 0 &&
                              p.stock <= (p.low_stock_threshold ?? 10) && (
                                <span className="admin-tag admin-tag--low">Low stock</span>
                              )}
                            {p.stock === 0 && (
                              <span className="admin-tag admin-tag--out">Out of stock</span>
                            )}
                          </span>
                          {p.category_id && (
                            <span className="admin__muted">
                              📁 {categoriesById[p.category_id]?.name || 'Category'}
                            </span>
                          )}
                        </div>
                        <div className="admin-product-list__actions">
                          <button
                            type="button"
                            className="admin-link"
                            onClick={() => setEditor({ type: 'product', product: p })}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-link admin-link--danger"
                            onClick={() => deleteProduct(p.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>
        )}

        {/* ——— Section 4: Categories Management ——— */}
        {!loading && section === 'categories' && (
          <section className="admin-section">
            {editor?.type === 'category' ? (
              <CategoryEditor
                categories={categories}
                initial={editor.category}
                onSave={saveCategory}
                onClose={() => setEditor(null)}
              />
            ) : (
              <>
                <div className="admin-section__top-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                    onClick={() => setEditor({ type: 'category', category: null })}
                  >
                    <Plus size={16} /> New Category
                  </button>
                </div>

                <div className="admin-filter-bar">
                  <div className="admin-filter-search">
                    <Search size={16} className="admin-filter-icon" />
                    <input
                      type="text"
                      placeholder="Search categories…"
                      value={categoriesSearch}
                      onChange={(e) => setCategoriesSearch(e.target.value)}
                    />
                    {categoriesSearch && (
                      <button
                        type="button"
                        className="admin-filter-clear"
                        onClick={() => setCategoriesSearch('')}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {filteredCategories.length === 0 ? (
                  <div className="admin__empty-box">
                    <p className="admin__muted">No categories match your search.</p>
                  </div>
                ) : (
                  <ul className="admin-product-list">
                    {filteredCategories.map((c) => (
                      <li key={c.id} className="admin-product-list__item">
                        <div className="admin-product-list__body">
                          <strong>{c.name}</strong>
                          <span className="admin__muted">
                            slug: /{c.slug}
                            {c.parent_id
                              ? ` · Parent: ${categoriesById[c.parent_id]?.name || c.parent_id}`
                              : ' · Top-level category'}
                          </span>
                          {!c.active && (
                            <span className="admin-tag admin-tag--off">Inactive</span>
                          )}
                        </div>
                        <div className="admin-product-list__actions">
                          <button
                            type="button"
                            className="admin-link"
                            onClick={() => setEditor({ type: 'category', category: c })}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-link admin-link--danger"
                            onClick={() => deleteCategory(c.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>
        )}

        {/* ——— Section 5: Reviews Management ——— */}
        {!loading && section === 'reviews' && (
          <section className="admin-section">
            {editor?.type === 'review' ? (
              <ReviewEditor
                initial={editor.review}
                products={products}
                onSave={saveReview}
                onClose={() => setEditor(null)}
              />
            ) : (
              <>
                <div className="admin-section__top-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                    onClick={() => setEditor({ type: 'review', review: null })}
                  >
                    <Plus size={16} /> New Influencer Review
                  </button>
                </div>
                <ReviewsManager
                  reviews={reviews}
                  onStatus={updateReviewStatus}
                  onFeature={featureReview}
                  onEdit={(review) => setEditor({ type: 'review', review })}
                  onDelete={deleteReview}
                />
              </>
            )}
          </section>
        )}

        {/* ——— Section 6: Vouchers Management ——— */}
        {!loading && section === 'vouchers' && (
          <section className="admin-section">
            {editor?.type === 'voucher' ? (
              <VoucherEditor
                key={editor.voucher?.id || 'new'}
                initial={editor.voucher}
                onSave={saveVoucher}
                onClose={() => setEditor(null)}
              />
            ) : (
              <>
                <div className="admin-section__top-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                    onClick={() => setEditor({ type: 'voucher', voucher: null })}
                  >
                    <Plus size={16} /> New Voucher
                  </button>
                </div>
                <VouchersManager
                  vouchers={vouchers}
                  onToggle={toggleVoucher}
                  onEdit={(voucher) => setEditor({ type: 'voucher', voucher })}
                  onDelete={deleteVoucher}
                />
              </>
            )}
          </section>
        )}
      </div>

      <OrderToasts
        notifications={notifications}
        onClose={(id) => dismissNotification(id)}
        onOpen={() => {
          setSection('orders')
          setEditor(null)
          setNotifOpen(false)
        }}
      />
    </div>
  )
}

function OrderToasts({ notifications, onClose, onOpen }) {
  const visible = notifications.slice(0, 3)
  if (visible.length === 0) return null
  return (
    <div className="admin-toasts" role="status" aria-live="polite">
      {visible.map((n, i) => (
        <OrderToast key={n.id} n={n} i={i} onClose={onClose} onOpen={onOpen} />
      ))}
    </div>
  )
}

function OrderToast({ n, i, onClose, onOpen }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(n.id), 9000)
    return () => clearTimeout(t)
  }, [n.id, onClose])

  return (
    <div className="admin-toast" style={{ '--i': i }}>
      <span className="admin-toast__icon">
        <ShoppingBag size={16} />
      </span>
      <button
        type="button"
        className="admin-toast__body"
        onClick={() => {
          onClose(n.id)
          onOpen()
        }}
      >
        <strong>New order · {formatMoney(n.total, n.currency)}</strong>
        <span>
          {n.name} — {n.city}
        </span>
      </button>
      <button
        type="button"
        className="admin-toast__close"
        aria-label="Dismiss notification"
        onClick={() => onClose(n.id)}
      >
        <X size={14} />
      </button>
    </div>
  )
}