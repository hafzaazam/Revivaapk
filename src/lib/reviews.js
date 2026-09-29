import { supabase, isSupabaseConfigured } from './supabase'
import { cachedQuery, invalidateCache } from './apiCache'

const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v|m3u8)(\?.*)?$/i
const VIDEO_HOSTS = /(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|tiktok\.com)/i

export function classifyMediaUrl(url) {
  const u = String(url || '').trim()
  if (!u) return null
  if (VIDEO_EXT.test(u) || VIDEO_HOSTS.test(u)) return 'video'
  return 'image'
}

export function youtubeId(raw) {
  const u = String(raw || '')
  const m = u.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{6,})/)
  return m ? m[1] : null
}

export function videoEmbedUrl(raw) {
  const u = String(raw || '').trim()
  if (youtubeId(u)) return `https://www.youtube.com/embed/${youtubeId(u)}`
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return u
}

export function videoThumbUrl(raw) {
  const id = youtubeId(raw)
  if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  return null
}

function sortByPosition(list) {
  return [...(list || [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}

export function normalizeReview(row) {
  const media = sortByPosition(row.media).map((m) => ({
    id: m.id,
    kind: m.kind,
    url: m.url,
    path: m.path || null,
    posterUrl: m.poster_url || null,
    position: m.position ?? 0,
  }))
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product?.name || null,
    productSlug: row.product?.slug || null,
    authorName: row.author_name,
    handle: row.handle || '',
    rating: row.rating,
    title: row.title || '',
    body: row.body || '',
    reviewerType: row.reviewer_type,
    featured: Boolean(row.featured),
    status: row.status,
    verifiedPurchase: Boolean(row.verified_purchase),
    createdAt: row.created_at,
    media,
  }
}

function emptySummary() {
  return { reviews: [], average: 0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
}

export function summarizeReviews(reviews) {
  const summary = emptySummary()
  summary.reviews = reviews
  summary.count = reviews.length
  if (!reviews.length) return summary
  let total = 0
  for (const r of reviews) {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)))
    summary.breakdown[star] = (summary.breakdown[star] || 0) + 1
    total += r.rating
  }
  summary.average = total / reviews.length
  return summary
}

/* Approved reviews + rating summary for a product page */
export async function fetchProductReviews(productId) {
  if (!productId || !isSupabaseConfigured || !supabase) {
    return { data: emptySummary(), error: null }
  }
  return cachedQuery(`reviews:product:${productId}`, async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, media:review_media(*)')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) return { data: null, error }
    return { data: summarizeReviews((data || []).map(normalizeReview)), error: null }
  })
}

/* Approved reviews for the home testimonials section */
export async function fetchHomeTestimonials(limit = 9) {
  if (!isSupabaseConfigured || !supabase) return { data: [], error: null }
  return cachedQuery(`reviews:testimonials:${limit}`, async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, media:review_media(*)')
      .eq('status', 'approved')
      .eq('reviewer_type', 'customer')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) return { data: [], error }
    return { data: (data || []).map(normalizeReview), error: null }
  })
}

/* Approved influencer reels for the home special section */
export async function fetchInfluencerReels(limit = 6) {
  if (!isSupabaseConfigured || !supabase) return { data: [], error: null }
  return cachedQuery(`reviews:reels:${limit}`, async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, media:review_media(*)')
      .eq('status', 'approved')
      .eq('reviewer_type', 'influencer')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) return { data: [], error }
    return { data: (data || []).map(normalizeReview), error: null }
  })
}

export async function submitReview({ productId, authorName: inputAuthor, rating, title, body, media = [] }) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Reviews are not available yet.') }
  }
  const { data: auth, error: authError } = await supabase.auth.getUser()
  if (authError || !auth?.user) {
    return { data: null, error: new Error('Please sign in to leave a review.') }
  }
  const user = auth.user
  const authorName =
    (inputAuthor && String(inputAuthor).trim()) ||
    user.user_metadata?.full_name?.trim() ||
    user.user_metadata?.name?.trim() ||
    (user.email ? user.email.split('@')[0] : '') ||
    'Revivaa Customer'

  const { data: created, error } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      user_id: user.id,
      author_name: authorName,
      rating: Number(rating) || 5,
      title: title || '',
      body: body || '',
      reviewer_type: 'customer',
      status: 'pending',
      verified_purchase: false,
    })
    .select('id')
    .single()
  if (error) return { data: null, error }

  if (media.length) {
    const rows = media.map((m, i) => ({
      review_id: created.id,
      kind: m.kind || classifyMediaUrl(m.url) || 'image',
      url: m.url,
      path: m.path || null,
      poster_url: m.posterUrl || null,
      position: (m.position ?? i) + 1,
    }))
    const { error: mediaError } = await supabase.from('review_media').insert(rows)
    if (mediaError) return { data: null, error: mediaError }
  }

  invalidateCache(/^reviews:/)
  return { data: created, error: null }
}

/* Upload a review image/video into the review-media bucket (owned by user) */
export async function uploadReviewMedia(file) {
  if (!isSupabaseConfigured || !supabase || !supabase.storage) {
    return { data: null, error: new Error('Media uploads are not available yet.') }
  }
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return { data: null, error: new Error('Please sign in first.') }
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  const path = `${auth.user.id}/${Date.now()}-${Math.floor(Math.random() * 1e9)}.${ext}`
  const { data, error } = await supabase.storage
    .from('review-media')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) return { data: null, error }
  const { data: urlData } = supabase.storage.from('review-media').getPublicUrl(data.path)
  return {
    data: {
      path: data.path,
      url: urlData.publicUrl,
      kind: classifyMediaUrl(data.path) || 'image',
      posterUrl: null,
    },
    error: null,
  }
}