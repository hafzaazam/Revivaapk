/** Shared catalog entry for product + checkout pages */
export const PRODUCT = {
  id: 'revivaa-oil-150',
  name: 'Revivaa Oil',
  subtitle: 'Soft & Natural · 150ml',
  image: '/images/product-bottle.png',
  packImage: '/images/product-pack.png',
  unitPrice: 2499,
  currency: 'PKR',
  minQty: 1,
  maxQty: 12,
}

export function formatMoney(amount, currency = PRODUCT.currency) {
  try {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString('en-PK')}`
  }
}

export function clampQty(value) {
  const n = Number.parseInt(String(value), 10)
  if (Number.isNaN(n)) return PRODUCT.minQty
  return Math.min(PRODUCT.maxQty, Math.max(PRODUCT.minQty, n))
}
