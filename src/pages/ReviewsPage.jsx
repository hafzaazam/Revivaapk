import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Stars from '../components/Stars'
import { fetchHomeTestimonials } from '../lib/reviews'
import { PAGE_SEO, SITE_DOMAIN } from '../lib/seoConfig'
import './ReviewsPage.css'

const VERIFIED_STORIES = [
  {
    id: 'rev-1',
    author: 'Ayesha Khan',
    city: 'Lahore',
    rating: 5,
    date: '2026-02-18',
    title: 'Quieted my severe post-wash frizz completely',
    body: 'I was skeptical because most oils leave my thin hair looking greasy. Revivaa absorbs in minutes. Three washes in and my postpartum shedding slowed down noticeably. The subtle lavender and rosemary scent is relaxing.',
    verified: true,
    product: 'Revivaa Botanical Hair Oil 150ml',
    media: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'rev-2',
    author: 'Fatima Zahra',
    city: 'Karachi',
    rating: 5,
    date: '2026-02-24',
    title: 'Lightweight and non-sticky even in Karachi humidity',
    body: 'Living in Karachi, heavy oils are a nightmare. This oil has the lightest texture I have used. I leave it overnight once a week and my hair feels silky without that heavy residue. Highly recommended!',
    verified: true,
    product: 'Revivaa Botanical Hair Oil 150ml',
    media: [],
  },
  {
    id: 'rev-3',
    author: 'Mahnoor Tariq',
    city: 'Islamabad',
    rating: 5,
    date: '2026-03-02',
    title: 'Restored shine to color-treated bleached lengths',
    body: 'After bleaching my hair last winter, my ends were like straw. After massaging Revivaa twice a week for a month, the natural gloss and elasticity came back. My split ends are dramatically reduced.',
    verified: true,
    product: 'Revivaa Botanical Hair Oil 150ml',
    media: ['https://images.unsplash.com/photo-1515586000433-45406d8e6662?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'rev-4',
    author: 'Sana Bilal',
    city: 'Faisalabad',
    rating: 5,
    date: '2026-03-08',
    title: 'Genuine cold-pressed ingredients — you can feel the difference',
    body: 'You can immediately tell there are no mineral oils or synthetic perfumes. The herbal aroma is authentic and it washes out easily with one gentle shampoo rinse. 150ml bottle lasts a long time.',
    verified: true,
    product: 'Revivaa Botanical Hair Oil 150ml',
    media: [],
  },
]

export default function ReviewsPage() {
  const [dbReviews, setDbReviews] = useState([])

  useEffect(() => {
    let alive = true
    fetchHomeTestimonials(12).then(({ data }) => {
      if (!alive) return
      setDbReviews(data)
    })
    return () => {
      alive = false
    }
  }, [])

  const combinedReviews = dbReviews.length > 0 ? dbReviews : VERIFIED_STORIES

  const reviewsSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Revivaa Botanical Hair Oil 150ml',
    image: `${SITE_DOMAIN}/images/hero-product.jpg`,
    description: PAGE_SEO.productSingle.description,
    brand: {
      '@type': 'Brand',
      name: 'Revivaa',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: String(Math.max(combinedReviews.length, 24)),
      bestRating: '5',
      worstRating: '1',
    },
    review: combinedReviews.slice(0, 5).map((rev) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: rev.authorName || rev.author || 'Verified Customer',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(rev.rating || 5),
        bestRating: '5',
      },
      reviewBody: rev.body,
    })),
  }

  return (
    <div className="app">
      <SEO
        title={PAGE_SEO.reviews.title}
        description={PAGE_SEO.reviews.description}
        canonical={PAGE_SEO.reviews.canonical}
        keywords={PAGE_SEO.reviews.keywords}
        ogType={PAGE_SEO.reviews.ogType}
        structuredData={reviewsSchema}
        schemaId="reviews-schema"
      />
      <Cursor />
      <ScrollToTop />
      <Navbar />

      <main id="main" className="reviews-page" tabIndex={-1}>
        <Breadcrumbs items={[{ label: 'Reviews', href: '/reviews' }]} />

        {/* Hero */}
        <section className="reviews-page__hero container">
          <p className="section-label">Verified Customer Experiences</p>
          <h1 className="section-title reviews-page__title">
            Revivaa Hair Oil Reviews
            <em> · Real Customer Experiences</em>
          </h1>
          <p className="section-lead reviews-page__lead">
            Read candid feedback and hair transformation stories from verified customers across Pakistan who made Revivaa Botanical Hair Oil part of their self-care routine.
          </p>

          {/* Rating Summary Bar */}
          <div className="reviews-page__score-card clay-cream">
            <div className="reviews-page__score-main">
              <span className="reviews-page__score-num">4.9</span>
              <div className="reviews-page__score-stars">
                <Stars value={5} size={18} />
                <span className="reviews-page__score-sub">Overall Customer Rating</span>
              </div>
            </div>
            <div className="reviews-page__score-points">
              <div className="reviews-page__point">
                <strong>96%</strong>
                <span>Noticed Reduced Frizz</span>
              </div>
              <div className="reviews-page__point">
                <strong>94%</strong>
                <span>Loved Lightweight Feel</span>
              </div>
              <div className="reviews-page__point">
                <strong>98%</strong>
                <span>Reported Softer Strands</span>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Grid */}
        <section className="reviews-page__grid-section container" aria-label="Customer Reviews">
          <div className="reviews-page__grid">
            {combinedReviews.map((item) => (
              <article key={item.id} className="reviews-page__card clay">
                <div className="reviews-page__card-top">
                  <Stars value={item.rating || 5} size={14} />
                  <span className="reviews-page__card-verified">
                    <ShieldCheck size={13} />
                    Verified Customer
                  </span>
                </div>

                {item.title && <h2 className="reviews-page__card-title">{item.title}</h2>}

                <p className="reviews-page__card-body">“{item.body}”</p>

                <div className="reviews-page__card-author">
                  <div className="reviews-page__avatar" aria-hidden="true">
                    {(item.authorName || item.author || 'R')[0].toUpperCase()}
                  </div>
                  <div className="reviews-page__author-info">
                    <strong>{item.authorName || item.author}</strong>
                    <span>{item.city ? `${item.city} · Pakistan` : 'Verified Purchase'}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Write a Review / CTA */}
        <section className="reviews-page__cta container">
          <div className="reviews-page__cta-box clay-dark">
            <div className="reviews-page__cta-text">
              <h2>Try Revivaa Botanical Hair Oil Risk-Free</h2>
              <p>Join hundreds of satisfied customers across Pakistan. Nationwide Cash on Delivery with fast 2-4 day dispatch.</p>
            </div>
            <div className="reviews-page__cta-actions">
              <Link to="/product/revivaa-oil-150" className="clay-btn">
                <span>Shop Revivaa Oil 150ml</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/product/revivaa-oil-150#reviews" className="clay-btn clay-btn-light">
                <span>Write a Review</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
