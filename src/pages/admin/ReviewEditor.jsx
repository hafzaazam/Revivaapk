import { useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { StarPicker } from '../../components/Stars'
import ReviewMediaPicker from '../../components/ReviewMediaPicker'
import './AdminReviews.css'

export default function ReviewEditor({ initial, products, onSave, onClose }) {
  const { user } = useAuth()
  const [form, setForm] = useState(() => ({
    productId: initial?.product_id || '',
    authorName: initial?.author_name || '',
    handle: initial?.handle || '',
    rating: initial?.rating || 5,
    title: initial?.title || '',
    body: initial?.body || '',
    reviewerType: initial?.reviewer_type || 'influencer',
    featured: Boolean(initial?.featured),
    status: initial?.status || 'approved',
    verifiedPurchase: Boolean(initial?.verified_purchase),
  }))
  const [media, setMedia] = useState(
    (initial?.media || []).map((m) => ({
      id: m.id,
      kind: m.kind,
      url: m.url,
      path: m.path || null,
      posterUrl: m.poster_url || null,
      position: m.position ?? 0,
    })),
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isNew = !initial?.id

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setBool = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.productId) {
      setError('Choose a product first.')
      return
    }
    if (!form.authorName.trim()) {
      setError('Author name is required.')
      return
    }
    if (!form.body.trim()) {
      setError('Review text is required.')
      return
    }

    const base = {
      product_id: form.productId,
      productId: form.productId,
      author_name: form.authorName.trim(),
      authorName: form.authorName.trim(),
      handle: form.handle.trim(),
      rating: form.rating,
      title: form.title.trim(),
      body: form.body.trim(),
      reviewer_type: form.reviewerType,
      reviewerType: form.reviewerType,
      featured: form.featured,
      status: form.status,
      verified_purchase: form.verifiedPurchase,
      verifiedPurchase: form.verifiedPurchase,
    }

    setSaving(true)
    await onSave({
      review: initial || base,
      media,
      patch: isNew ? null : base,
    })
    setSaving(false)
  }

  return (
    <form className="adminEditor" onSubmit={submit}>
      <div className="adminEditor__head">
        <h2>{isNew ? 'New influencer review' : `Edit review · ${initial.author_name}`}</h2>
        <button type="button" className="admin-link" onClick={onClose}>
          Back
        </button>
      </div>

      <div className="adminEditor__grid">
        <label className="adminEditor__field">
          <span>Product</span>
          <select value={form.productId} onChange={set('productId')} required>
            <option value="">Select a product…</option>
            {(products || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </label>

        <label className="adminEditor__field">
          <span>Review type</span>
          <select value={form.reviewerType} onChange={set('reviewerType')}>
            <option value="influencer">Influencer</option>
            <option value="customer">Customer</option>
          </select>
        </label>

        <label className="adminEditor__field">
          <span>Author name</span>
          <input
            type="text"
            value={form.authorName}
            onChange={set('authorName')}
            placeholder="e.g. Hareem · @hareemskincare"
            required
          />
        </label>

        <label className="adminEditor__field">
          <span>Social handle (optional)</span>
          <input
            type="text"
            value={form.handle}
            onChange={set('handle')}
            placeholder="@handle"
          />
        </label>

        <div className="adminEditor__field">
          <span>Rating</span>
          <StarPicker value={form.rating} onChange={(n) => setForm((f) => ({ ...f, rating: n }))} />
        </div>

        <label className="adminEditor__field">
          <span>Title</span>
          <input type="text" value={form.title} onChange={set('title')} maxLength={80} />
        </label>
      </div>

      <label className="adminEditor__field">
        <span>Review text</span>
        <textarea value={form.body} onChange={set('body')} rows={4} maxLength={1000} required />
      </label>

      <div className="adminEditor__field">
        <span>Media — upload or paste a URL (video reels show in the home special section)</span>
        <ReviewMediaPicker value={media} onChange={setMedia} />
      </div>

      <div className="adminEditor__checks">
        <label className="adminEditor__check">
          <input type="checkbox" checked={form.featured} onChange={setBool('featured')} />
          Featured (shown prominently)
        </label>
        <label className="adminEditor__check">
          <input
            type="checkbox"
            checked={form.verifiedPurchase}
            onChange={setBool('verifiedPurchase')}
          />
          Verified purchase
        </label>
      </div>

      <label className="adminEditor__field">
        <span>Status</span>
        <select value={form.status} onChange={set('status')}>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </label>

      {error && (
        <p className="admin-banner admin-banner--error" role="alert">
          {error}
        </p>
      )}

      <div className="adminEditor__actions">
        <button
          type="button"
          className="admin-link"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </button>
        <button type="submit" className="admin-btn" disabled={saving}>
          {saving ? 'Saving…' : isNew ? 'Create review' : 'Save changes'}
        </button>
        {user && <span className="admin__muted adminEditor__hint">Created by {user.email}</span>}
      </div>
    </form>
  )
}