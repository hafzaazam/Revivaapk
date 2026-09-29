import { useEffect, useRef } from 'react'
import './ScrollProgress.css'

export default function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    let max = 0
    let frame = 0

    const measure = () => {
      const doc = document.documentElement
      max = Math.max(0, doc.scrollHeight - window.innerHeight)
    }

    measure()

    const update = () => {
      frame = 0
      if (barRef.current) {
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
        barRef.current.style.transform = `scaleX(${p})`
      }
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    const onResize = () => {
      measure()
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="scroll-progress" aria-hidden>
      <div ref={barRef} className="scroll-progress__fill" style={{ transform: 'scaleX(0)' }} />
    </div>
  )
}
