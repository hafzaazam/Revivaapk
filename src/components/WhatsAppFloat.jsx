import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import WhatsAppIcon from './WhatsAppIcon'
import { buildWhatsAppLink, formatWhatsAppGeneralMessage, WHATSAPP_DISPLAY_PHONE } from '../lib/whatsapp'
import './WhatsAppFloat.css'

export default function WhatsAppFloat() {
  const location = useLocation()
  const [mounted, setMounted] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Slight delay so it appears smoothly after initial paint
    const timer = setTimeout(() => setMounted(true), 600)
    return () => clearTimeout(timer)
  }, [])

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null
  }

  const handleOpen = () => {
    const message = formatWhatsAppGeneralMessage({
      pageTitle: typeof document !== 'undefined' ? document.title : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
    })
    const url = buildWhatsAppLink(message)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className={`whatsapp-float ${mounted ? 'is-mounted' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`whatsapp-float__tooltip ${showTooltip ? 'is-visible' : ''}`}
        role="tooltip"
        id="whatsapp-float-tooltip"
      >
        <span className="whatsapp-float__tooltip-status" aria-hidden="true" />
        <div className="whatsapp-float__tooltip-text">
          <strong>Chat with us</strong>
          <small>{WHATSAPP_DISPLAY_PHONE}</small>
        </div>
      </div>

      <button
        type="button"
        className="whatsapp-float__btn"
        onClick={handleOpen}
        aria-label={`Chat with Revivaa on WhatsApp (${WHATSAPP_DISPLAY_PHONE})`}
        aria-describedby="whatsapp-float-tooltip"
      >
        <span className="whatsapp-float__pulse" aria-hidden="true" />
        <WhatsAppIcon size={28} className="whatsapp-float__icon" />
      </button>
    </div>
  )
}
