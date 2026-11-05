import { useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { StarPicker } from '../../components/Stars'
import ReviewMediaPicker from '../../components/ReviewMediaPicker'
import ReviewMediaItem from '../../components/ReviewMediaItem'
import {
  classifyMediaUrl,
  videoThumbUrl,
  isInstagramUrl,
  youtubeId,
} from '../../lib/reviews'
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

  // Detect existing video media from initial review
  const initialMedia = (initial?.media || []).map((m) => ({
    id: m.id,
    kind: m.kind || classifyMediaUrl(m.url) || 'image',
    url: m.url || '',
    path: m.path || null,
    posterUrl: m.poster_url || m.posterUrl || null,
    position: m.position ?? 0,
  }))

  const existingVideo = initialMedia.find(
    (m) => m.kind === 'video' || classifyMediaUrl(m.url) === 'video'
  )

  const [videoUrl, setVideoUrl] = useState(() => existingVideo?.url || '')
  const [posterUrl, setPosterUrl] = useState(
    () => existingVideo?.posterUrl || existingVideo?.poster_url || ''
  )
  const [media, setMedia] = useState(initialMedia)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isNew = !initial?.id

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setBool = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }))

  const handleVideoUrlChange = (val) => {
    setVideoUrl(val)
    const trimmed = val.trim()
    const autoThumb = trimmed ? videoThumbUrl(trimmed) : null
    if (autoThumb && !posterUrl) {
      setPosterUrl(autoThumb)
    }

    setMedia((prev) => {
      const nonVideos = prev.filter(
        (m) => m.kind !== 'video' && classifyMediaUrl(m.url) !== 'video'
      )
      if (!trimmed) return nonVideos

      const existingVid = prev.find(
        (m) => m.kind === 'video' || classifyMediaUrl(m.url) === 'video'
      )
      const vidItem = {
        id:
          existingVid?.id ||
          (typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `vid-${Date.now()}`),
        kind: 'video',
        url: trimmed,
        path: existingVid?.path || null,
        posterUrl: posterUrl.trim() || autoThumb || null,
        position: 0,
      }
      return [vidItem, ...nonVideos]
    })
  }

  const handlePosterUrlChange = (val) => {
    setPosterUrl(val)
    setMedia((prev) =>
      prev.map((m) =>
        m.kind === 'video' || classifyMediaUrl(m.url) === 'video'
          ? { ...m, posterUrl: val.trim() || null }
          : m
      )
    )
  }

  const handleMediaPickerChange = (nextMedia) => {
    setMedia(nextMedia)
    const vid = nextMedia.find(
      (m) => m.kind === 'video' || classifyMediaUrl(m.url) === 'video'
    )
    if (vid) {
      setVideoUrl(vid.url || '')
      setPosterUrl(vid.posterUrl || vid.poster_url || '')
    }
  }

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

    // Ensure finalMedia reflects current videoUrl and posterUrl
    let finalMedia = [...media]
    const trimmedVid = videoUrl.trim()
    if (trimmedVid) {
      const existingIdx = finalMedia.findIndex(
        (m) => m.kind === 'video' || classifyMediaUrl(m.url) === 'video'
      )
      const vidItem = {
        id:
          existingIdx >= 0
            ? finalMedia[existingIdx].id
            : (typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : `vid-${Date.now()}`),
        kind: 'video',
        url: trimmedVid,
        path: existingIdx >= 0 ? finalMedia[existingIdx].path : null,
        posterUrl: posterUrl.trim() || videoThumbUrl(trimmedVid) || null,
        position: 0,
      }
      if (existingIdx >= 0) {
        finalMedia[existingIdx] = vidItem
      } else {
        finalMedia.unshift(vidItem)
      }
    } else {
      finalMedia = finalMedia.filter(
        (m) => m.kind !== 'video' && classifyMediaUrl(m.url) !== 'video'
      )
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
      media: finalMedia,
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

        {/* First-Class Dedicated Video URL Field */}
        <label className="adminEditor__field adminEditor__field--full">
          <span className="adminEditor__label-with-badge">
            <span>Video / Reel URL (Instagram Reel, YouTube, Vimeo, or direct MP4)</span>
            {videoUrl.trim() && isInstagramUrl(videoUrl.trim()) && (
              <span className="admin-tag admin-tag--ig">Instagram Reel ✓</span>
            )}
            {videoUrl.trim() && youtubeId(videoUrl.trim()) && (
              <span className="admin-tag admin-tag--yt">YouTube Video ✓</span>
            )}
          </span>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => handleVideoUrlChange(e.target.value)}
            placeholder="e.g. https://www.instagram.com/reel/DE4xyz/ or https://youtu.be/... or .mp4 URL"
          />
          <span className="adminEditor__field-desc">
            This video will play directly in the homepage Creator Circle video reels and the product review gallery.
          </span>
        </label>

        {/* Video Cover / Poster URL Field */}
        <label className="adminEditor__field adminEditor__field--full">
          <span>Video Cover / Poster Image URL (optional)</span>
          <input
            type="url"
            value={posterUrl}
            onChange={(e) => handlePosterUrlChange(e.target.value)}
            placeholder="https://... cover image URL (auto-detected for YouTube and Instagram)"
          />
        </label>

        {/* Live Video Preview Card */}
        {videoUrl.trim() && (
          <div className="adminEditor__video-preview-card">
            <span className="adminEditor__preview-header">Live Video Preview:</span>
            <div className="adminEditor__preview-box">
              <ReviewMediaItem
                item={{
                  kind: 'video',
                  url: videoUrl.trim(),
                  posterUrl: posterUrl.trim() || videoThumbUrl(videoUrl.trim()),
                }}
              />
            </div>
          </div>
        )}
      </div>

      <label className="adminEditor__field">
        <span>Review text</span>
        <textarea value={form.body} onChange={set('body')} rows={4} maxLength={1000} required />
      </label>

      <div className="adminEditor__field">
        <span>Additional Media (Upload photos or additional clips)</span>
        <ReviewMediaPicker value={media} onChange={handleMediaPickerChange} />
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