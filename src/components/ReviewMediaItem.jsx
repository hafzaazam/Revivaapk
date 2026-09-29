import { classifyMediaUrl, videoEmbedUrl, videoThumbUrl } from '../lib/reviews'
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
  const isEmbed = embed !== item.url && /youtube|player\.vimeo/i.test(embed)
  const poster = item.posterUrl || videoThumbUrl(item.url)

  if (inView) {
    return (
      <figure ref={ref} className={`review-media review-media--video ${className}`}>
        {isEmbed ? (
          <iframe
            src={embed}
            title="Review video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
    <figure ref={ref} className={`review-media review-media--video ${className}`}>
      {poster ? (
        <img className="review-media__fallback" src={poster} alt="" loading="lazy" />
      ) : (
        <span className="review-media__fallback review-media__fallback--blank" aria-hidden="true" />
      )}
    </figure>
  )
}