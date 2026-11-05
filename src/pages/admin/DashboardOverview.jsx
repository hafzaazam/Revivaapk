import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Package,
  Receipt,
  Repeat,
  ShoppingBag,
  TrendingUp,
  UserPlus,
  Wallet,
} from 'lucide-react'
import { formatMoney } from '../../data/product'
import { fetchAdminDashboardStats, fetchAdminCustomerReturns } from '../../lib/adminStats'
import { CHART_PALETTE, compactNumber, dayRange } from './AdminChartUtil'
import { DonutChart, SeriesChart } from './AdminCharts'
import './DashboardOverview.css'

const PRESETS = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: 'month', label: 'This month' },
  { id: 'year', label: 'This year' },
  { id: 'all', label: 'All time' },
  { id: 'custom', label: 'Custom' },
]

function pad(n) {
  return String(n).padStart(2, '0')
}
function localISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function monthRange() {
  const now = new Date()
  return {
    from: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`,
    to: localISODate(now),
  }
}
function yearRange() {
  const now = new Date()
  return { from: `${now.getFullYear()}-01-01`, to: localISODate(now) }
}

const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function KpiCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="do-kpi">
      <span className="do-kpi__icon">{Icon && <Icon size={18} />}</span>
      <span className="do-kpi__label">{label}</span>
      <strong>{value}</strong>
      {hint && <span className="do-kpi__hint">{hint}</span>}
    </div>
  )
}

function BreakdownList({ title, rows = [], format, totalOf = 'value' }) {
  const max = Math.max(...rows.map((r) => r[totalOf] || 0), 1)
  if (rows.length === 0) {
    return (
      <div className="do-panel">
        <h3 className="do-panel__title">{title}</h3>
        <p className="do-panel__empty">No data in this range.</p>
      </div>
    )
  }
  return (
    <div className="do-panel">
      <h3 className="do-panel__title">{title}</h3>
      <ul className="do-breakdown">
        {rows.map((r, i) => (
          <li key={i}>
            <div className="do-breakdown__row">
              <span className="do-breakdown__name" title={r.name}>
                {r.name}
              </span>
              <span className="do-breakdown__value">{format(r.value)}</span>
            </div>
            <div className="do-breakdown__track">
              <div
                className="do-breakdown__bar"
                style={{ width: `${Math.max(2, (100 * (r[totalOf] || 0)) / max)}%` }}
              />
            </div>
            {r.meta != null && <span className="do-breakdown__meta">{r.meta}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function DashboardOverview({
  products = [],
  categories = [],
  vouchers = [],
  orders = [],
}) {
  const [preset, setPreset] = useState('30d')
  const [range, setRange] = useState(() => dayRange(30))
  const [granularity, setGranularity] = useState('day')
  const [productId, setProductId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [voucherId, setVoucherId] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')

  const [stats, setStats] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const cityOptions = useMemo(() => {
    const counts = new Map()
    orders.forEach((o) => {
      if (!o.customer_city) return
      counts.set(o.customer_city, (counts.get(o.customer_city) || 0) + 1)
    })
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([name, count]) => ({ name, count }))
  }, [orders])

  const provinceOptions = useMemo(() => {
    const counts = new Map()
    orders.forEach((o) => {
      if (!o.customer_province) return
      counts.set(o.customer_province, (counts.get(o.customer_province) || 0) + 1)
    })
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([name, count]) => ({ name, count }))
  }, [orders])

  const fetchAll = useCallback(async () => {
    const [statsRes, custRes] = await Promise.all([
      fetchAdminDashboardStats({
        dateFrom: range.from || null,
        dateTo: range.to || null,
        granularity,
        productId,
        categoryId,
        voucherId,
        city,
        province,
      }),
      fetchAdminCustomerReturns({ dateFrom: range.from || null, dateTo: range.to || null }),
    ])
    if (statsRes.error) {
      setError(statsRes.error.message)
      setStats(null)
    } else {
      setStats(statsRes.data)
      setError('')
    }
    setCustomers(custRes.error ? [] : custRes.data || [])
    setLoading(false)
  }, [range.from, range.to, granularity, productId, categoryId, voucherId, city, province])

  useEffect(() => {
    let alive = true
    void Promise.resolve().then(() => {
      if (alive) return fetchAll()
      return undefined
    })
    return () => {
      alive = false
    }
  }, [fetchAll, reloadKey])

  const applyPreset = (id) => {
    setPreset(id)
    if (id === 'custom') return
    setLoading(true)
    if (id === '7d' || id === '30d') {
      setRange(dayRange(id === '7d' ? 7 : 30))
      if (granularity === 'month') setGranularity('day')
    } else if (id === 'month') {
      setRange(monthRange())
      if (granularity === 'month') setGranularity('week')
    } else if (id === 'year') {
      setRange(yearRange())
      setGranularity('month')
    } else {
      setRange({ from: null, to: null })
    }
  }

  const resetAll = () => {
    setProductId('')
    setCategoryId('')
    setVoucherId('')
    setCity('')
    setProvince('')
  }

  const anyFilter =
    productId || categoryId || voucherId || city || province

  const summary = stats?.summary
  const series = stats?.series || []

  const categoriesShare = useMemo(() => {
    const rows = stats?.byCategory || []
    const parts = rows.map((r, i) => ({
      label: r.name,
      value: Number(r.revenue),
      color: CHART_PALETTE[i % CHART_PALETTE.length],
    }))
    return parts.slice(0, 6)
  }, [stats])

  const byProductRows = useMemo(
    () => (stats?.byProduct || []).map((r) => ({ name: r.name, value: r.revenue, orders: r.orders })),
    [stats],
  )
  const byCityRows = useMemo(
    () =>
      (stats?.byCity || []).map((r) => ({
        name: r.name,
        value: r.revenue,
        meta: `${r.orders} order${r.orders === 1 ? '' : 's'}`,
      })),
    [stats],
  )
  const byProvinceRows = useMemo(
    () =>
      (stats?.byProvince || []).map((r) => ({
        name: r.name,
        value: r.revenue,
        meta: `${r.orders} order${r.orders === 1 ? '' : 's'}`,
      })),
    [stats],
  )
  const byVoucherRows = useMemo(
    () =>
      (stats?.byVoucher || []).map((r) => ({
        name: r.code,
        value: r.discount,
        meta: `${r.orders} order${r.orders === 1 ? '' : 's'}`,
      })),
    [stats],
  )

  return (
    <section className="admin-section do">
      <div className="do-toolbar">
        <div className="do-presets" role="group" aria-label="Date range">
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p.id}
              className={preset === p.id ? 'is-active' : ''}
              onClick={() => applyPreset(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="do-custom-range">
          <label>
            <span className="visually-hidden">From</span>
            <input
              type="date"
              value={range.from || ''}
              onChange={(e) => {
                setPreset('custom')
                setLoading(true)
                setRange((r) => ({ ...r, from: e.target.value || null }))
              }}
            />
          </label>
          <span>→</span>
          <label>
            <span className="visually-hidden">To</span>
            <input
              type="date"
              value={range.to || ''}
              onChange={(e) => {
                setPreset('custom')
                setLoading(true)
                setRange((r) => ({ ...r, to: e.target.value || null }))
              }}
            />
          </label>
        </div>

        <label className="do-select">
          <span className="visually-hidden">Granularity</span>
          <select
            value={granularity}
            onChange={(e) => {
              setLoading(true)
              setGranularity(e.target.value)
            }}
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </label>
        <button type="button" className="do-refresh" onClick={() => setReloadKey((k) => k + 1)}>
          Refresh
        </button>
      </div>

      <div className="do-filters">
        <label className="do-select">
          <span className="do-select__label">Product</span>
          <select
            value={productId}
            onChange={(e) => {
              setLoading(true)
              setProductId(e.target.value)
            }}
          >
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="do-select">
          <span className="do-select__label">Category</span>
          <select
            value={categoryId}
            onChange={(e) => {
              setLoading(true)
              setCategoryId(e.target.value)
            }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="do-select">
          <span className="do-select__label">Voucher</span>
          <select
            value={voucherId}
            onChange={(e) => {
              setLoading(true)
              setVoucherId(e.target.value)
            }}
          >
            <option value="">All vouchers</option>
            {vouchers.map((v) => (
              <option key={v.id} value={v.id}>
                {v.code}
              </option>
            ))}
          </select>
        </label>
        <label className="do-select">
          <span className="do-select__label">City</span>
          <select
            value={city}
            onChange={(e) => {
              setLoading(true)
              setCity(e.target.value)
            }}
          >
            <option value="">All cities</option>
            {cityOptions.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </label>
        <label className="do-select">
          <span className="do-select__label">Province</span>
          <select
            value={province}
            onChange={(e) => {
              setLoading(true)
              setProvince(e.target.value)
            }}
          >
            <option value="">All provinces</option>
            {provinceOptions.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name} ({p.count})
              </option>
            ))}
          </select>
        </label>
        {anyFilter && (
          <button type="button" className="do-reset" onClick={resetAll}>
            Reset filters
          </button>
        )}
      </div>

      {error && (
        <p className="admin-banner admin-banner--error" role="alert">
          {error}
        </p>
      )}
      {loading && <p className="admin__muted">Crunching the numbers…</p>}
      {!loading && !summary && !error && (
        <p className="admin__muted">No sales yet — stats open up with the first order.</p>
      )}

      {!loading && summary && (
        <>
          <div className="do-kpis">
            <KpiCard
              icon={Wallet}
              label="Revenue"
              value={formatMoney(summary.revenue)}
              hint={`${formatMoney(summary.discount)} in discounts`}
            />
            <KpiCard
              icon={ShoppingBag}
              label="Orders"
              value={summary.orders}
              hint={`${compactNumber(summary.avgOrderValue)} avg value`}
            />
            <KpiCard
              icon={Repeat}
              label="Returning"
              value={summary.returningCustomers}
              hint={`${summary.returnRate != null ? summary.returnRate : 0}% of buyers came back`}
            />
            <KpiCard
              icon={UserPlus}
              label="New customers"
              value={summary.newCustomers}
              hint={`${summary.uniqueCustomers} buyers in range`}
            />
            <KpiCard
              icon={Receipt}
              label="Voucher orders"
              value={summary.voucherOrders}
              hint={`${formatMoney(summary.voucherDiscount)} granted`}
            />
            <KpiCard
              icon={TrendingUp}
              label="Avg order value"
              value={formatMoney(summary.avgOrderValue)}
              hint={`${formatMoney(summary.subtotal)} gross`}
            />
          </div>

          <div className="do-charts">
            <div className="do-panel do-charts__wide">
              <h3 className="do-panel__title">Revenue trend incl. vouchers</h3>
              <SeriesChart
                data={series}
                metric="revenue"
                mode="area"
                color="#878038"
                height={280}
                format={(n) => formatMoney(n)}
              />
            </div>
            <div className="do-panel">
              <h3 className="do-panel__title">Orders {granularity}</h3>
              <SeriesChart
                data={series}
                metric="orders"
                mode="bar"
                color="#f2970c"
                height={280}
                format={(n) => `${n} orders`}
              />
            </div>
          </div>

          <div className="do-grid2">
            <div className="do-panel do-returns">
              <h3 className="do-panel__title">Returning customers</h3>
              {customers.filter((c) => c.returning).length === 0 ? (
                <p className="do-panel__empty">
                  No repeat buyers yet. Come back once a customer places their second order.
                </p>
              ) : (
                <ul className="do-returns__list">
                  {customers
                    .filter((c) => c.returning)
                    .slice(0, 8)
                    .map((c) => (
                      <li key={c.email}>
                        <div className="do-returns__who">
                          <strong>{c.name || c.email}</strong>
                          <span>
                            {c.email} · {c.city}
                          </span>
                        </div>
                        <div className="do-returns__nums">
                          <span>{c.orders} orders</span>
                          <strong>{formatMoney(c.revenue)}</strong>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div className="do-panel do-category">
              <h3 className="do-panel__title">Revenue by category</h3>
              {categoriesShare.length ? (
                <DonutChart parts={categoriesShare} size={200} format={formatMoney} />
              ) : (
                <p className="do-panel__empty">No category data in this range.</p>
              )}
            </div>
          </div>

          <div className="do-breakdowns">
            <BreakdownList
              title="Top products"
              rows={byProductRows}
              format={formatMoney}
              totalOf="value"
            />
            <BreakdownList
              title="Revenue by city"
              rows={byCityRows}
              format={formatMoney}
              totalOf="value"
            />
            <BreakdownList
              title="Revenue by province"
              rows={byProvinceRows}
              format={formatMoney}
              totalOf="value"
            />
            <BreakdownList
              title="Discount by voucher"
              rows={byVoucherRows}
              format={formatMoney}
              totalOf="value"
            />
          </div>

          <div className="do-panel do-recent">
            <h3 className="do-panel__title">Latest orders</h3>
            {(stats.recentOrders || []).length === 0 ? (
              <p className="do-panel__empty">No orders in this range.</p>
            ) : (
              <div className="do-recent__table">
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>City</th>
                      <th>Items</th>
                      <th className="do-num">Discount</th>
                      <th className="do-num">Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.recentOrders || []).map((o) => (
                      <tr key={o.id}>
                        <td data-label="Order">
                          #{String(o.id).slice(0, 8)}
                          <span className="do-muted">{new Date(o.created_at).toLocaleDateString()}</span>
                        </td>
                        <td data-label="Customer">{o.customer_name}</td>
                        <td data-label="City">{o.customer_city}</td>
                        <td data-label="Items">
                          {o.voucher_code && (
                            <span className="admin-tag admin-tag--feat">{o.voucher_code}</span>
                          )}
                        </td>
                        <td className="do-num" data-label="Discount">
                          {o.discount > 0 ? formatMoney(o.discount) : '—'}
                        </td>
                        <td className="do-num" data-label="Total">
                          <strong>{formatMoney(o.total)}</strong>
                        </td>
                        <td data-label="Status">
                          <span className={`do-status do-status--${o.status || 'pending'}`}>
                            {STATUS_LABEL[o.status] || o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!anyFilter && orderCountLow(customers) && (
            <p className="do-tip">
              <Package size={14} /> Return tracking matches repeat customers by email, phone or
              address across the whole order history, even before any filter is applied.
            </p>
          )}
        </>
      )}
    </section>
  )
}

function orderCountLow(customers) {
  return customers.length > 0 && customers.length <= 3
}