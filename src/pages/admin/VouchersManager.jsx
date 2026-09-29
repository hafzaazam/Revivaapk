import { useMemo, useState } from 'react'
import { Pencil, Trash2, BadgePercent, Banknote, Search, Filter } from 'lucide-react'
import { formatMoney } from '../../data/product'
import useDebounce from '../../hooks/useDebounce'
import './AdminVouchers.css'

function fmtDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function voucherSummary(v) {
  if (v.kind === 'percent') return `${v.value}% off`
  return formatMoney(v.value, 'PKR') + ' off'
}

export default function VouchersManager({ vouchers, onToggle, onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 200)
  const [statusFilter, setStatusFilter] = useState('')
  const [kindFilter, setKindFilter] = useState('')

  const filtered = useMemo(() => {
    return vouchers.filter((v) => {
      const active = v.is_active !== false
      if (statusFilter === 'active' && !active) return false
      if (statusFilter === 'inactive' && active) return false
      if (kindFilter && v.kind !== kindFilter) return false
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim()
        const matchCode = v.code?.toLowerCase().includes(q)
        const matchDesc = v.description?.toLowerCase().includes(q)
        if (!matchCode && !matchDesc) return false
      }
      return true
    })
  }, [vouchers, debouncedSearch, statusFilter, kindFilter])

  return (
    <div className="admin-vouchers-wrap">
      {/* ——— Search & Filter Bar ——— */}
      <div className="admin-filter-bar">
        <div className="admin-filter-search">
          <Search size={16} className="admin-filter-icon" />
          <input
            type="text"
            placeholder="Search vouchers by code or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="admin-filter-clear"
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="admin-filter-selects">
          <label className="admin-filter-label">
            <Filter size={14} /> Status:
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Vouchers ({vouchers.length})</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </label>

          <label className="admin-filter-label">
            Discount Type:
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed Amount (PKR)</option>
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="admin__empty-box">
          <p className="admin__muted">
            {search || statusFilter || kindFilter
              ? 'No vouchers match the selected filters.'
              : 'No vouchers yet.'}
          </p>
        </div>
      ) : (
        <div className="adminVouchers">
          {filtered.map((v) => {
            const used = v.usage?.[0]?.count ?? 0
            const active = v.is_active !== false
            return (
              <article className={`adminVouchers__item ${active ? '' : 'is-off'}`} key={v.id}>
                <div className="adminVouchers__main">
                  <div className="adminVouchers__head">
                    <span className="adminVouchers__code">
                      {v.code}
                      {!active && <span className="admin-tag admin-tag--off">Inactive</span>}
                    </span>
                    <span className="adminVouchers__kind">
                      {v.kind === 'percent' ? (
                        <>
                          <BadgePercent size={14} /> {v.value}%
                        </>
                      ) : (
                        <>
                          <Banknote size={14} /> {formatMoney(v.value, 'PKR')}
                        </>
                      )}
                    </span>
                  </div>

                  {v.description && <p className="adminVouchers__desc">{v.description}</p>}

                  <div className="adminVouchers__meta">
                    <span>{voucherSummary(v)}</span>
                    {v.min_subtotal > 0 && <span>· Min order {formatMoney(v.min_subtotal)}</span>}
                    {v.max_discount != null && <span>· Cap {formatMoney(v.max_discount)}</span>}
                    <span>
                      · Used {used}
                      {v.max_uses != null ? ` / ${v.max_uses}` : ''}
                    </span>
                    <span>· {v.max_per_user} per buyer</span>
                    {v.expires_at && <span>· Ends {fmtDate(v.expires_at)}</span>}
                  </div>
                </div>

                <div className="adminVouchers__actions">
                  <button type="button" className="admin-review-btn" onClick={() => onToggle(v)}>
                    {active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" className="admin-review-btn" onClick={() => onEdit(v)}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    className="admin-review-btn admin-review-btn--danger"
                    onClick={() => onDelete(v)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}