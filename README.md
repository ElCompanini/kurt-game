# KURT — El Clicker que ama a los niños 🍬👀

Juego **3D low poly incremental (clicker)** hecho con [Three.js](https://threejs.org/) y [Vite](https://vitejs.dev/).

Kurt ama a los niños (de buena forma). Cada vez que un niño aparece cerca, **sus ojos se expanden estilo Looney Tunes**. Hacé click en Kurt para generar caramelos 🍬 y comprá mejoras: cuantas más mejoras tengas, más niños llegan al parque.

## Cómo se juega
- **Click en Kurt** → genera caramelos.
- **Tienda (🛒)** → comprá mejoras que suben los caramelos por click y por segundo.
- **Niños** → aparecen según la cantidad total de mejoras compradas. Mientras más cerca están, más se le agrandan los ojos a Kurt.
- El progreso se **guarda solo** en el navegador (localStorage).

## Correr en local
```bash
npm install
npm run dev
```
Abrí la URL que muestra Vite (por defecto http://localhost:5173).

## Build de producción
```bash
npm run build
npm run preview
```

## Deploy en Vercel
1. Subí esta carpeta a un repo de GitHub.
2. En [vercel.com](https://vercel.com) → **New Project** → importá el repo.
3. Vercel detecta Vite automáticamente (`vercel.json` ya está incluido):
   - Build command: `vite build`
   - Output dir: `dist`
4. **Deploy**. ¡Listo!

O desde la terminal con la CLI:
```bash
npm i -g vercel
vercel
```

## Estructura
```
kurt-game/
├─ index.html        # HUD (caramelos, tienda, hint)
├─ vercel.json       # config de deploy
├─ vite.config.js
└─ src/
   ├─ main.js        # escena, bucle, lógica del clicker
   ├─ kurt.js        # modelo 3D de Kurt + ojos Looney Tunes
   ├─ child.js       # niños low poly
   ├─ state.js       # estado, mejoras y guardado
   └─ style.css      # interfaz
```
