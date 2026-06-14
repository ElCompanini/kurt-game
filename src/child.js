import * as THREE from 'three'

const mat = (color) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9 })

const KID_COLORS = ['#ff6b9d', '#5ee7a0', '#ffd23f', '#7c83ff', '#ff9f5e', '#4fd1ff']

// Niño low poly chiquito que camina hacia Kurt y se queda saltando feliz.
export function createChild(index) {
  const c = new THREE.Group()
  const color = KID_COLORS[index % KID_COLORS.length]
  const skin = mat('#f2c9a0')

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.5, 6), mat(color))
  body.position.y = 0.5
  body.castShadow = true
  c.add(body)

  for (const x of [-0.12, 0.12]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 5), mat('#33415e'))
    leg.position.set(x, 0.15, 0)
    c.add(leg)
  }

  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 1), skin)
  head.position.y = 0.95
  head.castShadow = true
  c.add(head)

  // pelito
  const hair = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), mat(index % 2 ? '#3a2a18' : '#1d1d22'))
  hair.scale.set(1, 0.5, 1)
  hair.position.y = 1.08
  c.add(hair)

  // ojos simples
  for (const x of [-0.1, 0.1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), mat('#101018'))
    e.position.set(x, 0.98, 0.22)
    c.add(e)
  }

  c.userData = {
    speed: 0.6 + (index % 5) * 0.08,
    phase: index * 1.7,
    arrived: false,
  }
  return c
}
