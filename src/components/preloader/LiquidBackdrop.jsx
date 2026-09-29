import { PRELOADER_MEDIA, PRELOADER_VIDEO, PRELOADER_POSTER } from './mediaConfig'

/**
 * Backdrop behind the logo mark.
 * Swap PRELOADER_MEDIA in mediaConfig.js to use a real muted looping video.
 */
export default function LiquidBackdrop({ reducedMotion = false }) {
  if (PRELOADER_MEDIA === 'video') {
    return (
      <div className="preloader__media" aria-hidden>
        <video
          className="preloader__video"
          poster={PRELOADER_VIDEO.poster}
          muted
          playsInline
          loop
          autoPlay
          preload="metadata"
        >
          <source src={PRELOADER_VIDEO.webm} type="video/webm" />
          <source src={PRELOADER_VIDEO.mp4} type="video/mp4" />
        </video>
      </div>
    )
  }

  return (
    <div className={`preloader__media ${reducedMotion ? 'is-static' : ''}`} aria-hidden>
      <img
        src={PRELOADER_POSTER}
        alt=""
        className="preloader__poster"
        decoding="async"
      />
      <div className="preloader__blob preloader__blob--a" />
      <div className="preloader__blob preloader__blob--b" />
      <div className="preloader__blob preloader__blob--c" />
    </div>
  )
}
