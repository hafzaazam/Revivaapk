import { useEffect, useRef, useState } from 'react'

/**
 * Pointer position as a ref, not state.
 *
 * The previous version called `setPos` on every `mousemove`, which re-rendered
 * the component tree 60-100x/second purely to move one absolutely-positioned
 * element. Callers read `position.current` inside their own rAF loop instead.
 *
 * @returns {{ current: { x: number, y: number } }}
 */
export function useMousePositionRef() {
  const position = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      position.current.x = e.clientX
      position.current.y = e.clientY
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return position
}

/**
 * Page scroll progress in 0..1.
 *
 * Reads `scrollHeight` once and re-measures only on resize. Reading it inside
 * the scroll handler forces a synchronous layout on every scroll event
 * (layout thrashing); the document height cannot change between resizes for a
 * statically-laid-out page, so a cached value is both correct and free.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let max = 0
    let frame = 0

    const measure = () => {
      const doc = document.documentElement
      max = Math.max(0, doc.scrollHeight - window.innerHeight)
    }

    const publish = () => {
      frame = 0
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(publish)
    }

    const onResize = () => {
      measure()
      publish()
    }

    measure()
    publish()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return progress
}

/** One-shot "has entered viewport" flag. */
export function useInView(ref, threshold = 0.18) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])

  return visible
}
