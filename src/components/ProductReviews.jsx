import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PenLine, ShieldCheck, CheckCircle2, Inbox } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { fetchProductReviews, submitReview } from '../lib/reviews'
import Stars, { StarPicker } from './Stars'
import ReviewMediaItem from './ReviewMediaItem'
import ReviewMediaPicker from './ReviewMediaPicker'
import './ProductReviews.css'

const EMPTY_SUMMARY = {
  reviews: [],
  average: 0,
  count: 0,
  breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
}

function fmtDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function ProductReviews({ product }) {
  const { user } = useAuth()
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ rating: 5, authorName: '', title: '', body: '', media: [] })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let alive = true
    fetchProductReviews(product.id).then(({ data, error: err }) => {
      if (!alive) return
      if (!err && data) setSummary(data)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [product.id])

  const resetForm = () => {
    setForm({ rating: 5, authorName: '', title: '', body: '', media: [] })
    setError('')
    setSuccess(false)
    setShowForm(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.title.trim().length < 3) {
      setError('Please add a short title (at least 3 characters).')
      return
    }
    if (form.body.trim().length < 10) {
      setError('Please write a review of at least 10 characters.')
      return
    }
    setSubmitting(true)
    const { error: err } = await submitReview({
      productId: product.id,
      authorName: form.authorName ? form.authorName.trim() : undefined,
      rating: form.rating,
      title: form.title.trim(),
      body: form.body.trim(),
      media: form.media,
    })
    setSubmitting(false)
    if (err) {
      setError(err.message)
      return
    }
    setSuccess(true)
    setShowForm(false)
    fetchProductReviews(product.id).then(({ data, error: ferr }) => {
      if (!ferr && data) setSummary(data)
    })
  }

  const total = summary.count
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0)

  return (
    <section className="reviews" id="reviews">
      <div className="reviews__inner">
        <header className="reviews__head">
          <p className="section-label">Reviews</p>
          <h2 className="section-title">What people are saying</h2>
        </header>

        <div className="reviews__layout">
          <aside className="reviews__summary">
            <div className="reviews__score">
              <span className="reviews__avg">{total ? summary.average.toFixed(1) : '—'}</span>
              <div className="reviews__score-block">
                <Stars value={summary.average} size={16} />
                <p className="reviews__meta">{total} review{total === 1 ? '' : 's'}</p>
              </div>
            </div>

            <div className="reviews__bars">
              {[5, 4, 3, 2, 1].map((star) => (
                <div className="reviews__bar" key={star}>
                  <span className="reviews__bar-label">{star}</span>
                  <div className="reviews__bar-track">
                    <div
                      className="reviews__bar-fill"
                      style={{ width: `${pct(summary.breakdown[star] || 0)}%` }}
                    />
                  </div>
                  <span className="reviews__bar-count">
                    {summary.breakdown[star] || 0}
                  </span>
                </div>
              ))}
            </div>

            <div className="reviews__write">
              {user ? (
                showForm ? null : (
                  <button type="button" className="reviews__cta" onClick={() => setShowForm(true)}>
                    <PenLine size={16} /> Write a review
                  </button>
                )
              ) : (
                <p className="reviews__signin">
                  <Link to="/auth">Sign in</Link> to leave a review with photos or videos.
                </p>
              )}
            </div>
          </aside>

          <div className="reviews__panel">
            {showForm && user && (
              <form className="reviews__form" onSubmit={submit}>
                <div className="reviews__form-head">
                  <h3>Share your experience</h3>
                  <button
                    type="button"
                    className="reviews__close"
                    aria-label="Close review form"
                    onClick={resetForm}
                  >
                    Close
                  </button>
                </div>

                <div className="reviews__field">
                  <label className="reviews__label">Your rating</label>
                  <StarPicker value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} />
                </div>

                <div className="reviews__field">
                  <label className="reviews__label" htmlFor="review-author">
                    Your Name <span className="reviews__opt">(optional)</span>
                  </label>
                  <input
                    id="review-author"
                    type="text"
                    maxLength={60}
                    placeholder={user?.user_metadata?.full_name || 'e.g. Ayesha K.'}
                    value={form.authorName}
                    onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  />
                </div>

                <div className="reviews__field">
                  <label className="reviews__label" htmlFor="review-title">
                    Title
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    maxLength={80}
                    placeholder="Sums it up in a line"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="reviews__field">
                  <label className="reviews__label" htmlFor="review-body">
                    Review
                  </label>
                  <textarea
                    id="review-body"
                    rows={4}
                    maxLength={1000}
                    placeholder="How did it work for you?"
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                  />
                </div>

                <div className="reviews__field">
                  <label className="reviews__label">Add media</label>
                  <ReviewMediaPicker value={form.media} onChange={(m) => setForm({ ...form, media: m })} />
                </div>

                {error && <p className="reviews__error">{error}</p>}

                <button type="submit" className="reviews__cta" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit review'}
                </button>
                <p className="reviews__fineprint">
                  Reviews appear after moderation. Keep it kind.
                </p>
              </form>
            )}

            {success && (
              <div className="reviews__success">
                <CheckCircle2 size={22} />
                <p>
                  <strong>Thank you!</strong> Your review is awaiting approval.
                </p>
                <button type="button" className="reviews__link" onClick={resetForm}>
                  Write another
                </button>
              </div>
            )}

            {loading ? (
              <div className="reviews__loading">Loading reviews…</div>
            ) : summary.reviews.length === 0 ? (
              !showForm && (
                <div className="reviews__empty">
                  <Inbox size={22} />
                  <p>No reviews yet. Be the first to tell us how it went.</p>
                </div>
              )
            ) : (
              <ul className="reviews__list">
                {summary.reviews.map((review) => (
                  <li className="reviews__item" key={review.id}>
                    <div className="reviews__item-head">
                      <div className="reviews__item-title">
                        <Stars value={review.rating} size={13} />
                        <h3>{review.title}</h3>
                      </div>
                      <div className="reviews__item-meta">
                        <span className="reviews__author">{review.authorName}</span>
                        {review.verifiedPurchase && (
                          <span className="reviews__verified">
                            <ShieldCheck size={13} /> Verified purchase
                          </span>
                        )}
                        <span className="reviews__date">{fmtDate(review.createdAt)}</span>
                      </div>
                    </div>
                    <p className="reviews__body">{review.body}</p>
                    {review.media.length > 0 && (
                      <div className="reviews__media">
                        {review.media.map((m) => (
                          <ReviewMediaItem item={m} key={`${review.id}-${m.id || m.url}`} />
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}