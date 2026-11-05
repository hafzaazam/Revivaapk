import {
  classifyMediaUrl,
  videoEmbedUrl,
  videoThumbUrl,
  isEmbedVideoUrl,
  isInstagramUrl,
} from '../lib/reviews'
import useInView from '../hooks/useInView'
import './ReviewMediaItem.css'

export default function ReviewMediaItem({ item, className = '' }) {
  const [ref, inView] = useInView({ rootMargin: '360px 0px' })

  if (!item?.url) return null
  const kind = item.kind || classifyMediaUrl(item.url) || 'image'

  if (kind === 'image') {
    return (
      <figure className={`review-media review-media--image ${className}`}>
        <img src={item.url} alt="" loading="lazy" />
      </figure>
    )
  }

  /* Video players (embeds / <video>) mount only when the card is near the
     viewport — a poster/thumbnail loads instead until then. */
  const embed = videoEmbedUrl(item.url)
  const isEmbed = isEmbedVideoUrl(item.url)
  const isInstagram = isInstagramUrl(item.url)
  const poster = item.posterUrl || videoThumbUrl(item.url)

  const figureClasses = [
    'review-media',
    'review-media--video',
    isInstagram ? 'review-media--instagram' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (inView) {
    return (
      <figure ref={ref} className={figureClasses}>
        {isEmbed ? (
          <iframe
            src={embed}
            title="Review video"
            loading="lazy"
            frameBorder="0"
            scrolling="no"
            allowTransparency="true"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video
            src={item.url}
            poster={poster || undefined}
            controls
            preload="none"
            playsInline
          />
        )}
      </figure>
    )
  }

  return (
    <figure ref={ref} className={figureClasses}>
      {poster ? (
        <img
          className="review-media__fallback"
          src={poster}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : null}
      <span
        className={`review-media__fallback review-media__fallback--blank ${
          isInstagram ? 'review-media__fallback--instagram' : ''
        }`}
        aria-hidden="true"
      />
    </figure>
  )
}