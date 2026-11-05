import { supabase, isSupabaseConfigured } from './supabase'
import { invalidateCache } from './apiCache'
import { classifyMediaUrl, videoThumbUrl } from './reviews'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function ensureUuid(id) {
  if (typeof id === 'string' && UUID_REGEX.test(id)) return id
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/* ------------------------------------------------------------------ */
/*  Vouchers                                                           */
/* ------------------------------------------------------------------ */

export async function adminFetchVouchers() {
  if (!supabase) return { data: [], error: new Error('Supabase not configured') }
  const { data, error } = await supabase
    .from('vouchers')
    .select('*, usage: voucher_redemptions(count)')
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function adminSaveVoucher(voucher) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') }
  }
  const row = {
    id: voucher.id || undefined,
    code: String(voucher.code || '').trim().toUpperCase(),
    kind: voucher.kind || 'percent',
    value: Number(voucher.value) || 0,
    min_subtotal: Number(voucher.min_subtotal) || 0,
    max_discount: voucher.max_discount ? Number(voucher.max_discount) : null,
    max_uses: voucher.max_uses ? Number(voucher.max_uses) : null,
    max_per_user: Number(voucher.max_per_user) || 1,
    starts_at: voucher.starts_at || null,
    expires_at: voucher.expires_at || null,
    is_active: voucher.is_active == null ? true : Boolean(voucher.is_active),
    description: voucher.description || null,
  }
  const { error } = await supabase.from('vouchers').upsert(row, { onConflict: 'id' })
  return { error }
}

export async function adminDeleteVoucher(id) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') }
  }
  const { error } = await supabase.from('vouchers').delete().eq('id', id)
  return { error }
}

export async function adminDeleteOrder(id) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') }
  }
  const { error } = await supabase.from('orders').delete().eq('id', id)
  return { error }
}

/* ------------------------------------------------------------------ */
/*  Orders                                                             */
/* ------------------------------------------------------------------ */

export async function adminFetchOrders() {
  if (!supabase) return { data: [], error: new Error('Supabase not configured') }

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  return { data: data || [], error }
}

export async function adminUpdateOrderStatus(orderId, status) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') }
  }
  const { error } = await supabase.rpc('admin_update_order_status', {
    p_order_id: orderId,
    p_status: status,
  })
  return { error }
}

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */

export async function adminFetchCategories() {
  if (!supabase) return { data: [], error: new Error('Supabase not configured') }
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('position', { ascending: true })
    .order('name')
  return { data: data || [], error }
}

export async function adminSaveCategory(cat) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') }
  }
  const { error } = await supabase.from('categories').upsert(
    {
      id: cat.id || undefined,
      parent_id: cat.parent_id || null,
      name: cat.name,
      slug: cat.slug,
      title: cat.title || null,
      description: cat.description || null,
      spec_list: cat.spec_list || [],
      meta_title: cat.meta_title || null,
      meta_description: cat.meta_description || null,
      meta_keywords: cat.meta_keywords || null,
      position: cat.position ?? 0,
      active: cat.active ?? true,
    },
    { onConflict: 'id' },
  )
  return { error }
}

export async function adminDeleteCategory(id) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') }
  }
  const { error } = await supabase.from('categories').delete().eq('id', id)
  return { error }
}

/* ------------------------------------------------------------------ */
/*  Products                                                           */
/* ------------------------------------------------------------------ */

const SELECT_FULL =
  '*, variations:product_variations(*), media:product_media(*), category:categories(*)'

export async function adminFetchProductsAll() {
  if (!supabase) return { data: [], error: new Error('Supabase not configured') }
  const { data, error } = await supabase
    .from('products')
    .select(SELECT_FULL)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function adminFetchProducts() {
  return adminFetchProductsAll()
}

export async function adminSaveProduct({ product, variations, media }) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') }
  }

  const row = {
    id: product.id,
    slug: product.slug || null,
    name: product.name,
    subtitle: product.subtitle || null,
    description: product.description || null,
    image_url: product.image_url || null,
    pack_image_url: product.pack_image_url || null,
    unit_price: Number(product.unit_price) || 0,
    sale_price: product.sale_price ? Number(product.sale_price) : null,
    currency: product.currency || 'PKR',
    stock: product.stock == null ? 100 : Number(product.stock),
    min_qty: product.min_qty ?? 1,
    max_qty: product.max_qty ?? 12,
    category_id: product.category_id || null,
    featured: Boolean(product.featured),
    is_new: Boolean(product.is_new),
    best_seller: Boolean(product.best_seller),
    draft: Boolean(product.draft),
    active: product.active === undefined ? true : Boolean(product.active),
    low_stock_threshold: product.low_stock_threshold ?? 10,
    video_url: product.video_url || null,
    sort_order: product.sort_order ?? 0,
    meta_title: product.meta_title || null,
    meta_description: product.meta_description || null,
    meta_keywords: product.meta_keywords || null,
    spec_list: product.spec_list || [],
  }

  const { error: upsertErr } = await supabase.from('products').upsert(row, { onConflict: 'id' })
  if (upsertErr) return { error: upsertErr }

  if (variations) {
    const { error: delVarErr } = await supabase
      .from('product_variations')
      .delete()
      .eq('product_id', row.id)
    if (delVarErr) return { error: delVarErr }

    const rows = variations
      .filter((v) => v.size && v.size.trim())
      .map((v, i) => ({
        id: ensureUuid(v.id),
        product_id: row.id,
        size: v.size,
        price: Number(v.price) || 0,
        sale_price: v.sale_price ? Number(v.sale_price) : null,
        stock: v.stock == null ? -1 : Number(v.stock),
        position: v.position ?? (i + 1) * 10,
      }))

    if (rows.length) {
      const { error: insVarErr } = await supabase.from('product_variations').upsert(rows)
      if (insVarErr) return { error: insVarErr }
    }
  }

  if (media) {
    const { error: delMedErr } = await supabase
      .from('product_media')
      .delete()
      .eq('product_id', row.id)
    if (delMedErr) return { error: delMedErr }

    const rows = media
      .filter((m) => m.url)
      .map((m, i) => ({
        id: ensureUuid(m.id),
        product_id: row.id,
        kind: m.kind || 'image',
        url: m.url,
        alt: m.alt || null,
        label: m.label || null,
        poster_url: m.poster_url || null,
        position: m.position ?? (i + 1) * 10,
      }))

    if (rows.length) {
      const { error: insMedErr } = await supabase.from('product_media').upsert(rows)
      if (insMedErr) return { error: insMedErr }
    }
  }

  return { error: null }
}

export async function adminDeleteProduct(id) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') }
  }
  const { error } = await supabase.from('products').delete().eq('id', id)
  return { error }
}

/* ------------------------------------------------------------------ */
/*  Media upload                                                       */
/* ------------------------------------------------------------------ */

export async function uploadProductMedia(file, productId) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }
  const ext = file.name.split('.').pop() || 'bin'
  const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { data, error } = await supabase.storage.from('product-media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) return { data: null, error }

  const { data: urlData } = supabase.storage.from('product-media').getPublicUrl(data.path)
  return { data: { path: data.path, publicUrl: urlData.publicUrl }, error: null }
}

export async function deleteProductMedia(path) {
  if (!isSupabaseConfigured || !supabase) return
  await supabase.storage.from('product-media').remove([path])
}

/* ------------------------------------------------------------------ */
/*  Reviews                                                            */
/* ------------------------------------------------------------------ */

const SELECT_REVIEWS =
  '*, media:review_media(*), product:products(name, slug)'

export async function adminFetchReviews() {
  if (!supabase) return { data: [], error: new Error('Supabase not configured') }
  const { data, error } = await supabase
    .from('reviews')
    .select(SELECT_REVIEWS)
    .order('created_at', { ascending: false })
    .limit(500)
  return { data: data || [], error }
}

export async function adminUpdateReviewStatus(id, status) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') }
  }
  const { error } = await supabase.from('reviews').update({ status }).eq('id', id)
  if (!error) invalidateCache(/^reviews:/)
  return { error }
}

export async function adminUpdateReview(id, patch) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') }
  }
  const { error } = await supabase.from('reviews').update(patch).eq('id', id)
  if (!error) invalidateCache(/^reviews:/)
  return { error }
}

export async function adminDeleteReview(review) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') }
  }
  const paths = (review.media || []).map((m) => m.path).filter(Boolean)
  if (supabase.storage) {
    try {
      await supabase.storage.from('review-media').remove(paths)
    } catch {
      /* storage cleanup is best-effort */
    }
  }
  const { error } = await supabase.from('reviews').delete().eq('id', review.id)
  if (!error) invalidateCache(/^reviews:/)
  return { error }
}

export async function adminSaveReview({ review, media = [], patch = null }) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') }
  }

  if (review.id && patch) {
    const cleanPatch = { ...patch }
    if (cleanPatch.authorName && !cleanPatch.author_name) {
      cleanPatch.author_name = cleanPatch.authorName
    }
    if (cleanPatch.productId && !cleanPatch.product_id) {
      cleanPatch.product_id = cleanPatch.productId
    }
    if (cleanPatch.reviewerType && !cleanPatch.reviewer_type) {
      cleanPatch.reviewer_type = cleanPatch.reviewerType
    }
    if (cleanPatch.verifiedPurchase !== undefined && cleanPatch.verified_purchase === undefined) {
      cleanPatch.verified_purchase = cleanPatch.verifiedPurchase
    }
    delete cleanPatch.authorName
    delete cleanPatch.productId
    delete cleanPatch.reviewerType
    delete cleanPatch.verifiedPurchase

    const { error } = await supabase.from('reviews').update(cleanPatch).eq('id', review.id)
    if (error) return { error }
    review = { ...review, ...cleanPatch }
  } else {
    let id = review.id
    if (!id) {
      const { data: auth } = await supabase.auth.getUser()
      const authorName =
        (review.author_name && String(review.author_name).trim()) ||
        (review.authorName && String(review.authorName).trim()) ||
        'Revivaa Customer'

      const row = {
        product_id: review.productId || review.product_id,
        user_id: auth?.user?.id || null,
        author_name: authorName,
        rating: Number(review.rating) || 5,
        title: review.title || '',
        body: review.body || '',
        reviewer_type: review.reviewer_type || review.reviewerType || 'influencer',
        handle: review.handle || '',
        featured: Boolean(review.featured),
        status: review.status || 'approved',
        verified_purchase: Boolean(review.verified_purchase ?? review.verifiedPurchase),
      }
      const { data, error } = await supabase.from('reviews').insert(row).select('id').single()
      if (error || !data) return { error: error || new Error('Could not create review') }
      id = data.id
    }
    review = { ...review, id }
  }

  const trimmed = (media || []).filter((m) => m && m.url && String(m.url).trim())
  if (trimmed.length) {
    const { error: delErr } = await supabase
      .from('review_media')
      .delete()
      .eq('review_id', review.id)
    if (delErr) {
      console.warn('Could not delete existing review_media:', delErr)
    }

    const rows = trimmed.map((m, i) => {
      const rawUrl = String(m.url || '').trim()
      const kind = m.kind || classifyMediaUrl(rawUrl) || 'image'
      const poster =
        (m.posterUrl && String(m.posterUrl).trim()) ||
        (m.poster_url && String(m.poster_url).trim()) ||
        (kind === 'video' ? videoThumbUrl(rawUrl) : null) ||
        null
      return {
        id: ensureUuid(m.id),
        review_id: review.id,
        kind,
        url: rawUrl,
        path: m.path || null,
        poster_url: poster,
        position: m.position ?? (i + 1) * 10,
      }
    })
    const { error: insErr } = await supabase.from('review_media').insert(rows)
    if (insErr) {
      // Fallback to upsert if id exists
      const { error: upErr } = await supabase.from('review_media').upsert(rows)
      if (upErr) return { error: upErr }
    }
  } else {
    const { error: delErr } = await supabase
      .from('review_media')
      .delete()
      .eq('review_id', review.id)
    if (delErr) return { error: delErr }
  }

  invalidateCache(/^reviews:/)
  return { error: null }
}