let audioCtx = null

/**
 * Two-tone chime for new-order alerts. Web Audio needs a user gesture to start;
 * until the admin has clicked somewhere the context stays suspended and the
 * first notes are silent (everything else still works).
 */
export function playOrderChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    audioCtx = audioCtx || new Ctx()
    const ctx = audioCtx
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    const t0 = ctx.currentTime
    ;[
      [523.25, 0, 0.16],
      [659.25, 0.13, 0.22],
    ].forEach(([freq, when, dur]) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t0 + when)
      gain.gain.exponentialRampToValueAtTime(0.22, t0 + when + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + when + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t0 + when)
      osc.stop(t0 + when + dur + 0.06)
    })
  } catch {
    /* audio unavailable — silently ignore */
  }
}