import { formatMoney } from '../data/product'

const W = 900
const SCALE = 2
const PAD = 64
const CREAM = '#fffdf6'
const CARD = '#f7f1e4'
const INK = '#201d0a'
const OLIVE = '#52621f'
const MUTED = '#6a6648'
const LINE = '#d9cfae'

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function center(ctx, text, y, font) {
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.fillText(text, W / 2, y)
  ctx.textAlign = 'left'
}

async function ensureFonts() {
  try {
    await document.fonts.ready
    await Promise.all([
      document.fonts.load('600 40px "Fraunces", Georgia, serif'),
      document.fonts.load('500 15px "Outfit", system-ui, sans-serif'),
    ])
  } catch {
    /* fall back to system fonts */
  }
}

export async function downloadReceiptImage({
  trackingCode,
  customerName,
  date,
  items,
  subtotal,
  delivery,
  total,
  currency,
}) {
  await ensureFonts()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const rows = (items || []).map((it) => ({
    name: it.name,
    meta: `${it.size ? `${it.size} · ` : ''}${formatMoney(it.unitPrice, it.currency)} × ${it.qty}`,
    total: formatMoney(it.unitPrice * it.qty, it.currency),
  }))

  const HEADER_H = 150
  const BOX_H = 128
  const LIST_H = rows.length * 58
  const H = PAD + HEADER_H + BOX_H + 34 + 40 + LIST_H + 40 + 132 + 130 + PAD

  canvas.width = W * SCALE
  canvas.height = Math.round(H) * SCALE
  ctx.scale(SCALE, SCALE)

  ctx.fillStyle = CREAM
  ctx.fillRect(0, 0, W, H)

  let y = PAD

  ctx.fillStyle = OLIVE
  ctx.font = '600 46px "Fraunces", Georgia, serif'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('revivaa', PAD, y)

  y += 46
  ctx.fillStyle = INK
  ctx.font = '500 22px "Outfit", system-ui, sans-serif'
  ctx.fillText('Order confirmed', PAD, y)

  y += 30
  ctx.fillStyle = MUTED
  ctx.font = '400 14px "Outfit", system-ui, sans-serif'
  const dateLabel = date ? date.toLocaleString() : new Date().toLocaleString()
  ctx.fillText(`${customerName ? `${customerName} · ` : ''}${dateLabel}`, PAD, y)

  const boxTop = y + 24
  ctx.fillStyle = CARD
  rr(ctx, PAD, boxTop, W - PAD * 2, BOX_H, 22)
  ctx.fill()
  ctx.strokeStyle = LINE
  ctx.lineWidth = 1.5
  ctx.setLineDash([7, 7])
  rr(ctx, PAD + 12, boxTop + 12, W - PAD * 2 - 24, BOX_H - 24, 14)
  ctx.stroke()
  ctx.setLineDash([])

  center(ctx, 'TRACKING ID', boxTop + 44, '600 12px "Outfit", system-ui, sans-serif')
  ctx.fillStyle = OLIVE
  ctx.font = '600 30px ui-monospace, Menlo, Consolas, monospace'
  center(ctx, trackingCode, boxTop + 92, '600 30px ui-monospace, Menlo, Consolas, monospace')
  ctx.fillStyle = INK

  y = boxTop + BOX_H + 34

  ctx.fillStyle = MUTED
  ctx.font = '600 12px "Outfit", system-ui, sans-serif'
  ctx.fillText('ITEM', PAD, y)
  ctx.textAlign = 'right'
  ctx.fillText('TOTAL', W - PAD, y)
  ctx.textAlign = 'left'

  y += 22
  ctx.strokeStyle = LINE
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(PAD, y)
  ctx.lineTo(W - PAD, y)
  ctx.stroke()

  rows.forEach((row) => {
    y += 24
    ctx.fillStyle = INK
    ctx.font = '600 17px "Outfit", system-ui, sans-serif'
    ctx.fillText(row.name, PAD, y)

    y += 21
    ctx.fillStyle = MUTED
    ctx.font = '400 13.5px "Outfit", system-ui, sans-serif'
    ctx.fillText(row.meta, PAD, y)

    ctx.fillStyle = INK
    ctx.font = '500 16px "Outfit", system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(row.total, W - PAD, y)
    ctx.textAlign = 'left'

    y += 13
  })

  y += 14
  ctx.strokeStyle = LINE
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(PAD, y)
  ctx.lineTo(W - PAD, y)
  ctx.stroke()

  const totals = [
    { label: 'Subtotal', value: formatMoney(subtotal, currency), bold: false },
    { label: 'Delivery', value: formatMoney(delivery, currency), bold: false },
  ]
  totals.forEach((t) => {
    y += 40
    ctx.fillStyle = MUTED
    ctx.font = '500 15px "Outfit", system-ui, sans-serif'
    ctx.fillText(t.label, PAD, y)
    ctx.fillStyle = INK
    ctx.textAlign = 'right'
    ctx.fillText(t.value, W - PAD, y)
    ctx.textAlign = 'left'
  })

  y += 34
  ctx.strokeStyle = OLIVE
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(PAD, y)
  ctx.lineTo(W - PAD, y)
  ctx.stroke()

  y += 34
  ctx.fillStyle = OLIVE
  ctx.font = '600 17px "Outfit", system-ui, sans-serif'
  ctx.fillText('TOTAL', PAD, y)
  ctx.fillStyle = OLIVE
  ctx.font = '700 20px "Outfit", system-ui, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(formatMoney(total, currency), W - PAD, y)
  ctx.textAlign = 'left'

  y += 72
  ctx.fillStyle = OLIVE
  ctx.font = '500 26px "Fraunces", Georgia, serif'
  center(ctx, 'Thank you for your order', y, '500 26px "Fraunces", Georgia, serif')

  y += 34
  ctx.fillStyle = MUTED
  ctx.font = '400 13px "Outfit", system-ui, sans-serif'
  center(ctx, 'Keep this receipt — track your order anytime on revivaa', y, '400 13px "Outfit", system-ui, sans-serif')

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const code = String(trackingCode || 'order').replace(/[^a-zA-Z0-9-]/g, '')
    a.download = `revivaa-${code}-receipt.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, 'image/png')
}