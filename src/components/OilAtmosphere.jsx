import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { useTheme } from '../theme/ThemeProvider'
import './OilAtmosphere.css'

const POSTER = '/images/oil-splash.jpg'
const VIDEO_LIGHT = '/videos/story-light.mp4'
const VIDEO_DARK = '/videos/story-dark.mp4'

/**
 * Subtle looping oil-splash video layer (low opacity + blur).
 * Atmosphere only — never compete with foreground.
 */
export default function OilAtmosphere({ className = '' }) {
  const wrapRef = useRef(null)
  const videoRef = useRef(null)
  const inView = useInView(wrapRef, { amount: 0.15, once: false })
  const shouldLoad = useInView(wrapRef, { amount: 0.1, once: true })
  const { theme } = useTheme()
  const [ready, setReady] = useState(false)
  const src = theme === 'dark' ? VIDEO_DARK : VIDEO_LIGHT

  useEffect(() => {
    const video = videoRef.current
    if (!video || !shouldLoad) return undefined

    let cancelled = false
    setReady(false)
    video.pause()
    video.src = src
    video.load()

    const onReady = () => {
      if (cancelled) return
      setReady(true)
      if (inView) video.play().catch(() => {})
    }

    if (video.readyState >= 3) onReady()
    else video.addEventListener('canplay', onReady, { once: true })

    return () => {
      cancelled = true
      video.removeEventListener('canplay', onReady)
    }
  }, [src, shouldLoad, inView])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !ready) return
    if (inView) video.play().catch(() => {})
    else video.pause()
  }, [inView, ready])

  return (
    <div
      ref={wrapRef}
      className={`oil-atmosphere ${className}`.trim()}
      aria-hidden
    >
      <img
        src={POSTER}
        alt=""
        className={`oil-atmosphere__poster ${ready ? 'is-hidden' : ''}`}
        width={1200}
        height={800}
        loading="lazy"
        decoding="async"
      />
      {shouldLoad && (
        <video
          ref={videoRef}
          className={`oil-atmosphere__video ${ready ? 'is-ready' : ''}`}
          poster={POSTER}
          muted
          loop
          playsInline
          preload="none"
        />
      )}
    </div>
  )
}
