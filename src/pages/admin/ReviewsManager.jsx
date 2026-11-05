import { useMemo, useState } from 'react'
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Video,
  Search,
  Filter,
} from 'lucide-react'
import Stars from '../../components/Stars'
import useDebounce from '../../hooks/useDebounce'
import { classifyMediaUrl } from '../../lib/reviews'
import './AdminReviews.css'

function fmtDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

const STATUS_LABEL = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

export default function ReviewsManager({ reviews, onStatus, onFeature, onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 200)
  const [statusFilter, setStatusFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false
      if (ratingFilter && Number(r.rating) !== Number(ratingFilter)) return false
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim()
        const matchName = r.author_name?.toLowerCase().includes(q)
        const matchBody = r.body?.toLowerCase().includes(q)
        const matchTitle = r.title?.toLowerCase().includes(q)
        const matchProduct = (r.product?.name || r.product_id || '').toLowerCase().includes(q)
        if (!matchName && !matchBody && !matchTitle && !matchProduct) return false
      }
      return true
    })
  }, [reviews, debouncedSearch, statusFilter, ratingFilter])

  return (
    <div className="admin-reviews-wrap">
      {/* ——— Search & Filter Bar ——— */}
      <div className="admin-filter-bar">
        <div className="admin-filter-search">
          <Search size={16} className="admin-filter-icon" />
          <input
            type="text"
            placeholder="Search reviews by customer, content, product…"
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
              <option value="">All Statuses ({reviews.length})</option>
              <option value="pending">Pending ({reviews.filter((r) => r.status === 'pending').length})</option>
              <option value="approved">Approved ({reviews.filter((r) => r.status === 'approved').length})</option>
              <option value="rejected">Rejected ({reviews.filter((r) => r.status === 'rejected').length})</option>
            </select>
          </label>

          <label className="admin-filter-label">
            Rating:
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars ★★★★★</option>
              <option value="4">4 Stars ★★★★☆</option>
              <option value="3">3 Stars ★★★☆☆</option>
              <option value="2">2 Stars ★★☆☆☆</option>
              <option value="1">1 Star ★☆☆☆☆</option>
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="admin__empty-box">
          <p className="admin__muted">
            {search || statusFilter || ratingFilter
              ? 'No reviews match the selected filters.'
              : 'No reviews yet.'}
          </p>
        </div>
      ) : (
        <div className="adminReviews">
          {filtered.map((review) => {
            const mediaCount = (review.media || []).length
            const videoMedia = (review.media || []).find(
              (m) => m.kind === 'video' || classifyMediaUrl(m.url) === 'video'
            )
            const videoCount = (review.media || []).filter(
              (m) => m.kind === 'video' || classifyMediaUrl(m.url) === 'video'
            ).length
            return (
              <article className={`adminReviews__item is-${review.status}`} key={review.id}>
                <div className="adminReviews__main">
                  <div className="adminReviews__head">
                    <span className="adminReviews__author">
                      {review.author_name}
                      {review.reviewer_type === 'influencer' && (
                        <span className="admin-tag admin-tag--feat">Influencer</span>
                      )}
                    </span>
                    <Stars value={review.rating} size={13} />
                    <span className={`adminReviews__status is-${review.status}`}>
                      {STATUS_LABEL[review.status] || review.status}
                    </span>
                  </div>

                  <p className="adminReviews__text">
                    {review.title && <strong>{review.title} — </strong>}
                    {review.body}
                  </p>

                  <div className="adminReviews__meta">
                    <span>
                      Product: {review.product?.name || review.product_id}
                    </span>
                    {review.handle && <span>· {review.handle}</span>}
                    {mediaCount > 0 && (
                      <span>
                        · <ImageIcon className="adminReviews__mini-icon" /> {mediaCount}
                        {videoCount > 0 && (
                          <>
                            {' '}· <Video className="adminReviews__mini-icon" /> {videoCount}
                          </>
                        )}
                      </span>
                    )}
                    {videoMedia && (
                      <span className="adminReviews__video-tag" title={videoMedia.url}>
                        · <Video className="adminReviews__mini-icon" />
                        <a href={videoMedia.url} target="_blank" rel="noopener noreferrer">
                          {videoMedia.url.length > 40
                            ? `${videoMedia.url.slice(0, 37)}…`
                            : videoMedia.url}
                        </a>
                      </span>
                    )}
                    {review.verified_purchase && <span>· Verified purchase</span>}
                    <span>· {fmtDate(review.created_at)}</span>
                  </div>
                </div>

                <div className="adminReviews__actions">
                  {review.status !== 'approved' && (
                    <button
                      type="button"
                      className="admin-review-btn admin-review-btn--approve"
                      onClick={() => onStatus(review.id, 'approved')}
                      title="Approve review"
                    >
                      <ThumbsUp size={14} /> Approve
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      type="button"
                      className="admin-review-btn"
                      onClick={() => onStatus(review.id, 'rejected')}
                      title="Reject review"
                    >
                      <ThumbsDown size={14} /> Reject
                    </button>
                  )}
                  <button
                    type="button"
                    className={`admin-review-btn ${review.featured ? 'is-featured' : ''}`}
                    onClick={() => onFeature(review)}
                    title={review.featured ? 'Unfeature review' : 'Feature review on storefront'}
                  >
                    <Star size={14} fill={review.featured ? 'currentColor' : 'none'} />{' '}
                    {review.featured ? 'Featured' : 'Feature'}
                  </button>
                  <button
                    type="button"
                    className="admin-review-btn"
                    onClick={() => onEdit(review)}
                    title="Edit review"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    className="admin-review-btn admin-review-btn--danger"
                    onClick={() => onDelete(review)}
                    title="Delete review"
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