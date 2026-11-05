import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Play,
  X,
  ZoomIn,
  Check,
  Star,
  ShieldCheck,
  Truck,
  Leaf,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import Cursor from '../components/Cursor'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import ProductReviews from '../components/ProductReviews'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useCart } from '../lib/CartContext'
import { formatMoney } from '../data/product'
import { fetchProduct, fetchRelatedProducts, statusOf } from '../lib/shop'
import { PAGE_SEO, SITE_DOMAIN, BRAND_NAME } from '../lib/seoConfig'
import { flyImageToCart } from '../lib/flyToCart'
import WhatsAppIcon from '../components/WhatsAppIcon'
import {
  buildWhatsAppLink,
  formatWhatsAppOrderMessage,
  formatWhatsAppInquiryMessage,
  WHATSAPP_DISPLAY_PHONE,
} from '../lib/whatsapp'
import './ProductPage.css'

const EASE = [0.22, 1, 0.36, 1]

export default function ProductPage() {
  const { slug } = useParams()
  const reduced = usePrefersReducedMotion()
  const { add } = useCart()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [prevSlug, setPrevSlug] = useState(slug)
  const [selection, setSelection] = useState(null)
  const [added, setAdded] = useState(false)

  if (prevSlug !== slug) {
    setPrevSlug(slug)
    setSelection(null)
    setAdded(false)
    setLoading(true)
    setNotFound(false)
  }

  useEffect(() => {
    let alive = true
    const ref = slug || 'revivaa-oil-150'
    fetchProduct(ref).then(({ data, error: err }) => {
      if (!alive) return
      if (err) setError(err?.message || 'Could not load product')
      if (!data) setNotFound(true)
      else {
        setProduct(data)
        fetchRelatedProducts(data).then(({ data: rel }) => {
          if (alive) setRelated(rel || [])
        })
      }
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [slug])

  if (loading) {
    return (
      <div className="app product-app">
        <Cursor />
        <Navbar />
        <main className="product-page product-page--bare">
          <div className="product-page__spinner" />
          <p className="product-page__muted">Preparing product details…</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="app product-app">
        <Cursor />
        <Navbar />
        <main className="product-page product-page--bare">
          <p className="product-page__muted">{error || 'Product not found.'}</p>
          <Link to="/shop" className="clay-btn">
            Back to Collection
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const onAdd = (qty, price, stock, variationId, size) => {
    add({
      productId: product.id,
      variationId,
      slug: product.slug,
      name: size ? `${product.name} (${size})` : product.name,
      size,
      unitPrice: price,
      basePrice: product.price,
      image: product.image,
      qty,
      minQty: product.minQty,
      maxQty: product.maxQty,
      stock,
      currency: product.currency,
    })

    const stageImg = document.querySelector('.product-gallery2__img')
    const fromEl = stageImg || document.querySelector('.product-gallery2__stage')
    if (fromEl) {
      flyImageToCart({
        img: stageImg ? stageImg.currentSrc || stageImg.src : product.image,
        fromRect: fromEl.getBoundingClientRect(),
        reduceMotion: reduced,
      })
    }

    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  const scrollToReviews = () => {
    const el =
      document.getElementById('product-reviews-section') ||
      document.querySelector('.product-reviews')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const productCanonical = `${SITE_DOMAIN}/product/${product.slug || 'revivaa-oil-150'}`
  const currentPrice = product.salePrice ?? product.price ?? 1950
  const productImageUrl = product.image
    ? product.image.startsWith('http')
      ? product.image
      : `${SITE_DOMAIN}${product.image}`
    : `${SITE_DOMAIN}/images/hero-product.jpg`

  const hasSale =
    product.salePrice && product.price && product.salePrice < product.price
  const salePercent = hasSale
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: productImageUrl,
    description: product.description || PAGE_SEO.productSingle.description,
    sku: product.sku || 'RV-BO-150',
    brand: {
      '@type': 'Brand',
      name: BRAND_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: productCanonical,
      priceCurrency: product.currency || 'PKR',
      price: String(currentPrice),
      validFrom: '2026-01-01',
      priceValidUntil: '2026-12-31',
      availability:
        (product.stock ?? 1) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: BRAND_NAME,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PK',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
        url: `${SITE_DOMAIN}/refund-policy`,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'PKR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'PK',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 4,
            unitCode: 'DAY',
          },
        },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '38',
      bestRating: '5',
      worstRating: '1',
    },
  }

  return (
    <div className="app product-app">
      <SEO
        title={product.meta?.title || `${product.name} | Revivaa Natural Hair Care`}
        description={
          product.meta?.description ||
          product.description ||
          PAGE_SEO.productSingle.description
        }
        canonical={productCanonical}
        keywords={product.meta?.keywords || PAGE_SEO.productSingle.keywords}
        ogType="product"
        ogImage={productImageUrl}
        structuredData={productSchema}
        schemaId={`product-${product.id}-schema`}
      />
      <Cursor />
      <Navbar />

      <main id="main" tabIndex={-1} className="product-page">
        <Breadcrumbs
          items={[
            { label: 'The Collection', href: '/shop' },
            { label: product.name, href: `/product/${product.slug}` },
          ]}
        />

        <div className="container">
          <div className="product-layout">
            <Gallery product={product} reduced={reduced} />

            <section className="product-info" aria-labelledby="product-name">
              <div className="product-info__top">
                {product.category && (
                  <Link to="/shop" className="product-info__category">
                    {product.category.name}
                  </Link>
                )}

                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="product-info__rating-pill"
                  title="View Customer Reviews"
                >
                  <Star size={14} fill="#f2970c" color="#f2970c" aria-hidden />
                  <strong>4.9 / 5</strong>
                  <span>(Customer Reviews)</span>
                </button>
              </div>

              <h1 id="product-name" className="product-info__title">
                {product.name}
              </h1>

              {product.subtitle && (
                <p className="product-info__subtitle">{product.subtitle}</p>
              )}

              {/* Static pill badges — no more floating under the nav */}
              <div className="product-info__badges">
                {product.tags?.featured && (
                  <span className="product-info__badge is-featured">Featured</span>
                )}
                {product.tags?.bestSeller && (
                  <span className="product-info__badge is-best">Best Seller</span>
                )}
                {product.tags?.new && (
                  <span className="product-info__badge is-new">New</span>
                )}
                {hasSale && (
                  <span className="product-info__badge is-sale">
                    Save {salePercent}%
                  </span>
                )}
              </div>

              <PriceLine
                product={product}
                variant={selectedVariant(product, selection)}
              />

              <StockLine
                product={product}
                variant={selectedVariant(product, selection)}
              />

              {product.variations && product.variations.length > 0 && (
                <Variations
                  product={product}
                  selected={selectedVariant(product, selection)}
                  onSelect={setSelection}
                />
              )}

              <BuyBox
                product={product}
                variant={selectedVariant(product, selection)}
                added={added}
                onAdd={onAdd}
              />

              <div className="product-perks">
                <div className="product-perk">
                  <Leaf size={18} className="product-perk__icon" />
                  <span>100% Botanical Actives</span>
                </div>
                <div className="product-perk">
                  <Truck size={18} className="product-perk__icon" />
                  <span>Cash on Delivery (COD)</span>
                </div>
                <div className="product-perk">
                  <ShieldCheck size={18} className="product-perk__icon" />
                  <span>Toxin &amp; Paraben Free</span>
                </div>
                <div className="product-perk">
                  <Sparkles size={18} className="product-perk__icon" />
                  <span>All Hair Types</span>
                </div>
              </div>

              {product.description && (
                <div className="product-info__description">
                  {product.description}
                </div>
              )}

              <ProductAccordions product={product} />

              {product.specList && product.specList.length > 0 && (
                <dl className="product-info__specs">
                  {product.specList.map((s, i) => (
                    <div key={i}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <a
                href={buildWhatsAppLink(
                  formatWhatsAppInquiryMessage({
                    productName: product.name,
                    variantSize: selectedVariant(product, selection)?.size,
                    isOutOfStock: product.stock === 0,
                    url: typeof window !== 'undefined' ? window.location.href : '',
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="product-whatsapp-help"
              >
                <WhatsAppIcon size={18} />
                <span>
                  Ask about this product on WhatsApp ({WHATSAPP_DISPLAY_PHONE})
                </span>
              </a>
            </section>
          </div>

          <div id="product-reviews-section">
            <ProductReviews product={product} key={`reviews-${product.id}`} />
          </div>

          {related.length > 0 && (
            <section
              className="product-related"
              aria-labelledby="product-related-title"
            >
              <div className="product-related__header">
                <span className="section-label">Botanical Pairings</span>
                <h2
                  id="product-related-title"
                  className="product-related__title"
                >
                  You may also like
                </h2>
              </div>
              <ul className="product-related__grid">
                {related.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/product/${p.slug || p.id}`}
                      className="product-related__card clay"
                    >
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <div className="product-related__body">
                        <strong>{p.name}</strong>
                        <span>
                          {formatMoney(p.salePrice ?? p.price, p.currency)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

/* ——— Expandable Accordions ——— */
function ProductAccordions() {
  const [openTab, setOpenTab] = useState('ritual')

  const toggle = (tab) => {
    setOpenTab(openTab === tab ? null : tab)
  }

  return (
    <div className="product-accordions">
      <div
        className={`product-accordion ${
          openTab === 'ritual' ? 'is-open' : ''
        }`}
      >
        <button
          type="button"
          className="product-accordion__btn"
          onClick={() => toggle('ritual')}
          aria-expanded={openTab === 'ritual'}
        >
          <span>The Daily Ritual &amp; How to Use</span>
          <ChevronDown size={18} className="product-accordion__arrow" />
        </button>
        {openTab === 'ritual' && (
          <div className="product-accordion__panel">
            <p>
              1. <strong>Prep:</strong> Dispense 3–5 drops into the palm of your
              hand and warm between palms.
            </p>
            <p>
              2. <strong>Scalp Massage:</strong> Gently massage into clean scalp
              using circular motions for 3–5 minutes.
            </p>
            <p>
              3. <strong>Lengths &amp; Ends:</strong> Smooth remaining oil along
              hair strands to seal moisture and prevent split ends.
            </p>
            <p>
              4. <strong>Frequency:</strong> Use 2–3 times a week as an overnight
              treatment, or 30 minutes before washing.
            </p>
          </div>
        )}
      </div>

      <div
        className={`product-accordion ${
          openTab === 'ingredients' ? 'is-open' : ''
        }`}
      >
        <button
          type="button"
          className="product-accordion__btn"
          onClick={() => toggle('ingredients')}
          aria-expanded={openTab === 'ingredients'}
        >
          <span>13 Botanical Actives &amp; Purity</span>
          <ChevronDown size={18} className="product-accordion__arrow" />
        </button>
        {openTab === 'ingredients' && (
          <div className="product-accordion__panel">
            <p>
              Formulated with 13 pure cold-pressed botanical oils including
              Rosemary, Amla, Retha, Argan, Jojoba, Sweet Almond, Black Seed, and
              Castor Seed extracts.
            </p>
            <p>
              <strong>Clean Promise:</strong> 100% plant-powered, zero mineral
              oil, zero sulfates, zero silicones, and no synthetic fragrances.
            </p>
          </div>
        )}
      </div>

      <div
        className={`product-accordion ${
          openTab === 'benefits' ? 'is-open' : ''
        }`}
      >
        <button
          type="button"
          className="product-accordion__btn"
          onClick={() => toggle('benefits')}
          aria-expanded={openTab === 'benefits'}
        >
          <span>Key Benefits &amp; Hair Revival</span>
          <ChevronDown size={18} className="product-accordion__arrow" />
        </button>
        {openTab === 'benefits' && (
          <div className="product-accordion__panel">
            <ul className="product-accordion__list">
              <li>Stimulates hair follicles for thicker, healthier growth.</li>
              <li>Deeply hydrates dry scalp and soothes flakiness.</li>
              <li>
                Strengthens hair strands to significantly reduce breakage.
              </li>
              <li>
                Delivers a lightweight, glossy finish without sticky residue.
              </li>
            </ul>
          </div>
        )}
      </div>

      <div
        className={`product-accordion ${
          openTab === 'shipping' ? 'is-open' : ''
        }`}
      >
        <button
          type="button"
          className="product-accordion__btn"
          onClick={() => toggle('shipping')}
          aria-expanded={openTab === 'shipping'}
        >
          <span>Shipping &amp; Cash on Delivery</span>
          <ChevronDown size={18} className="product-accordion__arrow" />
        </button>
        {openTab === 'shipping' && (
          <div className="product-accordion__panel">
            <p>
              We deliver across all cities in Pakistan via express courier (2–4
              business days).
            </p>
            <p>
              <strong>Cash on Delivery (COD)</strong> is available for all
              orders. You can track your parcel in real-time using your tracking
              ID on our Track page.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ——— Pricing / stock / variant helpers ——— */

function selectedVariant(product, selection) {
  if (!product.variations || !product.variations.length) return null
  const sel = selection && product.variations.find((v) => v.id === selection.id)
  return sel || product.variations[0]
}

function PriceLine({ product, variant }) {
  const price = variant
    ? variant.salePrice ?? variant.price
    : product.salePrice ?? product.price
  const base = variant ? variant.price : product.price
  const onSale = price < base
  return (
    <p className="product-info__price">
      <span className={onSale ? 'product-info__price-now' : ''}>
        {formatMoney(price, product.currency)}
      </span>
      {onSale && (
        <s className="product-info__price-was">
          {formatMoney(base, product.currency)}
        </s>
      )}
      {onSale && (
        <span className="product-info__save-badge">
          Save {Math.round(((base - price) / base) * 100)}%
        </span>
      )}
    </p>
  )
}

function StockLine({ product, variant }) {
  const stock = variant ? variant.stock : product.stock
  const status = statusOf(stock, product.lowStockThreshold)
  return (
    <p className={`product-info__stock is-${status}`}>
      {status === 'out' && 'Out of stock'}
      {status === 'low' && `Only ${stock} bottles remaining`}
      {status === 'in' && 'In Stock — Ready to dispatch'}
    </p>
  )
}

function Variations({ product, selected, onSelect }) {
  return (
    <div className="product-variants">
      <p className="product-variants__label">
        Size: <strong>{selected.size}</strong>
      </p>
      <div className="product-variants__list" role="group" aria-label="Size">
        {product.variations.map((v) => {
          const stock = statusOf(v.stock, product.lowStockThreshold)
          const active = selected.id === v.id
          return (
            <button
              key={v.id}
              type="button"
              className={`product-variants__btn ${active ? 'is-active' : ''}`}
              disabled={stock === 'out'}
              onClick={() => onSelect(v)}
              aria-pressed={active}
            >
              <span className="product-variants__size">{v.size}</span>
              <span className="product-variants__meta">
                {stock === 'out'
                  ? 'Sold out'
                  : formatMoney(v.salePrice ?? v.price, product.currency)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BuyBox({ product, variant, added, onAdd }) {
  const [qty, setQty] = useState(product.minQty || 1)
  useEffect(() => {
    setQty(product.minQty || 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, variant?.id])

  const stock = variant ? variant.stock : product.stock
  const out = stock === 0
  const price = variant
    ? variant.salePrice ?? variant.price
    : product.salePrice ?? product.price
  const max = stock > 0 ? Math.min(product.maxQty || 10, stock) : product.maxQty || 10

  const plus = () => setQty((q) => Math.min(max, q + 1))
  const minus = () => setQty((q) => Math.max(product.minQty || 1, q - 1))

  const whatsappOrderUrl = useMemo(() => {
    const message = out
      ? formatWhatsAppInquiryMessage({
          productName: product.name,
          variantSize: variant?.size,
          isOutOfStock: true,
          url: typeof window !== 'undefined' ? window.location.href : '',
        })
      : formatWhatsAppOrderMessage({
          productName: product.name,
          variantSize: variant?.size,
          quantity: qty,
          unitPrice: price,
          currency: product.currency || 'PKR',
          url: typeof window !== 'undefined' ? window.location.href : '',
        })
    return buildWhatsAppLink(message)
  }, [product.name, product.currency, variant?.size, qty, price, out])

  return (
    <div className="product-buy-container">
      <div className="product-buy">
        <div className="product-buy__qty-stepper" role="group" aria-label="Quantity">
          <button
            type="button"
            onClick={minus}
            disabled={qty <= (product.minQty || 1)}
            aria-label="Decrease"
          >
            <Minus size={16} strokeWidth={2} aria-hidden />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={product.minQty || 1}
            max={max}
            value={qty}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10)
              if (!Number.isNaN(n))
                setQty(Math.min(max, Math.max(product.minQty || 1, n)))
            }}
          />
          <button
            type="button"
            onClick={plus}
            disabled={qty >= max}
            aria-label="Increase"
          >
            <Plus size={16} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <button
          type="button"
          className={`clay-btn product-buy__cta ${added ? 'is-added' : ''}`}
          disabled={out}
          onClick={() =>
            onAdd(qty, price, stock, variant && variant.id, variant && variant.size)
          }
        >
          {added ? (
            <>
              <Check size={18} strokeWidth={2.4} aria-hidden /> Added to Bag
            </>
          ) : (
            <>
              <ShoppingBag size={18} strokeWidth={2} aria-hidden />
              {out ? 'Out of stock' : 'Add to Bag'}
            </>
          )}
        </button>
      </div>

      <a
        href={whatsappOrderUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`product-buy__whatsapp-cta ${out ? 'is-out' : ''}`}
        aria-label={out ? 'Inquire about restock on WhatsApp' : `Order ${qty} ${product.name} on WhatsApp`}
      >
        <WhatsAppIcon size={20} className="product-buy__whatsapp-icon" />
        <span>{out ? 'Inquire on WhatsApp' : 'Order via WhatsApp'}</span>
      </a>
    </div>
  )
}

/* ——— Gallery ——— */

function buildMedia(product) {
  const list = [...(product.gallery || [])].filter(Boolean)
  const hasVideo = list.some((m) => m.kind === 'video')
  if (product.video_url && !hasVideo) {
    list.push({
      id: '__video_url',
      kind: 'video',
      url: product.video_url,
      posterUrl: product.image,
      label: 'Video',
      alt: `${product.name} video`,
    })
  }
  return list.length
    ? list
    : [
        {
          id: '__image',
          kind: 'image',
          url: product.image,
          label: '',
          alt: product.name,
        },
      ]
}

function Gallery({ product, reduced }) {
  const items = useMemo(() => buildMedia(product), [product])
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(null)
  const [zoom, setZoom] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const drag = useRef(null)
  const moved = useRef(false)
  const reducedMotion = reduced

  const current = items[Math.min(active, items.length - 1)]
  const hasVideo = items.some((m) => m.kind === 'video')

  const go = (dir) => {
    setActive((a) => (a + dir + items.length) % items.length)
    setZoom(false)
  }

  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY }
    moved.current = false
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) moved.current = true
  }
  const onPointerUp = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    drag.current = null
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1)
    }
  }

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }

  return (
    <div className="product-gallery2">
      {items.length > 1 && (
        <div className="product-gallery2__thumbs" role="tablist" aria-label="Images">
          {items.map((m, i) => {
            const isActive = i === active
            return (
              <button
                key={m.id || i}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={m.label || m.alt || `View ${i + 1}`}
                className={`product-gallery2__thumb ${
                  isActive ? 'is-active' : ''
                }`}
                onClick={() => {
                  setActive(i)
                  setZoom(false)
                }}
              >
                {m.kind === 'video' ? (
                  <span className="product-gallery2__thumb-video">
                    <Play size={16} fill="currentColor" aria-hidden />
                  </span>
                ) : (
                  <img
                    src={m.posterUrl || m.url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      <div
        className={`product-gallery2__stage ${zoom ? 'is-zoomed' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => setZoom(false)}
        onMouseMove={current.kind === 'image' ? onMove : undefined}
        onClick={() => {
          if (moved.current) {
            moved.current = false
            return
          }
          if (current.kind === 'video') setLightbox(current)
          else if (zoom) {
            setLightbox(current)
            setZoom(false)
          } else setZoom(true)
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id || active}
            className="product-gallery2__frame"
            initial={reducedMotion ? false : { opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {current.kind === 'video' ? (
              <button
                type="button"
                className="product-gallery2__video-btn"
                onClick={() => setLightbox(current)}
                aria-label="Play video"
              >
                {current.posterUrl && (
                  <img
                    className="product-gallery2__video-poster"
                    src={current.posterUrl}
                    alt=""
                  />
                )}
                <span className="product-gallery2__video-play">
                  <Play size={30} fill="currentColor" aria-hidden />
                </span>
              </button>
            ) : (
              <img
                className="product-gallery2__img"
                src={current.url}
                alt={current.alt || product.name}
                style={zoom ? { transformOrigin: origin } : undefined}
                fetchPriority="high"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {items.length > 1 && (
          <>
            <button
              type="button"
              className="product-gallery2__arrow product-gallery2__arrow--prev"
              onClick={(e) => {
                e.stopPropagation()
                go(-1)
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              className="product-gallery2__arrow product-gallery2__arrow--next"
              onClick={(e) => {
                e.stopPropagation()
                go(1)
              }}
              aria-label="Next image"
            >
              <ChevronRight size={20} strokeWidth={2} aria-hidden />
            </button>
          </>
        )}

        {current.kind === 'image' && (
          <button
            type="button"
            className="product-gallery2__zoom"
            onClick={(e) => {
              e.stopPropagation()
              setLightbox(current)
              setZoom(false)
            }}
            aria-label="Open image in lightbox"
          >
            <ZoomIn size={18} strokeWidth={1.8} aria-hidden />
          </button>
        )}

        {current.kind === 'image' && (
          <div className="product-gallery2__hint">
            Hover to zoom · click for fullscreen
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="product-lightbox"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              className="product-lightbox__close"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              <X size={22} strokeWidth={1.8} aria-hidden />
            </button>
            <motion.div
              className="product-lightbox__media"
              initial={reducedMotion ? false : { scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={reducedMotion ? undefined : { scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.kind === 'video' ? (
                <VideoLightbox
                  url={lightbox.url}
                  poster={lightbox.posterUrl}
                />
              ) : (
                <img src={lightbox.url} alt={lightbox.alt || product.name} />
              )}
              {hasVideo && (
                <button
                  type="button"
                  className="product-lightbox__video"
                  onClick={() => setLightbox(items.find((m) => m.kind === 'video'))}
                >
                  <Play size={14} fill="currentColor" aria-hidden /> Watch video
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function VideoLightbox({ url, poster }) {
  const isStream = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
  if (!isStream && /^https?:/i.test(url)) {
    const src = url.includes('watch?v=')
      ? url.replace('watch?v=', 'embed/')
      : url
    return (
      <iframe
        className="product-lightbox__iframe"
        src={src}
        title="Product video"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    )
  }
  return (
    <video
      className="product-lightbox__video"
      src={url}
      poster={poster || undefined}
      controls
      autoPlay
      muted
      playsInline
    />
  )
}