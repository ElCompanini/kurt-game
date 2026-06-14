import * as THREE from 'three'
import './style.css'
import { createKurt, updateKurtEyes } from './kurt.js'
import { createChild } from './child.js'
import {
  UPGRADES, load, save, costOf, derive, targetKids,
} from './state.js'

// ---------------------------------------------------------------------------
// Escena
// ---------------------------------------------------------------------------
const app = document.getElementById('app')

const scene = new THREE.Scene()
scene.background = new THREE.Color('#0f1226')
scene.fog = new THREE.Fog('#0f1226', 14, 30)

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100)
camera.position.set(0, 3.2, 8)
camera.lookAt(0, 1.6, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
app.appendChild(renderer.domElement)

// Luces
scene.add(new THREE.HemisphereLight('#bcd0ff', '#20143a', 0.9))
const sun = new THREE.DirectionalLight('#fff4e0', 1.6)
sun.position.set(5, 10, 6)
sun.castShadow = true
sun.shadow.mapSize.set(1024, 1024)
sun.shadow.camera.near = 1
sun.shadow.camera.far = 40
sun.shadow.camera.left = -12
sun.shadow.camera.right = 12
sun.shadow.camera.top = 12
sun.shadow.camera.bottom = -12
scene.add(sun)

// Suelo low poly
const groundGeo = new THREE.CircleGeometry(16, 9)
const ground = new THREE.Mesh(
  groundGeo,
  new THREE.MeshStandardMaterial({ color: '#27314f', flatShading: true, roughness: 1 })
)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

// Plataforma para Kurt
const dais = new THREE.Mesh(
  new THREE.CylinderGeometry(2.2, 2.6, 0.5, 8),
  new THREE.MeshStandardMaterial({ color: '#39456e', flatShading: true })
)
dais.position.y = 0.25
dais.receiveShadow = true
dais.castShadow = true
scene.add(dais)

// Árboles low poly de decoración
function tree(x, z) {
  const g = new THREE.Group()
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 1, 5),
    new THREE.MeshStandardMaterial({ color: '#5a3a22', flatShading: true })
  )
  trunk.position.y = 0.5
  const top = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 1.6, 6),
    new THREE.MeshStandardMaterial({ color: '#3aa76d', flatShading: true })
  )
  top.position.y = 1.6
  g.add(trunk, top)
  g.traverse((o) => (o.castShadow = true))
  g.position.set(x, 0, z)
  scene.add(g)
}
;[[-9, -6], [9, -6], [-11, 2], [11, 1], [-7, -10], [7, -10]].forEach(([x, z]) => tree(x, z))

// Kurt
const kurt = createKurt()
kurt.position.y = 0.5
scene.add(kurt)

// ---------------------------------------------------------------------------
// Estado del juego
// ---------------------------------------------------------------------------
let state = load()
let { perClick, cps, totalLevels } = derive(state)
const children = []

// ---------------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------------
const elCandy = document.getElementById('candy')
const elCps = document.getElementById('cps')
const elKids = document.getElementById('kids')
const shopList = document.getElementById('shop-list')
const shopEl = document.getElementById('shop')
const hintEl = document.getElementById('hint')

document.getElementById('shop-toggle').addEventListener('click', () => {
  shopEl.classList.toggle('hidden')
})

const fmt = (n) => {
  if (n < 1000) return Math.floor(n).toString()
  const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi']
  let u = 0
  while (n >= 1000 && u < units.length - 1) { n /= 1000; u++ }
  return n.toFixed(1).replace(/\.0$/, '') + units[u]
}

function buildShop() {
  shopList.innerHTML = ''
  UPGRADES.forEach((u) => {
    const div = document.createElement('div')
    div.className = 'upgrade'
    div.dataset.id = u.id
    div.addEventListener('click', () => buy(u.id))
    shopList.appendChild(div)
  })
  refreshShop()
}

function refreshShop() {
  UPGRADES.forEach((u) => {
    const div = shopList.querySelector(`[data-id="${u.id}"]`)
    if (!div) return
    const lvl = state.levels[u.id]
    const cost = costOf(u, lvl)
    const can = state.candy >= cost
    div.className = 'upgrade' + (can ? ' afford' : '')
    div.innerHTML = `
      <div class="up-top">
        <span class="up-name">${u.name}</span>
        <span class="up-lvl">Nv. ${lvl}</span>
      </div>
      <div class="up-desc">${u.desc}</div>
      <div class="up-cost ${can ? '' : 'cant'}">🍬 ${fmt(cost)}</div>`
  })
}

function buy(id) {
  const u = UPGRADES.find((x) => x.id === id)
  const lvl = state.levels[id]
  const cost = costOf(u, lvl)
  if (state.candy < cost) return
  state.candy -= cost
  state.levels[id]++
  ;({ perClick, cps, totalLevels } = derive(state))
  refreshShop()
  updateHud()
  save(state)
}

function updateHud() {
  elCandy.textContent = fmt(state.candy)
  elCps.textContent = fmt(cps)
  elKids.textContent = children.filter((c) => c.userData.arrived).length
}

buildShop()
updateHud()

// ---------------------------------------------------------------------------
// Niños: aparecen según el total de mejoras
// ---------------------------------------------------------------------------
function spawnChild() {
  const c = createChild(children.length)
  const angle = Math.random() * Math.PI * 2
  const r = 13 + Math.random() * 3
  c.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r)
  // posición destino: en círculo alrededor de la plataforma
  const ta = Math.random() * Math.PI * 2
  const tr = 3.2 + Math.random() * 4
  c.userData.target = new THREE.Vector3(Math.cos(ta) * tr, 0, Math.sin(ta) * tr)
  scene.add(c)
  children.push(c)
}

function syncChildren() {
  const want = targetKids(totalLevels)
  while (children.length < want) spawnChild()
}

// ---------------------------------------------------------------------------
// Click sobre Kurt
// ---------------------------------------------------------------------------
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let squash = 0 // animación de "apretón" al click
let firstClick = true

function handlePointer(clientX, clientY) {
  pointer.x = (clientX / innerWidth) * 2 - 1
  pointer.y = -(clientY / innerHeight) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObject(kurt, true)
  if (hits.length > 0) {
    clickKurt(clientX, clientY)
  }
}

function clickKurt(x, y) {
  state.candy += perClick
  squash = 1
  // brazos suben
  kurt.userData.arms.forEach((a, i) => {
    a.rotation.z = (i ? -1 : 1) * 1.4
  })
  spawnFloat(x, y, '+' + fmt(perClick))
  updateHud()
  refreshShop()
  if (firstClick) { firstClick = false; hintEl.style.opacity = '0' }
  save(state)
}

function spawnFloat(x, y, text) {
  const el = document.createElement('div')
  el.className = 'float'
  el.textContent = text + ' 🍬'
  el.style.left = x + 'px'
  el.style.top = y + 'px'
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 1000)
}

renderer.domElement.addEventListener('pointerdown', (e) => handlePointer(e.clientX, e.clientY))

// ---------------------------------------------------------------------------
// Bucle principal
// ---------------------------------------------------------------------------
const clock = new THREE.Clock()
let accSave = 0
let accUi = 0

function animate() {
  requestAnimationFrame(animate)
  const dt = Math.min(clock.getDelta(), 0.05)
  const t = clock.elapsedTime

  // Ingreso pasivo
  if (cps > 0) state.candy += cps * dt

  // Refrescar interfaz ~6 veces por segundo (no en cada frame)
  accUi += dt
  if (accUi > 0.16) {
    accUi = 0
    updateHud()
    refreshShop()
  }

  // Mantener cantidad de niños
  syncChildren()

  // ¿Hay niños cerca? -> Kurt se emociona y se le agrandan los ojos
  let nearCount = 0
  children.forEach((c) => {
    const d = c.position.distanceTo(kurt.position)
    if (c.userData.arrived && d < 8) nearCount++
  })
  const excited = Math.min(1, nearCount / 3)
  updateKurtEyes(kurt, excited, t)

  // Kurt: idle bob + squash al click + se gira hacia el niño más cercano
  squash = Math.max(0, squash - dt * 4)
  const bob = Math.sin(t * 2) * 0.05
  kurt.position.y = 0.5 + bob
  kurt.userData.body.scale.y = 1 - squash * 0.18
  kurt.userData.body.scale.x = 1 + squash * 0.12
  // brazos vuelven a su lugar
  kurt.userData.arms.forEach((a, i) => {
    const rest = (i ? -1 : 1) * 0.35
    a.rotation.z = THREE.MathUtils.lerp(a.rotation.z, rest, 0.12)
  })
  // la cabeza mira al niño más cercano
  let nearest = null
  let nd = Infinity
  children.forEach((c) => {
    if (!c.userData.arrived) return
    const d = c.position.distanceTo(kurt.position)
    if (d < nd) { nd = d; nearest = c }
  })
  if (nearest) {
    const dir = Math.atan2(
      nearest.position.x - kurt.position.x,
      nearest.position.z - kurt.position.z
    )
    kurt.userData.head.rotation.y = THREE.MathUtils.lerp(kurt.userData.head.rotation.y, dir, 0.08)
  }

  // Mover niños hacia su destino y hacerlos saltar
  children.forEach((c) => {
    const tg = c.userData.target
    const dx = tg.x - c.position.x
    const dz = tg.z - c.position.z
    const dist = Math.hypot(dx, dz)
    if (dist > 0.1 && !c.userData.arrived) {
      c.position.x += (dx / dist) * c.userData.speed * dt * 3
      c.position.z += (dz / dist) * c.userData.speed * dt * 3
      c.lookAt(kurt.position.x, 0, kurt.position.z)
    } else {
      c.userData.arrived = true
      // saltitos de alegría + mirar a Kurt
      c.position.y = Math.abs(Math.sin(t * 4 + c.userData.phase)) * 0.35
      c.lookAt(kurt.position.x, 0.5, kurt.position.z)
    }
  })

  // Cámara con leve órbita automática
  const camR = 8.5
  camera.position.x = Math.sin(t * 0.12) * camR
  camera.position.z = Math.cos(t * 0.12) * camR
  camera.position.y = 3.2
  camera.lookAt(0, 1.6, 0)

  // Guardado periódico
  accSave += dt
  if (accSave > 5) { accSave = 0; save(state) }

  renderer.render(scene, camera)
}
animate()

// ---------------------------------------------------------------------------
// Resize
// ---------------------------------------------------------------------------
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})
