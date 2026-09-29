import { spawn } from 'node:child_process'
import { writeFile } from 'node:fs/promises'

const EDGE =
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = 9333
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const child = spawn(
  EDGE,
  [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900',
    'http://127.0.0.1:4173/',
  ],
  { stdio: 'ignore' },
)

async function getWs() {
  for (let i = 0; i < 40; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()
      return j.webSocketDebuggerUrl
    } catch {
      await sleep(200)
    }
  }
  throw new Error('CDP not ready')
}

function cdp(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    let id = 0
    const pending = new Map()
    ws.addEventListener('open', () =>
      resolve({
        send(method, params = {}) {
          const msgId = ++id
          return new Promise((res, rej) => {
            pending.set(msgId, { res, rej })
            ws.send(JSON.stringify({ id: msgId, method, params }))
          })
        },
        close: () => ws.close(),
      }),
    )
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

const listWait = await getWs()
void listWait
const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
const page = tabs.find((t) => t.type === 'page') || tabs[0]
const client = await cdp(page.webSocketDebuggerUrl)
await client.send('Page.enable')
await client.send('Runtime.enable')
await sleep(2000)

const skipPreloader = `(() => {
  try { sessionStorage.setItem('revivaa-preloader-seen', '1') } catch {}
  document.querySelector('.preloader')?.remove()
  const app = document.querySelector('.app')
  if (app) { app.removeAttribute('inert'); app.removeAttribute('aria-hidden') }
  return true
})()`

await client.send('Runtime.evaluate', { expression: skipPreloader })
await client.send('Page.reload', { ignoreCache: true })
await sleep(2800)
await client.send('Runtime.evaluate', { expression: skipPreloader })
await sleep(600)

const measure = await client.send('Runtime.evaluate', {
  expression: `(() => {
    const oils = [...document.querySelectorAll('.oil-transition')].map((el, i) => {
      const r = el.getBoundingClientRect()
      const layer = el.querySelector('.oil-transition__layer')
      const svg = el.querySelector('svg')
      const stage = el.querySelector('.oil-transition__stage')
      const cs = getComputedStyle(el)
      return {
        i,
        h: Math.round(r.height),
        maxH: cs.maxHeight,
        zone: cs.getPropertyValue('--oil-zone-h').trim(),
        layerH: layer ? Math.round(layer.getBoundingClientRect().height) : null,
        svgH: svg ? Math.round(svg.getBoundingClientRect().height) : null,
        z: cs.zIndex,
        stagePos: stage ? getComputedStyle(stage).position : null,
        pathD: (svg?.querySelector('path')?.getAttribute('d') || '').slice(0, 80),
      }
    })
    return { oilCount: oils.length, oils }
  })()`,
  returnByValue: true,
})
console.log(JSON.stringify(measure.result.value, null, 2))

await client.send('Runtime.evaluate', {
  expression: `(() => {
    document.querySelectorAll('.oil-atmosphere').forEach((el) => { el.style.display = 'none' })
    document.querySelectorAll('.oil-transition').forEach((el) => {
      el.style.outline = '3px solid lime'
      el.style.background = 'rgba(255,0,0,0.25)'
    })
    const el = document.querySelectorAll('.oil-transition')[0]
    const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35
    window.scrollTo(0, Math.max(0, y))
    return true
  })()`,
})
await sleep(400)
const shot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true })
await writeFile('audit-shots/debug-oil-outlined.png', Buffer.from(shot.data, 'base64'))
console.log('wrote debug-oil-outlined.png')

client.close()
child.kill()
