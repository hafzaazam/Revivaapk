import { useCallback, useEffect, useRef } from 'react'
import { HERO_VIDEO } from './mediaConfig'
import useInView from '../../hooks/useInView'

/**
 * Full-bleed oil backdrop — looping video background.
 * Video plays while the hero is on screen and pauses when scrolled away.
 *
 * `parallaxRef` is attached to the same wrapper that useParallax writes
 * `transform` to each frame, so pointer movement never re-renders the video.
 * Both refs are merged onto one node because a DOM element takes a single ref.
 */
export default function HeroBackdrop({
  parallaxRef,
  reducedMotion = false,
  ready = false,
}) {
  const videoRef = useRef(null)
  const [heroRef, heroInView] = useInView({ rootMargin: '0px' })

  const setNode = useCallback(
    (node) => {
      heroRef.current = node
      if (parallaxRef) parallaxRef.current = node
    },
    [heroRef, parallaxRef],
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    video.muted = true
    video.defaultMuted = true
    video.setAttribute('playsinline', 'true')
    video.setAttribute('webkit-playsinline', 'true')

    const tryPlay = () => {
      video.play().catch(() => {
        // Mobile low-power mode or battery saver may block auto-play until interaction
        const onFirstInteract = () => {
          video.play().catch(() => {})
          window.removeEventListener('touchstart', onFirstInteract)
          window.removeEventListener('click', onFirstInteract)
          window.removeEventListener('scroll', onFirstInteract)
        }
        window.addEventListener('touchstart', onFirstInteract, { once: true, passive: true })
        window.addEventListener('click', onFirstInteract, { once: true, passive: true })
        window.addEventListener('scroll', onFirstInteract, { once: true, passive: true })
      })
    }

    if (heroInView && !reducedMotion) {
      tryPlay()
    } else {
      video.pause()
    }
  }, [heroInView, reducedMotion, ready])

  return (
    <div className="hero__media" ref={setNode} aria-hidden>
      <video
        ref={videoRef}
        className="hero__video"
        muted
        playsInline
        webkit-playsinline="true"
        loop
        autoPlay={!reducedMotion}
        preload="metadata"
        tabIndex={-1}
        disablePictureInPicture
      >
        <source src={HERO_VIDEO.mp4} type="video/mp4" />
      </video>
      <div className="hero__veil" />
    </div>
  )
}
