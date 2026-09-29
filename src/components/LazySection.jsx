import { useEffect, useRef, useState, Suspense } from 'react'

/**
 * Defers mounting and dynamic import resolution of below-the-fold components
 * until they approach the viewport (400px rootMargin).
 * Prevents loading all chunks and assets simultaneously on initial page load.
 */
export default function LazySection({
  children,
  minHeight = '280px',
  rootMargin = '400px',
  className = '',
}) {
  const ref = useRef(null)
  const [shouldRender, setShouldRender] = useState(() => {
    return typeof window === 'undefined' || typeof IntersectionObserver === 'undefined'
  })

  useEffect(() => {
    if (shouldRender) return undefined
    const node = ref.current
    if (!node) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div
      ref={ref}
      className={className}
      style={shouldRender ? undefined : { minHeight }}
    >
      {shouldRender ? (
        <Suspense fallback={<div style={{ minHeight }} aria-hidden="true" />}>
          {children}
        </Suspense>
      ) : null}
    </div>
  )
}
