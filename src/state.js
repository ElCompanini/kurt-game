// Estado del juego + definición de mejoras (clicker incremental)

export const UPGRADES = [
  {
    id: 'manos',
    name: 'Manos rápidas',
    desc: '+1 caramelo por cada click en Kurt.',
    baseCost: 15,
    growth: 1.15,
    perClick: 1,
    cps: 0,
  },
  {
    id: 'saludo',
    name: 'Saludo automático',
    desc: 'Kurt saluda solo: +0.5 caramelos por segundo.',
    baseCost: 50,
    growth: 1.16,
    perClick: 0,
    cps: 0.5,
  },
  {
    id: 'globos',
    name: 'Globos de colores',
    desc: 'Atrae niños. +2 caramelos/seg y más niños llegan.',
    baseCost: 220,
    growth: 1.18,
    perClick: 0,
    cps: 2,
  },
  {
    id: 'caramelera',
    name: 'Caramelera mágica',
    desc: '+3 por click y +5 caramelos/seg.',
    baseCost: 900,
    growth: 1.2,
    perClick: 3,
    cps: 5,
  },
  {
    id: 'parque',
    name: 'Parque de juegos',
    desc: 'Una multitud de niños. +20 caramelos/seg.',
    baseCost: 5000,
    growth: 1.22,
    perClick: 0,
    cps: 20,
  },
  {
    id: 'helado',
    name: 'Camión de helados',
    desc: '+10 por click y +60 caramelos/seg.',
    baseCost: 28000,
    growth: 1.24,
    perClick: 10,
    cps: 60,
  },
]

const SAVE_KEY = 'kurt-clicker-save-v1'

export function newState() {
  const levels = {}
  UPGRADES.forEach((u) => (levels[u.id] = 0))
  return { candy: 0, levels }
}

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return newState()
    const data = JSON.parse(raw)
    const s = newState()
    s.candy = data.candy || 0
    UPGRADES.forEach((u) => {
      s.levels[u.id] = (data.levels && data.levels[u.id]) || 0
    })
    return s
  } catch {
    return newState()
  }
}

export function save(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function costOf(u, level) {
  return Math.floor(u.baseCost * Math.pow(u.growth, level))
}

// Derivados: caramelos por click, por segundo, y total de mejoras compradas
export function derive(state) {
  let perClick = 1 // base
  let cps = 0
  let totalLevels = 0
  UPGRADES.forEach((u) => {
    const lvl = state.levels[u.id]
    perClick += u.perClick * lvl
    cps += u.cps * lvl
    totalLevels += lvl
  })
  return { perClick, cps, totalLevels }
}

// Cuántos niños deberían estar presentes según las mejoras
export function targetKids(totalLevels) {
  return Math.min(40, totalLevels) // hasta 40 niños en pantalla
}
