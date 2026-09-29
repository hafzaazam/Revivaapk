export const CART_BOUNCE_EVENT = 'revivaa:cart-bounce'

function visibleCartTarget() {
  const candidates = [
    document.querySelector('.nav__cart'),
    document.querySelector('[data-cart]'),
  ]
  for (const el of candidates) {
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) return el
  }
  return candidates[0] || null
}

export function flyImageToCart({ img, fromRect, reduceMotion = false }) {
  const target = visibleCartTarget()
  if (!target || !img || !fromRect || fromRect.width <= 0) return false

  const tr = target.getBoundingClientRect()
  const tx = tr.left + tr.width / 2 - (fromRect.left + fromRect.width / 2)
  const ty = tr.top + tr.height / 2 - (fromRect.top + fromRect.height / 2)

  const el = document.createElement('img')
  el.src = img
  el.alt = ''
  Object.assign(el.style, {
    position: 'fixed',
    left: `${fromRect.left}px`,
    top: `${fromRect.top}px`,
    width: `${fromRect.width}px`,
    height: `${fromRect.height}px`,
    objectFit: 'cover',
    borderRadius: '20px',
    zIndex: '2000',
    pointerEvents: 'none',
    willChange: 'transform, opacity, border-radius',
    boxShadow: '0 24px 44px rgba(0, 0, 0, 0.35)',
  })
  document.body.appendChild(el)

  const anim = el.animate(
    [
      {
        transform: 'translate(0px, 0px) scale(1) rotate(0deg)',
        borderRadius: '20px',
        opacity: 1,
        offset: 0,
      },
      {
        transform: `translate(${tx * 0.5}px, ${ty * 0.35 - 150}px) scale(0.7) rotate(40deg)`,
        borderRadius: '50%',
        opacity: 1,
        offset: 0.45,
      },
      {
        transform: `translate(${tx}px, ${ty}px) scale(0.05) rotate(120deg)`,
        borderRadius: '50%',
        opacity: 0.2,
        offset: 1,
      },
    ],
    {
      duration: reduceMotion ? 0 : 820,
      easing: 'cubic-bezier(0.18, 0.66, 0.28, 1)',
      fill: 'forwards',
    },
  )

  anim.onfinish = () => {
    el.remove()
    window.dispatchEvent(new Event(CART_BOUNCE_EVENT))
  }

  return true
}