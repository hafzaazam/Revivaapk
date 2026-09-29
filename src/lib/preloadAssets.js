/**
 * Lightweight asset preloader.
 * Tracks images, fonts, and optional media; reports 0–1 progress.
 */

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve({ ok: true, src })
    img.onerror = () => resolve({ ok: false, src })
    img.src = src
  })
}

function loadMedia(src) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    /* metadata only — full buffer waits until the player needs it */
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    const done = () => resolve({ ok: true, src })
    video.addEventListener('loadeddata', done, { once: true })
    video.addEventListener('error', () => resolve({ ok: false, src }), { once: true })
    const t = window.setTimeout(() => resolve({ ok: true, src }), 2500)
    video.addEventListener(
      'loadeddata',
      () => window.clearTimeout(t),
      { once: true },
    )
    video.src = src
    video.load()
  })
}

function loadOne(src) {
  const lower = src.toLowerCase()
  if (/\.(mp4|webm|ogg)(\?|$)/.test(lower)) return loadMedia(src)
  return loadImage(src)
}

/**
 * @param {string[]} urls
 * @param {(progress: number) => void} onProgress — 0..1
 * @returns {Promise<void>}
 */
export async function preloadAssets(urls = [], onProgress = () => {}) {
  const list = urls.filter(Boolean)
  const total = list.length + 1 // + document.fonts
  if (total <= 1 && list.length === 0) {
    try {
      await document.fonts.ready
    } catch {
      /* ignore */
    }
    onProgress(1)
    return
  }

  let done = 0
  const bump = () => {
    done += 1
    onProgress(Math.min(1, done / total))
  }

  const fontTask = (document.fonts?.ready ?? Promise.resolve())
    .then(bump)
    .catch(bump)

  const assetTasks = list.map((src) => loadOne(src).then(bump))

  await Promise.all([fontTask, ...assetTasks])
  onProgress(1)
}

/**
 * Non-linear simulated progress that feels like real loading.
 * Fast early gains, long mid plateau, then a finish push.
 *
 * The callback only fires when the rounded percentage actually changes, so the
 * caller's setState runs ~100 times total instead of once per animation frame.
 *
 * @param {(n: number) => void} onProgress — 0..100
 * @param {{ minMs?: number, maxMs?: number }} opts
 */
export function simulateProgress(onProgress, opts = {}) {
  const minMs = opts.minMs ?? 1600
  const maxMs = opts.maxMs ?? 2800
  const duration = minMs + Math.random() * (maxMs - minMs)

  return new Promise((resolve) => {
    const start = performance.now()
    let last = -1

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      // Ease: quick start, viscous middle, snap finish
      const eased =
        t < 0.55
          ? 0.72 * (t / 0.55) ** 0.65
          : t < 0.85
            ? 0.72 + 0.18 * ((t - 0.55) / 0.3)
            : 0.9 + 0.1 * ((t - 0.85) / 0.15) ** 0.5

      // Only fire on an actual change. Calling onProgress every frame enqueued
      // ~60 setState calls/sec, and even with React's bail-out that is real
      // scheduler traffic for a value that moves in 1% steps.
      const value = Math.min(99, Math.round(eased * 100))
      if (value !== last) {
        last = value
        onProgress(value)
      }

      if (t < 1) {
        requestAnimationFrame(tick)
      } else {
        onProgress(100)
        resolve()
      }
    }

    requestAnimationFrame(tick)
  })
}
