import { statusOf } from '../lib/shop'

export default function ProductBadges({ product }) {
  const stock = statusOf(product.stock, product.lowStockThreshold)

  const salePct =
    product.salePrice && product.salePrice < product.price
      ? `-${Math.round((1 - product.salePrice / product.price) * 100)}%`
      : null

  const items = []
  if (salePct) items.push({ key: 'sale', label: salePct, cls: 'is-sale' })
  if (product.tags?.isNew) items.push({ key: 'new', label: 'New', cls: 'is-new' })
  if (product.tags?.featured) items.push({ key: 'featured', label: 'Featured', cls: 'is-featured' })
  if (product.tags?.bestSeller) items.push({ key: 'best', label: 'Best seller', cls: 'is-best' })
  if (stock === 'low') items.push({ key: 'low', label: `Only ${product.stock} left`, cls: 'is-low' })
  if (stock === 'out') items.push({ key: 'out', label: 'Out of stock', cls: 'is-out' })

  if (!items.length) return null

  return (
    <div className="p-badges" aria-label="Product tags">
      {items.map((b) => (
        <span key={b.key} className={`p-badge ${b.cls}`}>
          {b.label}
        </span>
      ))}
    </div>
  )
}