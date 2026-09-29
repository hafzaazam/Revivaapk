import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Star } from 'lucide-react'
import { fetchHomeTestimonials } from '../lib/reviews'
import ScrollReveal from './ScrollReveal'
import ReviewMediaItem from './ReviewMediaItem'
import Stars from './Stars'
import './Testimonials.css'

function initial(name = '') {
  return (name.trim()[0] || 'R').toUpperCase()
}

export default function Testimonials() {
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    fetchHomeTestimonials(9).then(({ data }) => {
      if (!alive) return
      setItems(data)
      setLoaded(true)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section id="reviews" className="testimonials section" aria-label="Customer Reviews & Testimonials">
      <div className="testimonials__inner container">
        <ScrollReveal variant="mask-wipe-right">
          <div className="testimonials__head">
            <p className="section-label">Verified Experiences</p>
            <h2 className="section-title">
              What Our Customers Say
              <em> · Real Reviews &amp; Results</em>
            </h2>
            <p className="section-lead testimonials__lead">
              Discover how Revivaa’s cold-pressed 13-botanical elixir transforms daily hair care rituals across Pakistan with lasting softness, root vitality, and brilliant shine.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="stagger-children" stagger={0.08}>
          <div className="testimonials__grid">
            {loaded &&
              items.map((item) => (
                <article className="testimonials__card" key={item.id}>
                  {item.media[0] && (
                    <div className="testimonials__thumb">
                      <ReviewMediaItem item={item.media[0]} />
                    </div>
                  )}
                  <div className="testimonials__body">
                    <Stars value={item.rating} size={13} />
                    <p className="testimonials__quote">“{item.body}”</p>
                    <div className="testimonials__author">
                      <span className="testimonials__avatar" aria-hidden="true">
                        {initial(item.authorName)}
                      </span>
                      <span className="testimonials__name-wrap">
                        <strong className="testimonials__name">{item.authorName}</strong>
                        {item.verifiedPurchase && (
                          <span className="testimonials__verified">
                            <ShieldCheck size={12} /> Verified purchase
                          </span>
                        )}
                        {item.productName && (
                          <Link
                            to={`/product/${item.productSlug || item.productId}`}
                            className="testimonials__product"
                          >
                            {item.productName}
                          </Link>
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              ))}

            {loaded && items.length === 0 && (
              <article className="testimonials__card testimonials__card--cta">
                <div className="testimonials__body">
                  <div className="testimonials__fallback-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill="#f2970c" color="#f2970c" />
                    ))}
                  </div>
                  <p className="testimonials__quote">
                    “It quieted my frizz completely. Three washes in and I stopped reaching for my
                    heat styling tools. Truly lightweight and smells heavenly.”
                  </p>
                  <div className="testimonials__author">
                    <span className="testimonials__avatar" aria-hidden="true">
                      R
                    </span>
                    <span className="testimonials__name-wrap">
                      <strong className="testimonials__name">Ayesha K. — Lahore</strong>
                      <Link to="/shop" className="testimonials__product">
                        Verified Revivaa 150ml Customer
                      </Link>
                    </span>
                  </div>
                </div>
              </article>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.15} className="testimonials__footer-cta">
          <div className="testimonials__cta-box clay-cream">
            <div className="testimonials__cta-text">
              <h3>Have you tried Revivaa Botanical Hair Oil?</h3>
              <p>Share your review and hair transformation journey with our growing community.</p>
            </div>
            <Link to="/product/revivaa-oil-150#reviews" className="testimonials__cta-btn clay-btn">
              Write a Review
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}