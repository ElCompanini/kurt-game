import * as THREE from 'three'

// Low-poly material helper (flat shading = facetado low poly)
const mat = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0.05, ...opts })

// ---------------------------------------------------------------------------
// Construye a Kurt: un personaje 3D low poly con ojos estilo Looney Tunes
// que pueden expandirse cuando ve a un niño.
// ---------------------------------------------------------------------------
export function createKurt() {
  const kurt = new THREE.Group()

  const skin = mat('#f2c9a0')
  const shirt = mat('#3b82f6')
  const pants = mat('#2b3a67')

  // Cuerpo
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 1.3, 7), shirt)
  body.position.y = 1.15
  body.castShadow = true
  kurt.add(body)

  // Piernas
  for (const x of [-0.28, 0.28]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.7, 6), pants)
    leg.position.set(x, 0.35, 0)
    leg.castShadow = true
    kurt.add(leg)
  }

  // Brazos (guardamos refs para animarlos al click)
  const arms = []
  for (const x of [-0.7, 0.7]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.95, 6), shirt)
    arm.position.set(x, 1.25, 0)
    arm.rotation.z = x > 0 ? 0.35 : -0.35
    arm.castShadow = true
    kurt.add(arm)
    arms.push(arm)
  }

  // Cabeza
  const head = new THREE.Group()
  head.position.y = 2.25
  kurt.add(head)

  const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 1), skin)
  skull.castShadow = true
  head.add(skull)

  // Pelo low poly
  const hair = new THREE.Mesh(new THREE.IcosahedronGeometry(0.66, 1), mat('#5a3a22'))
  hair.scale.set(1, 0.55, 1)
  hair.position.y = 0.34
  head.add(hair)

  // Nariz
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 5), skin)
  nose.rotation.x = Math.PI / 2
  nose.position.set(0, -0.02, 0.6)
  head.add(nose)

  // Boca (sonrisa)
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 6, 10, Math.PI), mat('#7a2b2b'))
  mouth.rotation.z = Math.PI
  mouth.position.set(0, -0.28, 0.52)
  head.add(mouth)

  // --- OJOS estilo Looney Tunes (se expanden) ---
  const eyes = new THREE.Group()
  head.add(eyes)

  const eyeRefs = []
  for (const x of [-0.24, 0.24]) {
    const eye = new THREE.Group()
    eye.position.set(x, 0.1, 0.5)

    const white = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), mat('#ffffff', { roughness: 0.4 }))
    eye.add(white)

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), mat('#101018', { roughness: 0.3 }))
    pupil.position.z = 0.15
    eye.add(pupil)

    eyes.add(eye)
    eyeRefs.push({ group: eye, base: x })
  }

  kurt.userData = { head, eyes, eyeRefs, arms, body, baseY: 0 }
  return kurt
}

// Anima el "pop" de ojos. excited 0..1
export function updateKurtEyes(kurt, excited, t) {
  const target = 1 + excited * 1.8 // hasta 2.8x de tamaño
  const wob = excited > 0.05 ? 1 + Math.sin(t * 18) * 0.12 * excited : 1
  const s = THREE.MathUtils.lerp(kurt.userData.eyes.scale.x, target * wob, 0.18)
  kurt.userData.eyes.scale.setScalar(s)

  // los ojos saltan un poco hacia afuera al expandirse
  kurt.userData.eyeRefs.forEach((e) => {
    e.group.position.z = THREE.MathUtils.lerp(e.group.position.z, 0.5 + excited * 0.25, 0.18)
  })
}
