import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Play,
  Star,
  BadgeCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'
import {
  fetchInfluencerReels,
  classifyMediaUrl,
  videoThumbUrl,
  videoEmbedUrl,
  isEmbedVideoUrl,
  isInstagramUrl,
} from '../lib/reviews'
import ScrollReveal from './ScrollReveal'
import './InfluencerReels.css'

function InstagramIcon({ size = 16, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

const CURATED_CREATORS = [
  {
    id: 'creator-1',
    authorName: 'Mahnoor Tariq',
    handle: '@mahnoor.glam',
    city: 'Lahore',
    badge: 'Verified Creator',
    followers: '142K',
    views: '48.2K',
    rating: 5,
    concern: 'Frizz & Humidity',
    body: 'Humidity in Lahore used to ruin my blowout. Two drops of Revivaa sealed my cuticles without making my crown limp.',
    fullReview:
      'Humidity in Lahore used to ruin my blowout in 20 minutes. Two drops of Revivaa smoothed every flyaway without making my roots limp. My split ends feel noticeably sealed and the glass-like shine lasts through the 3rd wash.',
    poster:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=k5q6z7tK6pA',
    productName: 'Revivaa Botanical Hair Oil 150ml',
    productSlug: 'revivaa-oil-150',
  },
  {
    id: 'creator-2',
    authorName: 'Dr. Aiman Qureshi',
    handle: '@drsikincare.pk',
    city: 'Karachi',
    badge: 'Trichology Specialist',
    followers: '89K',
    views: '62.1K',
    rating: 5,
    concern: 'Scalp Health',
    body: 'Checked the formulation: 100% cold-pressed without mineral oil fillers. Rosemary and black seed are in active ratios.',
    fullReview:
      'I checked the formulation in detail: 100% cold-pressed botanicals with zero mineral oil or silicone fillers. The concentration of rosemary oil and kalonji (black seed) is potent enough for real follicle stimulation and dandruff reduction.',
    poster:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=gT8oBvXQ4pM',
    productName: 'Revivaa Scalp Therapy 150ml',
    productSlug: 'revivaa-oil-150',
  },
  {
    id: 'creator-3',
    authorName: 'Zara Sheikh',
    handle: '@zara.hairdiaries',
    city: 'Islamabad',
    badge: 'Curly Hair Educator',
    followers: '210K',
    views: '93.4K',
    rating: 5,
    concern: 'Curl Definition',
    body: 'Finally an oil that doesn’t weigh down 3B curls! Gives that mirror shine and locks moisture after my wash routine.',
    fullReview:
      'Finally an oil that doesn’t weigh down 3B curls! Gives that mirror shine and locks moisture after my wash routine. My curls stay bouncy, clumped, and completely frizz-free for 4 full days.',
    poster:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=wXhXbN_XGbg',
    productName: 'Revivaa Botanical Hair Oil 150ml',
    productSlug: 'revivaa-oil-150',
  },
  {
    id: 'creator-4',
    authorName: 'Hira Baig',
    handle: '@hirabaigofficial',
    city: 'Faisalabad',
    badge: 'Bridal & Styling',
    followers: '175K',
    views: '36.8K',
    rating: 5,
    concern: 'Heat Repair',
    body: 'After months of bridal shoots and heat styling, this oil literally resurrected my ends. The herbal aroma is pure luxury.',
    fullReview:
      'After months of continuous bridal shoots, curling irons, and heavy teasing, this oil literally resurrected my ends. The herb aroma is so luxurious, and my hairdresser asked what salon treatment I had done!',
    poster:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=Vl3r0_Qy4gE',
    productName: 'Revivaa Botanical Hair Oil 150ml',
    productSlug: 'revivaa-oil-150',
  },
  {
    id: 'creator-5',
    authorName: 'Anam Rehman',
    handle: '@anamrehman.lifestyle',
    city: 'Rawalpindi',
    badge: 'Postpartum Haircare',
    followers: '95K',
    views: '54.0K',
    rating: 5,
    concern: 'Postpartum Shedding',
    body: 'Postpartum shedding made my temples so thin. 4 weeks of warm scalp massages and baby hairs are visibly sprouting.',
    fullReview:
      'Postpartum shedding made my temples so thin and stressful. 4 weeks of warm scalp massage with Revivaa twice a week and baby hairs are visibly sprouting along my hairline. The brush has barely any loose hairs now.',
    poster:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=2Tz8f0FqP-4',
    productName: 'Revivaa Scalp & Root 150ml',
    productSlug: 'revivaa-oil-150',
  },
  {
    id: 'creator-6',
    authorName: 'Fatima Noor',
    handle: '@fatima.organics',
    city: 'Multan',
    badge: 'Clean Beauty Reviewer',
    followers: '118K',
    views: '41.9K',
    rating: 5,
    concern: 'Gloss & Strength',
    body: 'The amber dropper bottle, pure cold-pressed fragrance, zero mineral oil residue. It rivals luxury French oils at 1/4 the price.',
    fullReview:
      'The amber glass dropper bottle, the earthy herbal aroma, zero mineral oil residue. It rivals luxury international French and Ayurvedic oils at a fraction of the cost. A permanent holy grail on my vanity.',
    poster:
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=nO3_DkWk-6o',
    productName: 'Revivaa Botanical Hair Oil 150ml',
    productSlug: 'revivaa-oil-150',
  },
]

export default function InfluencerReels() {
  const [creators, setCreators] = useState(CURATED_CREATORS)
  const [activeModal, setActiveModal] = useState(null)
  const railRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Merge live Supabase influencer reels if available
  useEffect(() => {
    let alive = true
    fetchInfluencerReels(6).then(({ data }) => {
      if (!alive || !data?.length) return
      const mapped = data.map((reel, idx) => {
        const videoMedia = reel.media?.find(
          (m) => m.kind === 'video' || classifyMediaUrl(m.url) === 'video'
        )
        const imageMedia = reel.media?.find(
          (m) => m.kind === 'image' || classifyMediaUrl(m.url) === 'image'
        )

        const videoUrl =
          videoMedia?.url ||
          (reel.media?.[0]?.url && classifyMediaUrl(reel.media[0].url) === 'video'
            ? reel.media[0].url
            : null)

        // Prioritize explicit cover image -> auto video thumbnail (YouTube) -> review image
        const poster =
          videoMedia?.posterUrl ||
          videoMedia?.poster_url ||
          (videoUrl ? videoThumbUrl(videoUrl) : null) ||
          imageMedia?.url ||
          null

        const fallback = CURATED_CREATORS[idx % CURATED_CREATORS.length]

        return {
          id: reel.id || `live-${idx}`,
          authorName: reel.authorName || fallback.authorName,
          handle: reel.handle || fallback.handle,
          city: 'Pakistan',
          badge:
            reel.reviewerType === 'influencer' ? 'Verified Creator' : 'Verified Customer',
          followers: fallback.followers,
          views: fallback.views,
          rating: reel.rating || 5,
          concern: reel.title || fallback.concern,
          body: reel.body || reel.title || fallback.body,
          fullReview: reel.body || fallback.fullReview,
          poster: poster || (!videoUrl ? fallback.poster : null),
          videoUrl: videoUrl || fallback.videoUrl,
          productName: reel.productName || fallback.productName,
          productSlug: reel.productSlug || fallback.productSlug,
        }
      })
      setCreators(mapped)
    })
    return () => {
      alive = false
    }
  }, [])

  const checkScroll = useCallback(() => {
    const el = railRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  const scrollBy = (offset) => {
    if (!railRef.current) return
    railRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  // Handle escape key to close video modal
  useEffect(() => {
    if (!activeModal) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setActiveModal(null)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [activeModal])

  return (
    <section className="reels" aria-label="Influencer and Creator Reviews">
      <div className="reels__inner">
        {/* Section Heading */}
        <ScrollReveal variant="fade-up">
          <div className="reels__head">
            <div className="reels__badge">
              <Sparkles size={13} className="reels__badge-icon" />
              <span>Creator Circle · Verified Drops</span>
            </div>
            <h2 className="reels__title">
              Loved by <em>Creators</em>,<br className="reels__title-br" />Proven on Real Hair
            </h2>
            <p className="reels__lead">
              Real creators, unfiltered results with Revivaa’s 13-botanical cold-pressed elixir.
            </p>

            {/* Social Trust Metrics */}
            <div className="reels__metrics" role="list" aria-label="Creator Trust Metrics">
              <div className="reels__metric" role="listitem">
                <strong>4.9 ★</strong>
                <span>Rating</span>
              </div>
              <div className="reels__metric-divider" aria-hidden="true" />
              <div className="reels__metric" role="listitem">
                <strong>100+</strong>
                <span>Creators</span>
              </div>
              <div className="reels__metric-divider" aria-hidden="true" />
              <div className="reels__metric" role="listitem">
                <strong>100%</strong>
                <span>Cold-Pressed</span>
              </div>
              <div className="reels__metric-divider" aria-hidden="true" />
              <div className="reels__metric" role="listitem">
                <strong>0%</strong>
                <span>Mineral Oils</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Rail Controls for Desktop & Mobile */}
        <div className="reels__nav-bar">
          <span className="reels__count-label">
            Showing {creators.length} verified creator reels
          </span>
          <div className="reels__arrows" aria-label="Review slider controls">
            <button
              type="button"
              className="reels__arrow"
              onClick={() => scrollBy(-240)}
              disabled={!canScrollLeft}
              aria-label="Scroll reviews left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="reels__arrow"
              onClick={() => scrollBy(240)}
              disabled={!canScrollRight}
              aria-label="Scroll reviews right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Responsive Small Cards Track */}
        <div className="reels__rail" ref={railRef}>
          {creators.map((c) => (
            <article
              key={c.id}
              className="reels__card-small"
              onClick={() => setActiveModal(c)}
              role="button"
              tabIndex={0}
              aria-label={`Watch ${c.authorName}'s review of ${c.productName}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setActiveModal(c)
                }
              }}
            >
              {/* Media Thumbnail */}
              <div className="reels__thumb">
                {c.poster ? (
                  <img
                    src={c.poster}
                    alt={c.authorName}
                    className="reels__img"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fb = e.currentTarget.parentElement?.querySelector('.reels__placeholder')
                      if (fb) fb.style.display = 'flex'
                    }}
                  />
                ) : null}

                {!c.poster && !isEmbedVideoUrl(c.videoUrl) && c.videoUrl ? (
                  <video
                    src={c.videoUrl}
                    preload="metadata"
                    muted
                    playsInline
                    className="reels__img reels__video-thumb"
                  />
                ) : null}

                <div
                  className={`reels__placeholder ${
                    isInstagramUrl(c.videoUrl) ? 'reels__placeholder--instagram' : ''
                  }`}
                  style={{
                    display:
                      c.poster || (!isEmbedVideoUrl(c.videoUrl) && c.videoUrl)
                        ? 'none'
                        : 'flex',
                  }}
                >
                  <span className="reels__placeholder-brand">Revivaa</span>
                  <span className="reels__placeholder-sub">
                    {isInstagramUrl(c.videoUrl) ? 'Instagram Reel' : 'Creator Reel'}
                  </span>
                </div>

                {/* Overlaid Badges */}
                <div className="reels__thumb-top">
                  <span
                    className={`reels__chip-reel ${
                      isInstagramUrl(c.videoUrl) ? 'reels__chip-reel--ig' : ''
                    }`}
                  >
                    <Play size={10} fill="currentColor" />
                    {isInstagramUrl(c.videoUrl) ? 'INSTAGRAM REEL' : 'REEL'}
                  </span>
                  <span className="reels__views">
                    <Eye size={10} />
                    {c.views}
                  </span>
                </div>

                {/* Play Button Overlay */}
                <div className="reels__play-btn" aria-hidden="true">
                  <Play size={16} fill="currentColor" />
                </div>

                {/* Bottom Overlay with Creator & Rating */}
                <div className="reels__thumb-bottom">
                  <div className="reels__stars" aria-label={`${c.rating} out of 5 stars`}>
                    {[...Array(c.rating)].map((_, i) => (
                      <Star key={i} size={11} fill="#f2970c" color="#f2970c" />
                    ))}
                  </div>
                  <p className="reels__handle">
                    <span>{c.handle}</span>
                    <BadgeCheck size={13} className="reels__verified-icon" />
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="reels__card-body">
                <span className="reels__concern-tag">#{c.concern.replace(/\s+/g, '')}</span>
                <p className="reels__card-quote">“{c.body}”</p>
                <div className="reels__card-footer">
                  <span className="reels__creator-name">{c.authorName}</span>
                  <span className="reels__creator-city">{c.city}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA Bar */}
        <div className="reels__footer-cta">
          <p>Are you a beauty creator or hairstylist? Try Revivaa and share your routine.</p>
          <Link to="/contact" className="reels__collab-link">
            Join the Creator Drop →
          </Link>
        </div>
      </div>

      {/* Luxury Video Modal */}
      {activeModal && (
        <div
          className="reels-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-creator-title"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="reels-modal__dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="reels-modal__close"
              onClick={() => setActiveModal(null)}
              aria-label="Close review video"
            >
              <X size={20} />
            </button>

            {/* Video Player */}
            {(() => {
              const embed = videoEmbedUrl(activeModal.videoUrl)
              const isEmbed = isEmbedVideoUrl(activeModal.videoUrl)
              const isInstagram = isInstagramUrl(activeModal.videoUrl)
              return (
                <div
                  className={`reels-modal__video-wrap ${
                    isInstagram ? 'reels-modal__video-wrap--instagram' : ''
                  }`}
                >
                  {isEmbed ? (
                    <iframe
                      src={
                        isInstagram
                          ? embed
                          : `${embed}${embed.includes('?') ? '&' : '?'}autoplay=1&rel=0`
                      }
                      title={`${activeModal.authorName}'s review video`}
                      className={`reels-modal__video reels-modal__iframe ${
                        isInstagram ? 'reels-modal__iframe--instagram' : ''
                      }`}
                      frameBorder="0"
                      scrolling="no"
                      allowTransparency="true"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      key={activeModal.videoUrl}
                      src={activeModal.videoUrl}
                      poster={activeModal.poster || undefined}
                      controls
                      autoPlay
                      playsInline
                      className="reels-modal__video"
                    />
                  )}
                </div>
              )
            })()}

            {/* Modal Creator Details */}
            <div className="reels-modal__info">
              <div className="reels-modal__creator-header">
                {activeModal.poster ? (
                  <img
                    src={activeModal.poster}
                    alt={activeModal.authorName}
                    className="reels-modal__avatar"
                  />
                ) : (
                  <div className="reels-modal__avatar reels-modal__avatar--fallback">
                    {activeModal.authorName?.[0] || 'R'}
                  </div>
                )}
                <div className="reels-modal__meta">
                  <div className="reels-modal__name-row">
                    <h3 id="modal-creator-title">{activeModal.authorName}</h3>
                    <BadgeCheck size={16} className="reels__verified-icon" />
                  </div>
                  <p className="reels-modal__handle-row">
                    <span>{activeModal.handle}</span> · <span>{activeModal.city}</span>
                  </p>
                  <span className="reels-modal__badge">
                    <ShieldCheck size={12} /> {activeModal.badge} ({activeModal.followers})
                  </span>
                </div>
              </div>

              {/* Stars & Tag */}
              <div className="reels-modal__rating-bar">
                <div className="reels__stars">
                  {[...Array(activeModal.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="#f2970c" color="#f2970c" />
                  ))}
                </div>
                <span className="reels__concern-tag">#{activeModal.concern.replace(/\s+/g, '')}</span>
              </div>

              {/* Full Review */}
              <blockquote className="reels-modal__quote">
                “{activeModal.fullReview}”
              </blockquote>

              {/* Action Button */}
              <div className="reels-modal__actions">
                <Link
                  to={`/product/${activeModal.productSlug}`}
                  className="reels-modal__cta"
                  onClick={() => setActiveModal(null)}
                >
                  <ShoppingBag size={16} />
                  <span>Shop This Routine · {activeModal.productName}</span>
                </Link>
                {isInstagramUrl(activeModal.videoUrl) && (
                  <a
                    href={activeModal.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reels-modal__ig-link"
                  >
                    <InstagramIcon size={15} />
                    <span>Watch Reel on Instagram</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}