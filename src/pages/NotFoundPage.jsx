import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import './NotFoundPage.css'

const W = 400
const H = 600
const BARREL_W = 88
const BARREL_H = 40
const GROUND_H = 64
const GROUND_Y = H - GROUND_H
const GRAVITY = 1500
const SWING_SPD = 1.5
const VIEW_TOP = 170
const MOVER_TOP = 30
const LAND_TOL = 0.51
const LS_KEY = 'oil_barrel_high_score'

export default function NotFoundPage({ homeHref, standalone = false }) {
  const canvasRef = useRef(null)
  const viewRef = useRef(null)
  const startRef = useRef(null)
  const overRef = useRef(null)
  const startBtnRef = useRef(null)
  const retryBtnRef = useRef(null)
  const scoreRef = useRef(null)
  const bestRef = useRef(null)
  const finalRef = useRef(null)
  const bestTagRef = useRef(null)

  useEffect(() => {
    const prev = document.title
    document.title = '404 · Pipeline interrupted · revivaa'
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const view = viewRef.current
    const startBtn = startBtnRef.current
    const retryBtn = retryBtnRef.current
    if (!canvas || !view) return undefined

    const ctx = canvas.getContext('2d')

    const readBest = () => {
      try {
        return parseInt(localStorage.getItem(LS_KEY), 10) || 0
      } catch {
        return 0
      }
    }
    const writeBest = (n) => {
      try {
        localStorage.setItem(LS_KEY, String(n))
      } catch {
        /* storage unavailable */
      }
    }

    let state = 'start'
    const game = {
      score: 0,
      best: readBest(),
      stack: [],
      swing: null,
      dying: null,
      t: 0,
      offset: 0,
    }

    let fallTimer = 0
    let rafId = 0
    let last = performance.now()

    const topBarrier = () => game.stack[game.stack.length - 1]

    const syncHud = () => {
      if (scoreRef.current) scoreRef.current.textContent = String(game.score)
      if (bestRef.current) bestRef.current.textContent = String(game.best)
    }

    const spawnSwing = () => {
      game.swing = {
        x: 0,
        y: 0,
        w: BARREL_W,
        h: BARREL_H,
        moving: true,
        vy: 0,
        phase: Math.random() * Math.PI * 2,
      }
    }

    const startGame = () => {
      state = 'playing'
      game.score = 0
      game.best = readBest()
      game.offset = 0
      game.dying = null
      game.t = 0
      game.stack = [
        {
          x: (W - BARREL_W) / 2,
          y: GROUND_Y - BARREL_H,
        },
      ]
      spawnSwing()
      if (startRef.current) startRef.current.hidden = true
      if (overRef.current) overRef.current.hidden = true
      if (bestTagRef.current) bestTagRef.current.hidden = true
      syncHud()
    }

    const dropBarrel = () => {
      if (state !== 'playing') return
      const s = game.swing
      if (!s || !s.moving) return
      s.moving = false
      s.vy = 0
    }

    const gameOver = (s) => {
      state = 'over'
      game.dying = {
        x: s.x,
        y: s.y,
        w: s.w,
        h: s.h,
        rot: 0,
        dir: s.x + s.w / 2 < topBarrier().x + BARREL_W / 2 ? -1 : 1,
        timer: 0,
      }
      game.swing = null

      const isNewBest = game.score > game.best
      if (isNewBest) {
        game.best = game.score
        writeBest(game.score)
      }
      if (finalRef.current) finalRef.current.textContent = String(game.score)
      if (bestTagRef.current) bestTagRef.current.hidden = !isNewBest
      syncHud()

      if (fallTimer) window.clearTimeout(fallTimer)
      fallTimer = window.setTimeout(() => {
        if (overRef.current) overRef.current.hidden = false
      }, 850)
    }

    const landBarrel = (s) => {
      const top = topBarrier()
      s.y = top.y - BARREL_H
      game.stack.push({ x: s.x, y: s.y })
      game.score += 1
      syncHud()
      spawnSwing()
    }

    const update = (dt) => {
      game.t += dt

      if (game.dying) {
        const d = game.dying
        d.timer += dt
        d.rot += d.dir * 230 * dt
        if (d.rot < -75) d.rot = -75
        if (d.rot > 75) d.rot = 75
      }

      if (state !== 'playing') return

      const target = Math.max(0, VIEW_TOP - topBarrier().y)
      game.offset += (target - game.offset) * Math.min(1, dt * 5)

      const s = game.swing
      if (s) {
        if (s.moving) {
          s.y = -game.offset + MOVER_TOP
          const half = (W - BARREL_W) / 2
          s.x = half + half * Math.sin(game.t * SWING_SPD + s.phase)
        } else {
          s.vy += GRAVITY * dt
          s.y += s.vy * dt
          const top = topBarrier()
          if (s.y + s.h >= top.y) {
            const overlap =
              Math.min(s.x + s.w, top.x + BARREL_W) - Math.max(s.x, top.x)
            if (overlap / BARREL_W >= LAND_TOL) landBarrel(s)
            else gameOver(s)
          }
        }
      }
    }

    const drawBarrel = (x, y, w, h) => {
      const r = 7
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()

      const body = ctx.createLinearGradient(x, y, x + w, y)
      body.addColorStop(0, '#7a4d12')
      body.addColorStop(0.18, '#d08a2c')
      body.addColorStop(0.45, '#f39c12')
      body.addColorStop(0.62, '#e08b10')
      body.addColorStop(1, '#7a4d12')
      ctx.fillStyle = body
      ctx.fill()
      ctx.strokeStyle = 'rgba(20,20,20,.65)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = 'rgba(255,255,255,.18)'
      ctx.fillRect(x + 2, y + 2, w - 4, 5)
      ctx.fillStyle = 'rgba(0,0,0,.18)'
      ctx.fillRect(x + 2, y + 9, w - 4, 2)

      for (const rx of [x + w * 0.3, x + w * 0.68]) {
        ctx.fillStyle = 'rgba(0,0,0,.22)'
        ctx.fillRect(rx - 2, y + 4, 4.5, h - 8)
        ctx.fillStyle = 'rgba(255,255,255,.16)'
        ctx.fillRect(rx - 2, y + 4, 1.5, h - 8)
      }

      ctx.strokeStyle = 'rgba(255,255,255,.28)'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(x + 10, y + h - 6)
      ctx.lineTo(x + w - 14, y + 10)
      ctx.stroke()

      ctx.fillStyle = 'rgba(0,0,0,.28)'
      ctx.fillRect(x + 2, y + h - 4, w - 4, 3)
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#121212')
      bg.addColorStop(1, '#0a0a0a')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      const aura = ctx.createRadialGradient(W / 2, H * 0.45, 10, W / 2, H * 0.45, 260)
      aura.addColorStop(0, 'rgba(243,156,18,.10)')
      aura.addColorStop(1, 'rgba(243,156,18,0)')
      ctx.fillStyle = aura
      ctx.fillRect(0, 0, W, H)

      ctx.save()
      ctx.translate(0, Math.round(game.offset))

      ctx.strokeStyle = 'rgba(243,156,18,.05)'
      ctx.lineWidth = 1
      for (let gx = 0; gx <= W; gx += 22) {
        ctx.beginPath()
        ctx.moveTo(gx, 0)
        ctx.lineTo(gx, GROUND_Y)
        ctx.stroke()
      }

      const floor = ctx.createLinearGradient(0, GROUND_Y, 0, H)
      floor.addColorStop(0, '#2a2a2a')
      floor.addColorStop(0.25, '#1a1a1a')
      floor.addColorStop(1, '#171717')
      ctx.fillStyle = floor
      ctx.fillRect(0, GROUND_Y, W, GROUND_H)

      ctx.fillStyle = 'rgba(243,156,18,.55)'
      ctx.fillRect(0, GROUND_Y, W, 2)
      ctx.fillStyle = 'rgba(255,255,255,.06)'
      ctx.fillRect(0, GROUND_Y + 2, W, 1)

      for (const b of game.stack) drawBarrel(b.x, b.y, BARREL_W, BARREL_H)

      if (game.swing) drawBarrel(game.swing.x, game.swing.y, game.swing.w, game.swing.h)

      if (game.dying) {
        const d = game.dying
        ctx.save()
        const px = d.x + d.w / 2
        const py = d.y + d.h
        ctx.translate(px, py)
        ctx.rotate((d.rot * Math.PI) / 180)
        ctx.translate(-px, -py)
        drawBarrel(d.x, d.y, d.w, d.h)
        ctx.restore()
      }

      ctx.restore()

      if (state === 'playing' && game.stack.length >= 7) {
        ctx.save()
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(game.t * 6)
        ctx.fillStyle = '#f39c12'
        ctx.font = '700 11px "Courier New", monospace'
        ctx.textAlign = 'center'
        ctx.fillText('▲ HIGH STACK — KEEP LANDING ▲', W / 2, 16)
        ctx.restore()
      }
    }

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      update(dt)
      draw()
      rafId = requestAnimationFrame(frame)
    }

    const onPointer = (e) => {
      e.preventDefault()
      dropBarrel()
    }
    const onKey = (e) => {
      if (e.code === 'Space' && state === 'playing') {
        e.preventDefault()
        dropBarrel()
      }
    }
    const onStart = (e) => {
      e.stopPropagation()
      startGame()
    }

    view.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    if (startBtn) startBtn.addEventListener('click', onStart)
    if (retryBtn) retryBtn.addEventListener('click', onStart)

    syncHud()
    rafId = requestAnimationFrame(frame)

    return () => {
      if (fallTimer) window.clearTimeout(fallTimer)
      window.cancelAnimationFrame(rafId)
      view.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
      if (startBtn) startBtn.removeEventListener('click', onStart)
      if (retryBtn) retryBtn.removeEventListener('click', onStart)
    }
  }, [])

  return (
    <div className="app nf-app">
      <SEO
        title="404 Page Not Found · Revivaa"
        description="The requested page could not be found. Return to Revivaa botanical hair care."
        noindex={true}
      />
      {!standalone && <Cursor />}
      {!standalone && <ScrollToTop />}
      {!standalone && <Navbar />}

      <main id="main" tabIndex={-1} className="nf">
        <div className="nf__shell container">
          <header className="nf__head">
            <p className="section-label">Error 404 — Page not found</p>
            <h1 className="nf__title">Pipeline interrupted</h1>
            <p className="nf__sub">
              This page drifted off the rig. Stack the barrels to pass the time —
              or head back to home.
            </p>
          </header>

          <div className="nf__viewport" ref={viewRef}>
            <canvas ref={canvasRef} width={W} height={H} />

            <div className="nf__hud" aria-hidden="true">
              <div>
                Score <b ref={scoreRef}>0</b>
              </div>
              <div className="nf__hud-best">
                Best <b ref={bestRef}>0</b>
              </div>
            </div>

            <div className="nf__overlay nf__overlay--start" ref={startRef}>
              <span className="nf__ov-label">Street-art arcade</span>
              <h2 className="nf__ov-title">
                Pipeline <span className="nf__warn">blocked!</span>
              </h2>
              <p className="nf__ov-sub">
                Stack the oil barrels before the line backs up. Land at least{' '}
                <b>51%</b> overlapping a barrel to lock it in.
              </p>
              <button type="button" className="nf__cta" ref={startBtnRef}>
                Start Stacking
              </button>
            </div>

            <div className="nf__overlay nf__overlay--over" ref={overRef} hidden>
              <span className="nf__ov-label">Containment failed</span>
              <h2 className="nf__ov-title">
                Spill <span className="nf__warn">detected!</span>
              </h2>
              <p className="nf__ov-sub">
                Misalignment exceeded <b>51%</b> — the barrel tipped and the line
                went down.
              </p>
              <div className="nf__ov-score">
                Your score <span className="nf__rank" ref={finalRef}>0</span>
              </div>
              <span className="nf__new-best" ref={bestTagRef} hidden>
                ★ New high score ★
              </span>
              <button type="button" className="nf__cta" ref={retryBtnRef}>
                Try Again
              </button>
            </div>
          </div>

          <p className="nf__home">
            {homeHref ? <a href={homeHref}>← Return to home page</a> : <Link to="/">← Return to home page</Link>}
          </p>
        </div>
      </main>

      {!standalone && <Footer />}
    </div>
  )
}