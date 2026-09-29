import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Search, ShoppingBag, Check, Filter, Zap } from 'lucide-react'
import Cursor from '../components/Cursor'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import ProductBadges from '../components/ProductBadges'
import { PAGE_SEO, SITE_DOMAIN } from '../lib/seoConfig'
import { formatMoney } from '../data/product'
import { fetchCategories, fetchProducts } from '../lib/shop'
import { useCart } from '../lib/CartContext'
import { flyImageToCart } from '../lib/flyToCart'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import useDebounce from '../hooks/useDebounce'
import './ShopPage.css'

const SORTS = [
  ['featured', 'Featured'],
  ['price-asc', 'Price · Low to high'],
  ['price-desc', 'Price · High to low'],
  ['name', 'Name (A–Z)'],
]

export default function ShopPage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 200)
  const [sort, setSort] = useState('featured')
  const [loading, setLoading] = useState(true)
  const [addedId, setAddedId] = useState(null)

  const { add } = useCart()
  const reduced = usePrefersReducedMotion()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'The Collection · Pure Botanical Hair Care · Revivaa'
    const prev = document.title
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    let alive = true
    Promise.all([fetchCategories(), fetchProducts()]).then(([c, p]) => {
      if (!alive) return
      setCategories(c.data || [])
      setProducts(p.data || [])
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const list = useMemo(() => {
    let out = products.filter((p) => {
      if (!category || !p.categoryId) return !category || p.categoryId === category
      return p.categoryId === category
    })

    const catChildren = categories.filter((c) => c.parent_id === category)
    if (category && catChildren.length) {
      const ids = new Set([category, ...catChildren.map((c) => c.id)])
      out = products.filter((p) => ids.has(p.categoryId))
    }

    if (debouncedSearchTerm.trim()) {
      const q = debouncedSearchTerm.toLowerCase().trim()
      out = out.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      )
    }

    switch (sort) {
      case 'price-asc':
        out = [...out].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))
        break
      case 'price-desc':
        out = [...out].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price))
        break
      case 'name':
        out = [...out].sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        out = [...out].sort((a, b) => {
          const ta = Number(Boolean(a.tags?.featured)) * 10 + Number(Boolean(a.tags?.bestSeller)) * 3
          const tb = Number(Boolean(b.tags?.featured)) * 10 + Number(Boolean(b.tags?.bestSeller)) * 3
          return tb - ta
        })
    }
    return out
  }, [products, categories, category, debouncedSearchTerm, sort])

  const chips = useMemo(() => {
    const top = categories.filter((c) => !c.parent_id)
    const children = categories.filter((c) => c.parent_id)
    return [...top, ...children]
  }, [categories])

  const buildCartItem = (product) => {
    const variation = product.variations && product.variations.length > 0 ? product.variations[0] : null
    const price = variation ? variation.salePrice ?? variation.price : product.salePrice ?? product.price
    const stock = variation ? variation.stock : product.stock

    return {
      productId: product.id,
      variationId: variation?.id || null,
      slug: product.slug,
      name: variation?.size ? `${product.name} (${variation.size})` : product.name,
      size: variation?.size || null,
      unitPrice: price,
      basePrice: product.price,
      image: product.image,
      qty: 1,
      minQty: product.minQty || 1,
      maxQty: product.maxQty || 10,
      stock,
      currency: product.currency || 'PKR',
    }
  }

  const handleQuickAdd = (e, product) => {
    e.preventDefault()
    e.stopPropagation()

    add(buildCartItem(product))

    const cardEl = e.currentTarget.closest('.shop-card')
    const imgEl = cardEl?.querySelector('img')
    if (imgEl) {
      flyImageToCart({
        img: imgEl.currentSrc || imgEl.src,
        fromRect: imgEl.getBoundingClientRect(),
        reduceMotion: reduced,
      })
    }

    setAddedId(product.id)
    window.setTimeout(() => setAddedId(null), 1300)
  }

  const handleBuyNow = (e, product) => {
    e.preventDefault()
    e.stopPropagation()

    add(buildCartItem(product))
    navigate('/checkout')
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Revivaa Botanical Hair Care Collection',
    description: PAGE_SEO.shop.description,
    url: `${SITE_DOMAIN}/shop`,
    itemListElement: products.map((prod, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_DOMAIN}/product/${prod.slug}`,
      name: prod.name,
      image: prod.image,
    })),
  }

  return (
    <div className="app shop-app">
      <SEO
        title={PAGE_SEO.shop.title}
        description={PAGE_SEO.shop.description}
        canonical={PAGE_SEO.shop.canonical}
        keywords={PAGE_SEO.shop.keywords}
        ogType={PAGE_SEO.shop.ogType}
        structuredData={itemListSchema}
        schemaId="shop-list-schema"
      />
      <Cursor />
      <Navbar />

      <main id="main" tabIndex={-1} className="shop-page">
        <Breadcrumbs items={[{ label: 'The Collection', href: '/shop' }]} />
        <div className="container">
          <header className="shop-page__header">
            <div className="shop-page__label-wrap">
              <span className="section-label">The Botanical Collection</span>
            </div>
            <h1 className="shop-page__title">The Revivaa Collection · Pure Botanical Hair Care</h1>
            <p className="shop-page__lead">
              Nourish, strengthen, and support healthier-looking hair. Formulated with 13 pure
              botanical extracts and zero harmful additives.
            </p>
          </header>

          {/* ——— Controls & Search ——— */}
          <div className="shop-page__controls-bar clay">
            <div className="shop-page__search-box">
              <Search size={17} className="shop-page__search-icon" aria-hidden />
              <input
                type="text"
                placeholder="Search formulas, botanicals…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shop-page__search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="shop-page__search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="shop-page__sort-wrap">
              <label htmlFor="shop-sort-select" className="shop-page__sort-label">
                <Filter size={14} aria-hidden /> Sort:
              </label>
              <select
                id="shop-sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="shop-page__sort-select"
              >
                {SORTS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ——— Category Chips ——— */}
          <div className="shop-page__chips-scroll">
            <div className="shop-page__chips" role="tablist" aria-label="Categories">
              <button
                type="button"
                className={`shop-chip ${category === '' ? 'is-active' : ''}`}
                onClick={() => setCategory('')}
              >
                All Products ({products.length})
              </button>
              {chips.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`shop-chip ${category === c.id ? 'is-active' : ''}`}
                  onClick={() => setCategory(c.id)}
                >
                  {c.parent_id ? '↳ ' : ''}
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* ——— Product Grid & Empty State ——— */}
          {loading ? (
            <div className="shop-page__loading">
              <div className="shop-page__spinner" />
              <p className="shop-page__muted">Harvesting botanical products…</p>
            </div>
          ) : list.length === 0 ? (
            <div className="shop-page__empty clay">
              <h3>No matching formulas found</h3>
              <p className="shop-page__muted">
                {searchTerm
                  ? `No products match "${searchTerm}". Try a different keyword or view all categories.`
                  : 'No products in this category at the moment.'}
              </p>
              <button
                type="button"
                className="clay-btn"
                onClick={() => {
                  setCategory('')
                  setSearchTerm('')
                }}
              >
                View Full Collection
              </button>
            </div>
          ) : (
            <ul className="shop-grid">
              {list.map((p) => {
                const isAdded = addedId === p.id
                const isOutOfStock = p.stock === 0
                return (
                  <li key={p.id} className="shop-grid__item">
                    <div className="shop-card">
                      <Link
                        to={`/product/${p.slug || p.id}`}
                        className="shop-card__media-link"
                        aria-label={`View ${p.name}`}
                      >
                        <div className="shop-card__media">
                          {p.image ? (
                            <img src={p.image} alt={p.name} loading="lazy" decoding="async" />
                          ) : (
                            <div className="shop-card__placeholder">Revivaa</div>
                          )}
                          <ProductBadges product={p} />

                          {!isOutOfStock && (
                            <button
                              type="button"
                              className={`shop-card__add-icon ${isAdded ? 'is-added' : ''}`}
                              onClick={(e) => handleQuickAdd(e, p)}
                              title="Add to bag"
                              aria-label={`Add ${p.name} to cart`}
                            >
                              {isAdded ? <Check size={15} /> : <ShoppingBag size={15} />}
                            </button>
                          )}
                        </div>
                      </Link>

                      <div className="shop-card__body">
                        {p.category?.name && (
                          <p className="shop-card__category">{p.category.name}</p>
                        )}
                        <Link to={`/product/${p.slug || p.id}`} className="shop-card__name-link">
                          <h2 className="shop-card__name">{p.name}</h2>
                        </Link>

                        <p className="shop-card__price">
                          {p.salePrice && p.salePrice < p.price ? (
                            <>
                              <span className="shop-card__price-now">
                                {formatMoney(p.salePrice, p.currency)}
                              </span>
                              <s className="shop-card__price-was">
                                {formatMoney(p.price, p.currency)}
                              </s>
                            </>
                          ) : (
                            <span className="shop-card__price-now">
                              {formatMoney(p.price, p.currency)}
                            </span>
                          )}
                        </p>

                        {isOutOfStock ? (
                          <button type="button" className="shop-card__buy-now" disabled>
                            Out of Stock
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="shop-card__buy-now"
                            onClick={(e) => handleBuyNow(e, p)}
                          >
                            <Zap size={14} /> Buy Now
                          </button>
                        )}

                        <Link to={`/product/${p.slug || p.id}`} className="shop-card__cta">
                          View details <ChevronRight size={12} strokeWidth={2} aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}