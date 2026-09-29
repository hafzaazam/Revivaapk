import { useCallback, useEffect, useRef } from 'react'
import logoUrl from '../assets/logo-r.png'
import LiquidBackdrop from './preloader/LiquidBackdrop'
import './Preloader.css'

const WIPE_EASE = 'cubic-bezier(0.6, 0.04, 0.3, 1)'
const WIPE_MS_FULL = 1200
const WIPE_MS_LITE = 520
const FADE_MS = 400

/**
 * Full-viewport boot overlay with viscous oil-curtain exit.
 */
export default function Preloader({
  progress = 0,
  phase = 'loading',
  mode = 'full',
  reducedMotion = false,
  onExitComplete,
}) {
  const rootRef = useRef(null)
  const exitDoneRef = useRef(false)
  const exiting = phase === 'exiting'
  const lite = mode === 'lite'

  const handleComplete = useCallback(() => {
    if (exitDoneRef.current) return
    exitDoneRef.current = true
    onExitComplete?.()
  }, [onExitComplete])

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  const wipeDuration = reducedMotion ? FADE_MS : isMobile ? 400 : lite ? WIPE_MS_LITE : WIPE_MS_FULL

  useEffect(() => {
    if (!exiting) return undefined

    const t = window.setTimeout(handleComplete, wipeDuration + 40)
    return () => window.clearTimeout(t)
  }, [exiting, wipeDuration, handleComplete])

  const rootClass = [
    'preloader',
    lite ? 'preloader--lite' : 'preloader--full',
    exiting ? 'is-exiting' : '',
    reducedMotion ? 'is-reduced' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={rootRef}
      className={rootClass}
      role={exiting ? 'status' : 'progressbar'}
      aria-busy={!exiting}
      aria-valuemin={exiting ? undefined : 0}
      aria-valuemax={exiting ? undefined : 100}
      aria-valuenow={exiting ? undefined : progress}
      aria-valuetext={exiting ? 'Loading complete' : `Loading, ${progress} percent`}
      aria-label="Loading"
      style={{
        '--wipe-ease': WIPE_EASE,
        '--wipe-ms': `${wipeDuration}ms`,
      }}
    >
      <div
        className="preloader__panel"
        onAnimationEnd={(e) => {
          if (exiting && (e.target === e.currentTarget || e.animationName?.includes('fade') || e.animationName?.includes('wipe'))) {
            handleComplete()
          }
        }}
      >
        {!lite && <LiquidBackdrop reducedMotion={reducedMotion} />}

        <div className="preloader__content">
          {!lite && (
            <div className="preloader__mark">
              <img
                src={logoUrl}
                alt=""
                className="preloader__logo"
                width={120}
                height={120}
                decoding="async"
                draggable={false}
              />
              <span className="preloader__sr-only">revivaa</span>
            </div>
          )}

          <div className="preloader__bar" aria-hidden>
            <div
              className="preloader__fill"
              style={{ transform: `scaleX(${Math.min(100, progress) / 100})` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
