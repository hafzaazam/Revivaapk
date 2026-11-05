import { useState } from 'react'

function toLocalInput(value) {
  if (!value) return ''
  const d = new Date(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

function buildForm(initial) {
  if (!initial) {
    return {
      id: '',
      code: '',
      kind: 'percent',
      value: '',
      min_subtotal: 0,
      max_discount: '',
      max_uses: '',
      max_per_user: 1,
      starts_at: '',
      expires_at: '',
      is_active: true,
      description: '',
    }
  }
  return {
    id: initial.id || '',
    code: initial.code || '',
    kind: initial.kind || 'percent',
    value: initial.value ?? '',
    min_subtotal: initial.min_subtotal ?? 0,
    max_discount: initial.max_discount ?? '',
    max_uses: initial.max_uses ?? '',
    max_per_user: initial.max_per_user ?? 1,
    starts_at: toLocalInput(initial.starts_at),
    expires_at: toLocalInput(initial.expires_at),
    is_active: initial.is_active == null ? true : Boolean(initial.is_active),
    description: initial.description || '',
  }
}

export default function VoucherEditor({ initial, onSave, onClose }) {
  const [form, setForm] = useState(() => buildForm(initial))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((p) => ({ ...p, [key]: val }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const code = form.code.trim().toUpperCase()
    const value = Number(form.value)
    if (!code) return setError('Voucher code is required')
    if (!value || value <= 0) return setError('Value must be greater than 0')
    if (form.kind === 'percent' && (value > 100 || value < 1)) {
      return setError('Percentage must be between 1 and 100')
    }
    setBusy(true)
    await onSave({
      ...form,
      code,
      value,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    })
    setBusy(false)
  }

  return (
    <form className="admin-editor" onSubmit={onSubmit}>
      <div className="admin-editor__header">
        <h3>{initial ? `Edit voucher · ${initial.code}` : 'New voucher'}</h3>
        <button type="button" className="admin-link" onClick={onClose}>
          Close
        </button>
      </div>

      {error && (
        <p className="admin-banner admin-banner--error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-editor__grid admin-editor__grid--2">
        <label>
          <span>Code *</span>
          <input
            value={form.code}
            onChange={set('code')}
            placeholder="e.g. FRIEND10"
            maxLength={40}
            required
            style={{ textTransform: 'uppercase' }}
          />
        </label>
        <label>
          <span>Type</span>
          <select value={form.kind} onChange={set('kind')}>
            <option value="percent">Percentage off</option>
            <option value="flat">Flat amount (PKR)</option>
          </select>
        </label>
      </div>

      <div className="admin-editor__grid admin-editor__grid--3">
        <label>
          <span>{form.kind === 'percent' ? 'Percent (1–100) *' : 'Amount (PKR) *'}</span>
          <input type="number" min="1" value={form.value} onChange={set('value')} required />
        </label>
        <label>
          <span>Min order subtotal (PKR)</span>
          <input type="number" min="0" value={form.min_subtotal} onChange={set('min_subtotal')} />
        </label>
        <label>
          <span>Max discount cap (PKR, optional)</span>
          <input type="number" min="1" value={form.max_discount} onChange={set('max_discount')} />
        </label>
      </div>

      <div className="admin-editor__grid admin-editor__grid--3">
        <label>
          <span>Max total uses (optional)</span>
          <input type="number" min="1" value={form.max_uses} onChange={set('max_uses')} />
        </label>
        <label>
          <span>Uses per buyer</span>
          <input type="number" min="1" value={form.max_per_user} onChange={set('max_per_user')} />
        </label>
        <label>
          <span>Starts</span>
          <input type="datetime-local" value={form.starts_at} onChange={set('starts_at')} />
        </label>
      </div>

      <div className="admin-editor__grid admin-editor__grid--3">
        <label>
          <span>Expires</span>
          <input type="datetime-local" value={form.expires_at} onChange={set('expires_at')} />
        </label>
        <label className="admin-editor__span">
          <span>Description</span>
          <input
            value={form.description}
            onChange={set('description')}
            placeholder="Shows to admin + used to explain rules"
          />
        </label>
      </div>

      <label className="admin-editor__inline">
        <input type="checkbox" checked={form.is_active} onChange={set('is_active')} />
        <span>Active</span>
      </label>

      <p className="admin__muted adminVouchers__rule">
        Per-buyer rule: the code is blocked once <strong>email, phone, or address</strong> from
        this checkout matches that of earlier orders which used the same code, up to{' '}
        <strong>uses per buyer</strong>.
      </p>

      <button type="submit" className="admin-btn admin-btn--full" disabled={busy}>
        {busy ? 'Saving…' : initial ? 'Save voucher' : 'Create voucher'}
      </button>
    </form>
  )
}