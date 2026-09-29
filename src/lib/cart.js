const KEY = 'revivaa-cart-v1'
let listeners = []

function read() {
  try {
    const v = localStorage.getItem(KEY)
    return v ? JSON.parse(v) : []
  } catch {
    return []
  }
}

function write(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
  listeners.forEach((fn) => fn(items))
}

function keyOf(productId, variationId) {
  return `${productId}:${variationId || 'base'}`
}

export function getCart() {
  return read()
}

export function subscribeCart(fn) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((l) => l !== fn)
  }
}

export function cartCount() {
  return read().reduce((n, i) => n + i.qty, 0)
}

export function cartTotal() {
  return read().reduce((s, i) => s + i.unitPrice * i.qty, 0)
}

export function addItem({
  productId,
  variationId = null,
  slug,
  name,
  size,
  unitPrice,
  basePrice,
  image,
  qty = 1,
  minQty = 1,
  maxQty = 12,
  stock,
  currency,
}) {
  const items = read()
  const id = keyOf(productId, variationId)
  const idx = items.findIndex((i) => i.key === id)
  if (idx >= 0) {
    const next = [...items]
    next[idx] = {
      ...next[idx],
      qty: Math.min(next[idx].qty + qty, maxQty),
    }
    write(next)
    return next
  }
  const next = [
    ...items,
    { key: id, productId, variationId, slug, name, size, unitPrice, basePrice, image, qty: Math.min(Math.max(qty, minQty), maxQty), minQty, maxQty, stock, currency },
  ]
  write(next)
  return next
}

export function setQty(key, qty) {
  const items = read().map((i) =>
    i.key === key ? { ...i, qty: Math.min(Math.max(qty, i.minQty), i.maxQty) } : i,
  )
  write(items)
  return items
}

export function removeItem(key) {
  const next = read().filter((i) => i.key !== key)
  write(next)
  return next
}

export function clearCart() {
  write([])
  return []
}