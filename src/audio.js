// Sonido cartoon estilo Looney Tunes ("ahooga / boing") sintetizado en vivo
// con Web Audio API — sin archivos externos.

let ctx = null
let lastPlay = -1

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) ctx = new AC()
  }
  return ctx
}

// Debe llamarse desde un gesto del usuario (click/tap) para desbloquear el audio.
export function resumeAudio() {
  const c = getCtx()
  if (c && c.state === 'suspended') c.resume()
}

// pitch ~0.5..1.3 controla qué tan agudo suena el bocinazo.
export function playAhooga(pitch = 1) {
  const c = getCtx()
  if (!c) return

  const now = c.currentTime
  if (now - lastPlay < 0.12) return // anti-spam
  lastPlay = now

  const base = 300 * pitch

  // --- Bocina "AH-OO-GAH": sierra con barrido de tono ---
  const osc = c.createOscillator()
  osc.type = 'sawtooth'
  const horn = c.createGain()
  osc.connect(horn)

  osc.frequency.setValueAtTime(base, now)
  osc.frequency.linearRampToValueAtTime(base * 1.7, now + 0.10) // "AH" sube
  osc.frequency.setValueAtTime(base * 1.7, now + 0.16)
  osc.frequency.linearRampToValueAtTime(base * 0.8, now + 0.30) // "OO-gah" baja
  osc.frequency.linearRampToValueAtTime(base * 1.05, now + 0.38)

  horn.gain.setValueAtTime(0.0001, now)
  horn.gain.exponentialRampToValueAtTime(0.22, now + 0.03)
  horn.gain.setValueAtTime(0.22, now + 0.34)
  horn.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

  // Vibrato (LFO) para el toque caricaturesco
  const lfo = c.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 13
  const lfoGain = c.createGain()
  lfoGain.gain.value = base * 0.05
  lfo.connect(lfoGain).connect(osc.frequency)

  // --- "Boing" agudo encima (campanita tipo resorte) ---
  const ping = c.createOscillator()
  ping.type = 'triangle'
  const pingGain = c.createGain()
  ping.connect(pingGain)
  ping.frequency.setValueAtTime(base * 4, now)
  ping.frequency.exponentialRampToValueAtTime(base * 1.5, now + 0.18)
  pingGain.gain.setValueAtTime(0.12, now)
  pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)

  const master = c.createGain()
  master.gain.value = 0.8
  horn.connect(master)
  pingGain.connect(master)
  master.connect(c.destination)

  osc.start(now); osc.stop(now + 0.5)
  lfo.start(now); lfo.stop(now + 0.5)
  ping.start(now); ping.stop(now + 0.25)
}
