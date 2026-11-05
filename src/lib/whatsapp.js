import { formatMoney } from '../data/product'

export const WHATSAPP_PHONE = '923440888847'
export const WHATSAPP_DISPLAY_PHONE = '+92 344 0888847'

/**
 * Builds a direct WhatsApp chat URL with encoded pre-filled text.
 */
export function buildWhatsAppLink(text, phone = WHATSAPP_PHONE) {
  const cleanPhone = String(phone).replace(/[^0-9]/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
}

/**
 * Creates a beautifully formatted WhatsApp order message for a product.
 */
export function formatWhatsAppOrderMessage({
  productName,
  variantSize,
  quantity = 1,
  unitPrice,
  currency = 'PKR',
  url,
}) {
  const total = (unitPrice || 0) * (quantity || 1)
  const formattedUnitPrice = unitPrice ? formatMoney(unitPrice, currency) : null
  const formattedTotal = total ? formatMoney(total, currency) : null
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const lines = [
    'Assalam-o-Alaikum / Hi Revivaa! 🌿',
    '',
    'I would like to order:',
    `🛍️ *Product:* ${productName}`,
  ]

  if (variantSize) {
    lines.push(`📏 *Size:* ${variantSize}`)
  }

  lines.push(`🔢 *Quantity:* ${quantity}`)

  if (formattedUnitPrice) {
    lines.push(`💵 *Unit Price:* ${formattedUnitPrice}`)
  }

  if (formattedTotal) {
    lines.push(`💰 *Total Amount:* ${formattedTotal}`)
  }

  if (pageUrl) {
    lines.push(`🔗 *Product Link:* ${pageUrl}`)
  }

  lines.push('')
  lines.push('Please confirm my order and share delivery details. Thank you!')

  return lines.join('\n')
}

/**
 * Creates a formatted inquiry message for a specific product.
 */
export function formatWhatsAppInquiryMessage({
  productName,
  variantSize,
  isOutOfStock = false,
  url,
}) {
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const lines = ['Hi Revivaa! 🌿', '']

  if (isOutOfStock) {
    lines.push('I am interested in this product which is currently out of stock:')
  } else {
    lines.push('I have a question about this product:')
  }

  lines.push(`🛍️ *Product:* ${productName}`)

  if (variantSize) {
    lines.push(`📏 *Size:* ${variantSize}`)
  }

  if (pageUrl) {
    lines.push(`🔗 *Product Link:* ${pageUrl}`)
  }

  lines.push('')
  if (isOutOfStock) {
    lines.push('Could you please let me know when it will be restocked or available?')
  } else {
    lines.push('Could you please assist me with more information?')
  }

  return lines.join('\n')
}

/**
 * Creates a general formatted inquiry message for the floating WhatsApp button.
 */
export function formatWhatsAppGeneralMessage({ pageTitle, url }) {
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const title = pageTitle || (typeof document !== 'undefined' ? document.title : '')

  const lines = [
    'Assalam-o-Alaikum / Hi Revivaa! 🌿',
    '',
    'I would like to inquire about Revivaa Pure Botanical Hair Care.',
  ]

  if (title) {
    lines.push(`📄 *Page:* ${title}`)
  }

  if (pageUrl) {
    lines.push(`🔗 *Link:* ${pageUrl}`)
  }

  lines.push('')
  lines.push('Could you please assist me? Thank you!')

  return lines.join('\n')
}
