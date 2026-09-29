import { supabase } from './supabase'
import { PRODUCT } from '../data/product'
import { cachedQuery, invalidateCache } from './apiCache'

export { invalidateCache as invalidateShopCache }

export const STOCK = {
  OUT: 'out',
  LOW: 'low',
  IN: 'in',
}

export function statusOf(stock, threshold = 10) {
  if (stock === 0) return STOCK.OUT
  if (stock === -1) return STOCK.IN
  if (stock <= threshold) return STOCK.LOW
  return STOCK.IN
}

export function stockLabel(stock, threshold = 10) {
  if (stock === 0) return 'Out of stock'
  if (stock === -1) return 'In stock'
  if (stock <= threshold) return `Only ${stock} left`
  return 'In stock'
}

function sortByPosition(list) {
  return [...(list || [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}

/* Full normalized product shape used by the storefront */
export function mapProduct(row) {
  const media = sortByPosition(row.media).map((m) => ({
    id: m.id,
    kind: m.kind,
    url: m.url,
    alt: m.alt || row.name,
    label: m.label || '',
    posterUrl: m.poster_url || null,
  }))
  const image = media.find((m) => m.kind === 'image')?.url || row.image_url || PRODUCT.image

  return {
    id: row.id,
    slug: row.slug || row.id,
    name: row.name,
    subtitle: row.subtitle || '',
    description: row.description || '',
    price: row.unit_price,
    salePrice: row.sale_price ?? null,
    currency: row.currency || 'PKR',
    stock: row.stock,
    lowStockThreshold: row.low_stock_threshold ?? 10,
    tags: {
      featured: Boolean(row.featured),
      isNew: Boolean(row.is_new),
      bestSeller: Boolean(row.best_seller),
    },
    categoryId: row.category_id,
    category: row.category
      ? { id: row.category.id, name: row.category.name, slug: row.category.slug }
      : null,
    draft: Boolean(row.draft),
    active: Boolean(row.active),
    image,
    packImage: row.pack_image_url || null,
    gallery: media,
    variations: sortByPosition(row.variations).map((v) => ({
      id: v.id,
      size: v.size,
      price: v.price,
      salePrice: v.sale_price ?? null,
      stock: v.stock,
    })),
    specList: Array.isArray(row.spec_list) ? row.spec_list : [],
    meta: {
      title: row.meta_title || '',
      description: row.meta_description || '',
      keywords: row.meta_keywords || '',
    },
    minQty: row.min_qty ?? 1,
    maxQty: row.max_qty ?? 12,
  }
}

const SELECT_FULL =
  '*, variations:product_variations(*), media:product_media(*), category:categories(*)'

function mapLocalProductList() {
  return [
    {
      ...mapProduct({
        ...PRODUCT,
        slug: PRODUCT.id,
        unit_price: PRODUCT.unitPrice,
        currency: PRODUCT.currency,
        stock: -1,
        low_stock_threshold: 10,
        spec_list: [
          { label: 'Volume', value: '150 ml' },
          { label: 'Finish', value: 'Soft & natural' },
          { label: 'Promise', value: 'Premium quality' },
        ],
        meta_title: 'Revivaa Oil · Soft & Natural · 150ml',
      }),
      image: PRODUCT.image,
      packImage: PRODUCT.packImage,
      variations: [],
      gallery: [],
    },
  ]
}

export async function fetchCategories() {
  if (!supabase) return { data: [], error: null }
  return cachedQuery('categories', async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('position', { ascending: true })
      .order('name', { ascending: true })
    return { data: data || [], error }
  })
}

export async function fetchProducts({ categorySlug } = {}) {
  if (!supabase) return { data: mapLocalProductList(), error: null }
  const cacheKey = `products:${categorySlug || 'all'}`

  return cachedQuery(cacheKey, async () => {
    let ids = null
    if (categorySlug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .maybeSingle()
      if (cat) {
        const { data: children } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', cat.id)
        ids = [cat.id, ...(children || []).map((c) => c.id)]
      }
    }

    let q = supabase
      .from('products')
      .select(SELECT_FULL)
      .eq('active', true)
      .eq('draft', false)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (ids) q = q.in('category_id', ids)

    const { data, error } = await q
    return { data: (data || []).map(mapProduct), error }
  })
}

export async function fetchRelatedProducts(product, limit = 4) {
  if (!supabase) return { data: [], error: null }
  const cacheKey = `related:${product.id}:${limit}`

  return cachedQuery(cacheKey, async () => {
    const base = product.categoryId
      ? supabase.from('products').select(SELECT_FULL).eq('category_id', product.categoryId)
      : supabase.from('products').select(SELECT_FULL)
    const { data, error } = await base
      .eq('active', true)
      .eq('draft', false)
      .neq('id', product.id)
      .limit(limit)
    return { data: (data || []).map(mapProduct), error }
  })
}

export async function fetchProduct(ref) {
  if (!supabase) {
    const list = mapLocalProductList()
    const match = list.find((p) => p.slug === ref || p.id === ref) || list[0]
    return { data: match, error: null }
  }

  const cacheKey = `product:${ref}`
  return cachedQuery(cacheKey, async () => {
    const { data, error } = await supabase
      .from('products')
      .select(SELECT_FULL)
      .eq('active', true)
      .eq('draft', false)
      .or(`slug.eq.${ref},id.eq.${ref}`)
      .limit(1)
      .maybeSingle()

    if (error || !data) return { data: null, error }
    return { data: mapProduct(data), error }
  })
}

export async function placeCartOrder({
  lines,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  customerProvince,
  customerCity,
  customerPostalCode,
  notes,
  voucherCode,
}) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured') }
  }
  const { data, error } = await supabase.rpc('place_cart_order', {
    p_lines: lines,
    p_customer_name: customerName,
    p_customer_email: customerEmail,
    p_customer_phone: customerPhone,
    p_customer_address: customerAddress,
    p_customer_province: customerProvince,
    p_customer_city: customerCity,
    p_customer_postal_code: customerPostalCode || null,
    p_notes: notes || null,
    p_voucher_code: voucherCode || null,
  })
  return { data, error }
}

export async function validateVoucher({ code, subtotal, email, phone, address }) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured') }
  }
  const { data, error } = await supabase.rpc('validate_voucher', {
    p_code: code.trim(),
    p_subtotal: Number(subtotal) || 0,
    p_email: email || null,
    p_phone: phone || null,
    p_address: address || null,
  })
  return { data, error }
}

export async function fetchMyOrders() {
  if (!supabase) return { data: [], error: null }

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  return { data: data || [], error }
}

export async function getOrderStatus(trackingCode) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured') }
  }
  const { data, error } = await supabase.rpc('get_order_status', {
    p_tracking_code: trackingCode.trim(),
  })
  return { data, error }
}