/**
 * One-off audit: screenshot each OilTransition boundary via Edge CDP.
 * Run while `npm run preview` is on :4173.
 */
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const EDGE =
  process.env.EDGE_PATH ||
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = 9222
const BASE = process.env.PREVIEW_URL || 'http://127.0.0.1:4173/'
const OUT = path.resolve('audit-shots')

const BOUNDARIES = [
  { file: '01-hero-to-story.png', label: 'Hero → Story (ProblemSolution)' },
  { file: '02-story-to-why.png', label: 'Story → Why Revivaa' },
  { file: '03-why-to-film.png', label: 'Why → ScrollFilm / Difference' },
  { file: '04-difference-to-ingredients.png', label: 'Difference → Ingredients' },
  { file: '05-ingredients-to-journey.png', label: 'Ingredients → Our Story' },
  { file: '06-journey-to-wanted.png', label: 'Our Story → What we wanted' },
  { file: '07-wanted-to-footer.png', label: 'Wanted → Footer CTA' },
]

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms))
}

async function getWsUrl() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
  const json = await res.json()
  return json.webSocketDebuggerUrl
}

function cdp(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl)
    let id = 0
    const pending = new Map()
    ws.addEventListener('open', () => resolve({
      send(method, params = {}) {
        const msgId = ++id
        return new Promise((res, rej) => {
          pending.set(msgId, { res, rej })
          ws.send(JSON.stringify({ id: msgId, method, params }))
        })
      },
      close: () => ws.close(),
    }))
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id)
        pending.delete(msg.id)
        if (msg.error) rej(msg.error)
        else res(msg.result)
      }
    })
    ws.addEventListener('error', reject)
  })
}

async function main() {
  await mkdir(OUT, { recursive: true })

  const child = spawn(
    EDGE,
    [
      `--remote-debugging-port=${PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--window-size=1440,900',
      '--no-first-run',
      '--no-default-browser-check',
      '--force-prefers-reduced-motion=0',
      BASE,
    ],
    { stdio: 'ignore' },
  )

  try {
    let wsUrl
    for (let i = 0; i < 40; i++) {
      try {
        wsUrl = await getWsUrl()
        break
      } catch {
        await sleep(250)
      }
    }
    if (!wsUrl) throw new Error('CDP not ready')

    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
    const page = list.find((t) => t.type === 'page') || list[0]
    const client = await cdp(page.webSocketDebuggerUrl)

    await client.send('Page.enable')
    await client.send('Runtime.enable')
    await client.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
    })
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `try { sessionStorage.setItem('revivaa-preloader-seen', '1'); } catch (e) {}`,
    })

    await client.send('Page.navigate', { url: BASE })
    await sleep(3500)

    const skipPreloader = `(() => {
      try { sessionStorage.setItem('revivaa-preloader-seen', '1') } catch {}
      document.querySelector('.preloader')?.remove()
      const app = document.querySelector('.app')
      if (app) {
        app.removeAttribute('inert')
        app.removeAttribute('aria-hidden')
      }
      return document.querySelectorAll('.oil-transition').length
    })()`

    let count = (
      await client.send('Runtime.evaluate', {
        expression: skipPreloader,
        returnByValue: true,
      })
    ).result.value

    if (!count) {
      await client.send('Page.reload', { ignoreCache: true })
      await sleep(3000)
      count = (
        await client.send('Runtime.evaluate', {
          expression: skipPreloader,
          returnByValue: true,
        })
      ).result.value
    }

    console.log('oil-transition count:', count)
    if (!count) throw new Error('No .oil-transition nodes found — aborting shots')

    for (let i = 0; i < BOUNDARIES.length; i++) {
      const meta = BOUNDARIES[i]
      await client.send('Runtime.evaluate', {
        expression: `(() => {
          const nodes = [...document.querySelectorAll('.oil-transition')];
          const el = nodes[${i}];
          if (!el) return false;
          const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35;
          window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
          return true;
        })()`,
        returnByValue: true,
      })
      await sleep(500)

      const shot = await client.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
      })
      const file = path.join(OUT, meta.file)
      await writeFile(file, Buffer.from(shot.data, 'base64'))
      console.log('wrote', meta.file, '—', meta.label)
    }

    client.close()
  } finally {
    child.kill()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
