import { useEffect, useRef, useState } from 'react'

/**
 * True once the element is (near) the viewport. Used to defer heavy media
 * (video players, iframes) until they are actually needed.
 * Falls back to visible when IntersectionObserver is unavailable.
 */
export default function useInView({ rootMargin = '0px', threshold = 0 } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]) setInView(entries[0].isIntersecting)
      },
      { rootMargin, threshold },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin, threshold])

  return [ref, inView]
}