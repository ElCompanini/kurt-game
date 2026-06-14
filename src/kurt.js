import * as THREE from 'three'

// Low-poly material helper (flat shading = facetado low poly)
const mat = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0.05, ...opts })

// ---------------------------------------------------------------------------
// Construye a Kurt: personaje 3D low poly con kipá, peyot (rulos laterales),
// barba y ojos estilo Looney Tunes que se disparan hacia afuera al ver niños.
// ---------------------------------------------------------------------------
export function createKurt() {
  const kurt = new THREE.Group()

  const skin = mat('#f2c9a0')
  const shirt = mat('#ffffff')          // camisa blanca
  const vest = mat('#1c2440')           // chaleco oscuro
  const pants = mat('#2b3a67')
  const hairColor = mat('#3a2412')      // pelo/peyot castaño oscuro

  // Cuerpo (camisa) + chaleco
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 1.3, 7), shirt)
  body.position.y = 1.15
  body.castShadow = true
  kurt.add(body)

  const vestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.66, 0.95, 7, 1, true), vest)
  vestMesh.position.y = 1.2
  kurt.add(vestMesh)

  // Piernas
  for (const x of [-0.28, 0.28]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.7, 6), pants)
    leg.position.set(x, 0.35, 0)
    leg.castShadow = true
    kurt.add(leg)
  }

  // Brazos (refs para animarlos al click)
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

  // Capa fina de pelo
  const hair = new THREE.Mesh(new THREE.IcosahedronGeometry(0.64, 1), hairColor)
  hair.scale.set(1, 0.5, 1)
  hair.position.y = 0.28
  head.add(hair)

  // --- KIPÁ (gorro judío): domo sobre la coronilla ---
  const kippah = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 9, 6, 0, Math.PI * 2, 0, Math.PI / 2.4),
    mat('#15225e', { roughness: 0.6 })
  )
  kippah.position.y = 0.34
  kippah.castShadow = true
  head.add(kippah)
  // borde de la kipá
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.04, 6, 14), mat('#0e1840'))
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.42
  head.add(rim)

  // --- PEYOT (rulos laterales): cuelgan a los costados ---
  for (const side of [-1, 1]) {
    const curl = new THREE.Group()
    const segs = 5
    for (let i = 0; i < segs; i++) {
      const r = 0.1 - i * 0.008
      const bead = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), hairColor)
      // baja en espiral suave
      bead.position.set(
        side * (0.5 + Math.sin(i * 1.1) * 0.06),
        0.05 - i * 0.16,
        0.18 + Math.cos(i * 1.1) * 0.05
      )
      curl.add(bead)
    }
    head.add(curl)
  }

  // --- BARBA ---
  const beard = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1), hairColor)
  beard.scale.set(0.95, 0.7, 0.7)
  beard.position.set(0, -0.42, 0.18)
  head.add(beard)

  // Nariz
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 5), skin)
  nose.rotation.x = Math.PI / 2
  nose.position.set(0, 0.0, 0.62)
  head.add(nose)

  // Boca (sonrisa) — apenas asoma sobre la barba
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 6, 10, Math.PI), mat('#7a2b2b'))
  mouth.rotation.z = Math.PI
  mouth.position.set(0, -0.2, 0.55)
  head.add(mouth)

  // --- OJOS estilo Looney Tunes: telescópicos, salen disparados ---
  const eyes = new THREE.Group()
  head.add(eyes)

  const BASE_Z = 0.48
  const eyeRefs = []
  for (const x of [-0.22, 0.22]) {
    const eye = new THREE.Group()
    eye.position.set(x, 0.12, BASE_Z)

    // tallo (oculto cuando los ojos están normales)
    const stalk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.09, 1, 6),
      mat('#ffffff', { roughness: 0.5 })
    )
    stalk.rotation.x = Math.PI / 2 // alinear con eje Z
    stalk.visible = false
    eye.add(stalk)

    const white = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), mat('#ffffff', { roughness: 0.35 }))
    eye.add(white)

    // párpado/contorno rojo que aparece al bugearse (toque cartoon)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 6, 14), mat('#d23b3b'))
    ring.position.z = 0.02
    ring.visible = false
    white.add(ring)

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), mat('#101018', { roughness: 0.3 }))
    pupil.position.z = 0.16
    white.add(pupil)

    eyes.add(eye)
    eyeRefs.push({ group: eye, white, stalk, ring, base: x, baseZ: BASE_Z })
  }

  kurt.userData = { head, eyes, eyeRefs, arms, body, baseY: 0 }
  return kurt
}

// Anima el "pop" telescópico de los ojos. excited 0..1
export function updateKurtEyes(kurt, excited, t) {
  const e = Math.max(0, Math.min(1, excited))
  const wob = e > 0.05 ? Math.sin(t * 22) * 0.18 * e : 0

  kurt.userData.eyeRefs.forEach((ref, i) => {
    // los ojos se disparan hacia adelante sobre el tallo
    const reach = e * (1.1 + (i === 0 ? wob : -wob)) // un poco desfasados = más cartoon
    const targetZ = ref.baseZ + Math.max(0, reach)
    ref.group.position.z = THREE.MathUtils.lerp(ref.group.position.z, targetZ, 0.25)

    // el globo crece (bug-eyes)
    const targetScale = 1 + e * 1.8 * (1 + wob * 0.3)
    const s = THREE.MathUtils.lerp(ref.white.scale.x, targetScale, 0.22)
    ref.white.scale.setScalar(s)

    // tallo: largo = distancia entre la cara y el globo
    const len = ref.group.position.z - ref.baseZ
    if (len > 0.05) {
      ref.stalk.visible = true
      ref.ring.visible = e > 0.4
      ref.stalk.scale.y = len
      ref.stalk.position.z = -len / 2 // se extiende hacia la cara
    } else {
      ref.stalk.visible = false
      ref.ring.visible = false
    }
  })
}
