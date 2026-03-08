---
name: Templ3 UI Design Plan
overview: Redisenar la web personal Templ3 como un "sanctuario digital" con estetica soviet-cyberpunk, escenas 3D inmersivas por seccion, paleta calida con acentos magenta, y un terminal interactivo oculto como Easter egg.
todos:
  - id: phase-1-tokens
    content: "FASE 1 - Fundamentos: Redisenar tokens CSS (paleta sovietica), sistema tipografico (Chakra Petch + Rajdhani + Source Sans 3), y global.css base"
    status: completed
  - id: phase-2-layout
    content: "FASE 2 - Layout y Navegacion: Refactorizar Header/Footer con nuevo diseno, implementar layout responsive, cursor custom, grid background"
    status: completed
  - id: phase-3-home
    content: "FASE 3 - Home: Escena 3D del terminal sovietico CRT (procedural, con shaders CRT, scanlines, boot sequence animada), hero layout, secciones featured"
    status: completed
  - id: phase-4-components
    content: "FASE 4 - Componentes UI: GlitchText, SovietStamp, WeaponCard, PostCard, DossierField, StatusBadge, BootAnimation (scroll reveal)"
    status: completed
  - id: phase-5-pages
    content: "FASE 5 - Paginas: About (dossier), Blog index (magazine grid), Blog post (editorial), Arsenal (armory), Links (comms)"
    status: completed
  - id: phase-6-scenes
    content: "FASE 6 - Escenas 3D secundarias: DossierScene, GazetteScene, ArmoryScene, CommsScene con efectos post-processing"
    status: completed
  - id: phase-7-terminal
    content: "FASE 7 - Easter Egg Terminal: overlay CLI, sistema de comandos, integracion con navegacion, ASCII art neofetch"
    status: completed
  - id: phase-8-transitions
    content: "FASE 8 - Polish: Transiciones de pagina CRT, hover effects (glitch RGB), loading states BIOS, 404 page, responsive final, prefers-reduced-motion"
    status: completed
isProject: false
---

# Templ3 - Soviet Cyberpunk Sanctum

## Concepto Central

Un laboratorio sovietico abandonado reconvertido en sanctuario hacker. La metafora principal es la de tecnologia sovietica decadente reinterpretada con cyberpunk: CRTs ambar, paneles metalicos oxidados, propaganda reconvertida, cables expuestos -- pero con destellos de personalidad (figuritas kawaii, stickers de anime, pegatinas sobre metal viejo). TempleOS como la "religion" del sistema.

La web se siente como entrar en una instalacion secreta donde cada seccion es una estancia diferente del bunker.

### Skills aplicadas en cada fase

- **frontend-design** + **bolder**: Direccion estetica, paleta, tipografia, layout, anti-patterns de "AI slop"
- **animate**: Sistema de motion, timings, easing, scroll animations, prefers-reduced-motion
- **optimize**: Rendimiento 3D, lazy loading, code splitting, font loading, Core Web Vitals
- **threejs**: Escenas 3D, shaders, post-processing (refs: `00-fundamentals`, `01-getting-started`, `09-postprocessing`, `17-shader`, `12-performance`)

---

## Paleta de Colores - OKLCH (per skill/color-and-contrast)

Toda la paleta usa OKLCH para uniformidad perceptual. Neutrales tintados hacia ambar (hue ~60) para cohesion sovietica calida.

```css
:root {
  /* Backgrounds - neutrales tintados ambar */
  --bg:              oklch(6% 0.01 60);      /* carbon calido, casi negro */
  --bg-elevated:     oklch(10% 0.012 60);    /* panel elevado */
  --panel:           oklch(13% 0.015 55);    /* superficie de panel, oxido */
  --panel-border:    oklch(22% 0.02 55);     /* borde calido */

  /* Texto - blanco calido, nunca pure white */
  --text:            oklch(94% 0.015 70);    /* papel envejecido */
  --text-body-weight: 350;                   /* reduce weight en dark mode */
  --muted:           oklch(65% 0.02 60);     /* texto secundario */
  --faded:           oklch(45% 0.02 55);     /* texto terciario */

  /* Acento primario - Magenta Sigterm (identidad, se mantiene) */
  --magenta:         oklch(45% 0.22 350);    /* #b00b69 approx */
  --magenta-bright:  oklch(72% 0.18 345);    /* hover/highlight */

  /* Acento sovietico - Ambar (CRT phosphor, luz calida) */
  --amber:           oklch(72% 0.14 80);     /* fosforo CRT */
  --amber-glow:      oklch(82% 0.16 85);     /* emision brillante */

  /* Secundarios */
  --oxide:           oklch(38% 0.12 30);     /* rojo oxido, peligro */
  --oxide-bright:    oklch(52% 0.16 30);     /* rojo propaganda */
  --military:        oklch(42% 0.08 145);    /* verde militar */
  --military-dim:    oklch(28% 0.06 145);    /* verde oscuro */

  /* Superficies */
  --metal:           oklch(26% 0.015 55);    /* metal envejecido */
  --aged-paper:      oklch(76% 0.05 75);     /* papel, documentos */
  --rust:            oklch(30% 0.06 45);     /* oxido, decay */
}
```

Regla 60-30-10: 60% backgrounds neutros tintados, 30% texto/bordes/superficies, 10% acentos (magenta para CTAs, ambar para terminal/glow).

---

## Tipografia (per skill/typography)

Sistema de 4 fuentes con roles claros. Fluid type con `clamp()`. Escala modular ratio 1.333 (perfect fourth) para drama en headers sin exagerar.

```css
/* Escala tipografica fluid */
--text-xs:    clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);
--text-sm:    clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
--text-base:  clamp(0.95rem, 0.9rem + 0.25vw, 1.05rem);
--text-lg:    clamp(1.15rem, 1rem + 0.5vw, 1.35rem);
--text-xl:    clamp(1.5rem, 1.2rem + 1vw, 2rem);
--text-2xl:   clamp(2rem, 1.5rem + 1.8vw, 3rem);
--text-hero:  clamp(2.5rem, 1.8rem + 3vw, 5rem);   /* Drama: 5x vs base */
```

- **Display / H1**: **Chakra Petch** Bold -- angular, cyberpunk, contraste fuerte vs body (estructura + peso)
- **H2-H3 / UI**: **Rajdhani** SemiBold -- complementa Chakra, condensada para subtitulos
- **Body**: **Source Sans 3** Regular/Light -- legible, no monospace, buena en dark mode a peso 350
- **Code / Terminal / Labels**: **JetBrains Mono** -- monospace con personalidad, uppercase + letter-spacing 0.12em para labels tipo "CLASSIFIED"

Font loading: `font-display: swap` + fallback metrics matching para minimizar CLS. Preload Chakra Petch (hero) y Source Sans 3 (body). Subset a Latin + Latin Extended.

Line-heights: body 1.65 (incrementado 0.1 para dark bg), headings 1.1-1.2. Max-width body: `65ch`.

---

## Spacing System (per skill/spatial-design)

Base 4pt. Nombrado semantico:

```css
--space-xs:   4px;     --space-sm:   8px;
--space-md:   16px;    --space-lg:   24px;
--space-xl:   48px;    --space-2xl:  80px;
--space-3xl:  128px;   --space-4xl:  200px;  /* generoso para drama */
```

Usar `gap` en lugar de margins para siblings. Layout asimetrico intencionado (70/30, 80/20 splits, no todo centrado). Container queries `@container` para componentes que viven en distintos contextos (sidebar vs main).

---

## Estructura de Paginas y Escenas 3D

### 1. HOME - "Main Terminal"

**Escena 3D Hero** -- El terminal CRT sovietico como pieza central.

Geometria procedural del terminal (Three.js refs: `18-geometry`, `11-materials`):

```javascript
// Cuerpo del monitor: BoxGeometry redondeado
const caseGeo = new THREE.BoxGeometry(2.4, 2, 2, 4, 4, 4);
// Pantalla: PlaneGeometry ligeramente curva via vertex shader displacement
const screenGeo = new THREE.PlaneGeometry(1.8, 1.4, 32, 32);
// Escritorio: BoxGeometry ancho y bajo
const deskGeo = new THREE.BoxGeometry(4, 0.15, 2.5);
// Cables: TubeGeometry con CatmullRomCurve3
const cableCurve = new THREE.CatmullRomCurve3([...points]);
const cableGeo = new THREE.TubeGeometry(cableCurve, 20, 0.03, 8, false);
// Teclado: BoxGeometry con teclas como InstancedMesh (30-40 instances de BoxGeo tiny)
const keyGeo = new THREE.BoxGeometry(0.08, 0.03, 0.08);
const keysMesh = new THREE.InstancedMesh(keyGeo, keyMaterial, 40);
```

Materiales (ref: `11-materials`):

```javascript
// Carcasa monitor: metal sovietico oxidado
const caseMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0x3a3530),  // --metal
  roughness: 0.8, metalness: 0.3,
  // Emissive sutil para efecto de calor del CRT
});
// Pantalla: ShaderMaterial custom con CRT effect
const screenMat = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    bootProgress: { value: 0 },  // 0-1 boot sequence
    textTexture: { value: null }, // CanvasTexture con el boot text
    scanlineIntensity: { value: 0.15 },
    curvature: { value: 0.03 },
    chromaticAberration: { value: 0.002 },
    vignetteStrength: { value: 0.4 },
    glowColor: { value: new THREE.Color(0xf0c040) }, // --amber-glow
  },
  // vertex: barrel distortion en UV coords
  // fragment: scanlines + CA + vignette + noise grain
});
// Escritorio: madera oscura/metal
const deskMat = new THREE.MeshStandardMaterial({
  color: 0x1c1914, roughness: 0.9, metalness: 0.1
});
```

CRT Shader (ref: `17-shader`) -- fragment shader key:

```glsl
// Barrel distortion para curvatura CRT
vec2 barrelDistortion(vec2 uv, float k) {
  vec2 centered = uv - 0.5;
  float r2 = dot(centered, centered);
  return uv + centered * k * r2;
}
// Scanlines
float scanline = sin(vUv.y * 800.0) * scanlineIntensity;
// Chromatic aberration
float r = texture2D(textTexture, uv + vec2(chromaticAberration, 0.0)).r;
float g = texture2D(textTexture, uv).g;
float b = texture2D(textTexture, uv - vec2(chromaticAberration, 0.0)).b;
// Vignette
float vignette = smoothstep(0.7, 0.3, length(uv - 0.5));
```

Boot text en pantalla via CanvasTexture (mas eficiente que Text de drei):

```javascript
const canvas = document.createElement('canvas');
canvas.width = 512; canvas.height = 384;
const ctx = canvas.getContext('2d');
ctx.font = '14px JetBrains Mono';
ctx.fillStyle = '#f0c040'; // amber
// Renderizar lineas de boot text progresivamente
// Actualizar texture.needsUpdate = true en cada frame del boot
```

Iluminacion (ref: `05-lights`) -- max 3-4 luces:

```javascript
// Ambar calida del CRT (la principal)
const crtLight = new THREE.PointLight(0xf0c040, 2, 8, 2);
crtLight.position.set(0, 0.5, 1.5); // frente al monitor
// Ambient suave (bunker oscuro)
const ambient = new THREE.AmbientLight(0x1a1510, 0.3);
// Fill sutil desde arriba-atras
const fill = new THREE.DirectionalLight(0x8b6b4a, 0.2);
fill.position.set(-2, 3, -2);
```

Post-processing (ref: `09-postprocessing`) -- max 3 passes:

```javascript
// RenderPass + UnrealBloomPass (threshold 0.8, solo CRT screen brilla)
// + FilmPass (noise 0.15, scanlines 0.08) 
// + OutputPass
// NO SSAO, NO SSR (demasiado caro para una web)
```

Particulas de polvo (ref: `18-geometry` Points):

```javascript
const dustGeo = new THREE.BufferGeometry();
const positions = new Float32Array(200 * 3); // 200 particles max
// Random positions en volumen 4x3x3 alrededor del escritorio
const dustMat = new THREE.PointsMaterial({
  size: 0.015, sizeAttenuation: true,
  color: 0xf0c040, transparent: true, opacity: 0.4,
});
// Animate en useFrame: positions[i*3+1] += delta * 0.02 (drift up lento)
```

Interaccion (ref: `08-interaction`): Click en la pantalla del CRT activa el Easter Egg terminal. Raycaster solo contra el mesh de la pantalla (no toda la escena).

**Mobile fallback** (per optimize skill): Sin canvas WebGL. CSS-only:

```css
.hero-fallback {
  background: radial-gradient(ellipse at center, 
    oklch(13% 0.04 80) 0%, oklch(6% 0.01 60) 70%);
  /* Scanlines via repeating-linear-gradient */
  background-image: repeating-linear-gradient(
    transparent, transparent 2px, oklch(0% 0 0 / 0.08) 2px, oklch(0% 0 0 / 0.08) 4px);
}
/* Boot text animado con CSS keyframes + animation-delay stagger */
```

**Contenido debajo** (layout asimetrico per bolder skill):

- Stats en layout grid 70/30 con `grid-template-columns: 2fr 1fr`
- Featured: 1 post grande + 2 pequenos apilados con `grid-template-columns: 3fr 2fr`
- Weapon cards en horizontal scroll: `display: flex; overflow-x: auto; scroll-snap-type: x mandatory`

---

### 2. ABOUT - "Dossier / Personnel File"

**Escena 3D**: Badge de identificacion metalico rotante.

```javascript
// Badge: BoxGeometry con bevel via ExtrudeGeometry de un RoundedRectShape
const shape = new THREE.Shape();
// roundedRect helper function...
const badgeGeo = new THREE.ExtrudeGeometry(shape, {
  depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02
});
// Material: metal oxidado con anisotropy (brushed metal look)
const badgeMat = new THREE.MeshStandardMaterial({
  color: 0x5c4a3a, roughness: 0.6, metalness: 0.85,
  // envMap via drei Environment preset "warehouse"
});
// Texto en el badge: PlaneGeometry con CanvasTexture (handle, role)
// Foto: PlaneGeometry con texture placeholder
// Clip/pin en la esquina: CylinderGeometry pequeno
```

Animacion: auto-rotate lento en Y, hover invierte velocidad o pausa. Float sutil en Y. Sin post-processing (ligero). Max 1 PointLight ambar + ambient.

**Layout**: Asimetrico grid 40/60.

- Sello "CLASSIFIED" tachado + "DECLASSIFIED" encima
- Ficha tecnica izquierda: campos `DossierField` (label mono uppercase `--faded` + value `--text`)
- Bio derecha: prosa en Source Sans 3
- Tags como `SovietStamp`: rotacion random `transform: rotate(calc(var(--r) * 1deg))` con `--r` entre -3 y 3
- Timeline: borde izquierdo `--amber`, timestamps en JetBrains Mono `--muted`

---

### 3. BLOG - "Gazette / Data Feed"

**Escena 3D**: Pantallas holograficas flotantes.

```javascript
// 3 PlaneGeometry (1.2x0.8) rotadas ligeramente en Y (-15, 0, 15 deg)
// Material: MeshStandardMaterial transparent, emissive amber, opacity 0.7
// Texto via CanvasTexture con headlines aleatorias
// Float animation via drei Float component
// Sin post-processing. Solo AmbientLight + 1 PointLight ambar.
// Max ~50 triangulos total. Muy ligero.
```

**Layout magazine** (per bolder skill):

- Post featured: grid full-width, imagen hero grande con overlay `--bg` gradient bottom, titulo `--text-2xl` Chakra Petch, fecha militar `08.MAR.2026 // 14:30 UTC`
- Posts secundarios: `grid-template-columns: 3fr 2fr` alternando direccion con `:nth-child(even)` reverso
- Hover: CSS `text-shadow: 1px 0 oklch(45% 0.22 350), -1px 0 oklch(72% 0.14 80)` -- glitch RGB magenta/amber, transition 150ms

**Post individual**:

- Hero full-bleed + datos overlay
- Contenido `max-width: 65ch`
- Blockquotes: borde izquierdo 4px `--amber`, bg `--bg-elevated`, prefix `[INTERCEPTED]`
- Code blocks: barra superior con 3 dots + filename, bg `--bg`, border `--panel-border`

---

### 4. ARSENAL - "Armory / Workshop"

**Escena 3D**: Banco de trabajo con herramientas flotantes.

```javascript
// Mesa: BoxGeometry(3, 0.1, 1.5) con MeshStandardMaterial metal
// Objetos flotando sobre la mesa (Float de drei):
//   - Chip/PCB: BoxGeometry(0.4, 0.02, 0.3) color verde militar
//   - Llave: TorusGeometry(0.15, 0.03) + CylinderGeometry(0.03, 0.03, 0.3)
//   - Candado abierto: combinacion de box + torus half
// Raycasting (ref 08-interaction) para hover highlight:
raycaster.intersectObjects(toolMeshes);
// Hover: emissive.setHex(0xf0c040) -- glow ambar
// Total geometria: ~400 triangulos max
```

**Layout RPG inventory**:

- Grid `repeat(auto-fit, minmax(320px, 1fr))` con `@container` queries para adaptar card layout
- WeaponCard: header (titulo + StatusBadge), body (summary + stack chips), footer (links). Hover `translateY(-4px)` 200ms ease-out-quart + `box-shadow` ambar
- StatusBadge: dot animado (CSS `@keyframes pulse`) + label uppercase
- Stack como chips inline con `gap: var(--space-sm)`

---

### 5. LINKS - "Comms Array"

**Escena 3D**: Antena satelital con conexiones a nodos.

```javascript
// Antena central: LatheGeometry con perfil parabolico
const antennaPoints = [
  new THREE.Vector2(0, 0),
  new THREE.Vector2(0.8, 0.1),
  new THREE.Vector2(1.0, 0.4),
  new THREE.Vector2(0.05, 0.4), // soporte central
];
const antennaGeo = new THREE.LatheGeometry(antennaPoints, 24);
// Material: MeshStandardMaterial metal (roughness 0.5, metalness 0.7)

// Nodos: SphereGeometry(0.08, 8, 8) posicionados en arco
// Lineas de conexion: Line de drei desde centro a cada nodo
// Material lineas: LineDashedMaterial color amber, dashSize 0.1, gapSize 0.05
// line.computeLineDistances() requerido para dashed

// Interaccion: shared state React (hoveredLinkId)
// Cuando hoveredLinkId coincide, nodo.material.emissive = amber bright
```

**Layout**:

- Grupos: label uppercase JetBrains Mono + hr `border-color: var(--panel-border)`
- Links: layout vertical con `gap: var(--space-md)`, hover `color: var(--amber-glow)` + underline animado `scaleX(0) -> scaleX(1)` via `::after` pseudo-element

---

## Easter Egg: Terminal Interactivo

Activacion: `Ctrl+`` o click en icono ">_" en el header.

**Interfaz** (per animate/motion timing):

- Slide down desde arriba 400ms ease-out-expo (como consola Quake)
- Background `oklch(6% 0.01 60 / 0.92)`, backdrop-filter: blur(8px) SOLO si reduce el rendimiento es aceptable -- sino solid
- JetBrains Mono, color `--amber`, caret parpadeante
- Prompt: `sigterm@templ3:~$`
- Height: 40vh desktop, 60vh mobile
- Exit: 300ms ease-in (75% de entrada per motion skill)

**Comandos**:

- `help` -- tabla de comandos con descripciones
- `cd /blog`, `cd /about`, `cd /arsenal`, `cd /links` -- window.location navigation con efecto CRT transition
- `ls` -- lista secciones de la pagina actual
- `whoami` -- handle, role, status
- `neofetch` -- ASCII art logo Templ3 + system info (Templ3 OS, kernel: Astro 5.17, shell: R3F, uptime, packages, theme: Soviet Warm)
- `cat sigterm.txt` -- bio corta
- `hack` -- glitch global 2 segundos (CSS animation: random translate + hue-rotate + invert flashes)
- `sudo rm -rf /` -- fake BSOD que se recupera con "Nice try." + reboot animation
- `ping sigterm.vodka` -- fake latency output
- `nmap localhost` -- fake port scan con easter eggs en los "servicios"
- `clear` -- limpia output
- `exit` -- cierra terminal

Implementacion: componente React puro, sin monaco-editor (demasiado pesado). Array de command handlers, output como array de JSX elements. History con arrow keys.

---

## Motion System (per skill/animate + skill/motion-design)

### Easing tokens globales

```css
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);     /* default para entradas */
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);      /* snappy, para UI */
--ease-in:        cubic-bezier(0.7, 0, 0.84, 0);      /* salidas */
--ease-in-out:    cubic-bezier(0.65, 0, 0.35, 1);     /* toggles */
```

### Duraciones por proposito

- 100-150ms: feedback inmediato (button press, toggle, hover color)
- 200-300ms: cambios de estado (menu, tooltip, card hover elevation)
- 300-500ms: layout changes (accordion, modal, terminal slide)
- 500-800ms: entrance animations (page load hero, scroll reveals)

### Hero moment: Boot Sequence (UNA animacion signature)

Al cargar la home por primera vez: secuencia de boot del CRT. La pantalla "enciende" (scaleY 0 -> 1 + brightness flash), luego el texto del terminal aparece linea a linea con stagger 80ms. Duracion total ~2s. Solo la primera vez (sessionStorage flag).

### Scroll animations: BootReveal wrapper

IntersectionObserver (no scroll events). Cada seccion se revela con: opacity 0->1 + translateY 20px->0, 500ms ease-out-quart. Stagger entre hijos: `calc(var(--i) * 80ms)`, cap a 5 items (400ms total max). Unobserve after first trigger.

### Page transitions

CRT off: scaleY comprime a 0 + brightness sube a blanco (200ms ease-in). CRT on: scaleY expande de 0 a 1 + brightness baja (300ms ease-out-quart). Implementar con View Transitions API si el browser lo soporta, fallback CSS.

### prefers-reduced-motion (OBLIGATORIO)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Escenas 3D: auto-rotate desactivado, sin Float, sin particles. Content estable.

---

## Performance Strategy (per skill/optimize + skill/threejs refs 12-performance, 00-fundamentals)

### 3D Performance Budget


| Escena          | Triangulos max | Luces                 | Particles  | Post-proc passes      |
| --------------- | -------------- | --------------------- | ---------- | --------------------- |
| Home (Terminal) | ~2000          | 3 (point+ambient+dir) | 200 points | 3 (render+bloom+film) |
| About (Badge)   | ~300           | 2 (point+ambient)     | 0          | 0                     |
| Blog (Screens)  | ~50            | 2 (point+ambient)     | 0          | 0                     |
| Arsenal (Tools) | ~400           | 2 (point+ambient)     | 0          | 0                     |
| Links (Antenna) | ~200           | 2 (point+ambient)     | 0          | 0                     |


### Implementacion tecnica

```javascript
// Lazy load con Suspense (cada escena es un chunk separado)
const TerminalScene = React.lazy(() => import('./scenes/TerminalScene'));

// Fallback CSS mientras carga
<Suspense fallback={<SceneFallback variant="terminal" />}>
  <TerminalScene />
</Suspense>

// Cleanup obligatorio en useEffect (ref 00-fundamentals)
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    if (material.map) material.map.dispose();
    renderer.dispose();
  };
}, []);

// Pixel ratio limitado (ref 00-fundamentals)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Share materials entre meshes del mismo tipo (ref 12-performance)
const sharedMetalMat = new THREE.MeshStandardMaterial({ ... });
// Reusar para carcasa, escritorio, etc. con .clone() solo si cambia color

// Merge static geometries donde posible (ref 12-performance)
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
// Escritorio + patas = 1 draw call en vez de 5

// InstancedMesh para teclas del teclado (ref 12-performance, 18-geometry)
const keysMesh = new THREE.InstancedMesh(keyGeo, keyMat, 40);
// 40 teclas = 1 draw call
```

### Responsive 3D tiers

```javascript
// Detectar tier en el cliente
const isMobile = window.innerWidth < 768;
const isTablet = window.innerWidth < 1024;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile: NO WebGL, CSS fallback
// Tablet: Canvas sin post-processing, sin particles, geometria simplificada
// Desktop: experiencia completa
// prefersReduced: sin auto-rotate, sin Float, sin particles
```

### Font Loading

- **Preload** Chakra Petch 700 y Source Sans 3 400 (above-fold)
- **font-display: swap** en todas
- **Subset**: Latin + Latin Extended via Google Fonts `&subset=latin,latin-ext`
- **Fallback metrics**: size-adjust + ascent/descent-override para minimizar CLS

### Bundle

- **Code splitting por ruta**: cada pagina es su propio chunk (Astro hace esto automaticamente)
- **Three.js**: solo se carga en paginas que tienen escena 3D (dynamic import)
- **Framer Motion**: evaluar si realmente se necesita o si CSS animations + View Transitions bastan. Si no, **eliminar** del bundle
- **monaco-editor**: **ELIMINAR** -- no se usa, 2MB+ de bundle innecesario

### Core Web Vitals targets

- LCP < 2.5s (hero text renderiza sin esperar 3D)
- CLS < 0.1 (aspect-ratio en canvas container, font fallback metrics)
- INP < 200ms (no blocking JS en main thread)

---

## Estructura de Archivos

```
apps/site/src/
  styles/
    tokens.css              -- OKLCH palette, spacing, easing, z-index
    typography.css          -- font-face, scale, weights, line-heights
    animations.css          -- keyframes: boot, glitch, scanline, fadeIn
    global.css              -- reset, base styles, utility classes
  components/
    scenes/
      TerminalScene.tsx     -- hero CRT sovietico (refactor de TempleScene)
      TerminalScene.module.css
      DossierScene.tsx      -- about: badge rotante
      GazetteScene.tsx      -- blog: holographic screens
      ArmoryScene.tsx       -- arsenal: workbench
      CommsScene.tsx        -- links: antenna array
      shaders/
        crt.ts              -- CRT post-processing effect (scanlines, barrel, CA)
        glitch.ts           -- glitch displacement effect
      SceneFallback.tsx     -- CSS-only fallback para mobile/loading
    terminal/
      Terminal.tsx          -- overlay CLI completo
      useTerminal.ts        -- hook: history, input, output state
      commands.ts           -- command registry + handlers
      ascii.ts              -- ASCII art para neofetch etc
    ui/
      BootReveal.tsx        -- IntersectionObserver scroll reveal wrapper
      GlitchText.tsx        -- hover glitch effect (CSS text-shadow)
      SovietStamp.tsx       -- tag/sello estilo propaganda
      WeaponCard.tsx        -- project card estilo RPG inventory
      PostCard.tsx          -- blog card estilo magazine
      DossierField.tsx      -- campo de ficha (label mono + value)
      StatusBadge.tsx       -- LED dot + status label
    layout/
      Header.astro          -- logo + nav + terminal toggle ">_"
      Footer.astro          -- minimal, links, copyright
  pages/
    index.astro             -- refactor con nuevo layout
    about.astro             -- dossier layout
    blog/index.astro        -- magazine grid
    blog/[slug].astro       -- editorial post
    arsenal.astro           -- armory grid
    links.astro             -- comms layout
    404.astro               -- Templ3 OS BSOD
```

---

## Dependencias

**Agregar**:

- `@react-three/postprocessing` -- EffectComposer, Bloom, ChromaticAberration, Noise
- `postprocessing` -- peer dep

**Mantener**: `@react-three/fiber`, `@react-three/drei`, `three`, `react`, `astro`, `@payloadcms/richtext-lexical`

**Evaluar y probablemente eliminar**:

- `framer-motion` -- si CSS + View Transitions cubren las necesidades, eliminar (ahorra ~30KB gzipped)
- `monaco-editor` -- **ELIMINAR** (no se usa, ~2MB)

---

## Fases de Implementacion

Cada fase produce una web funcional y con personalidad creciente. Las skills se aplican continuamente:

- **Fase 1-2**: frontend-design (tokens, typography, spatial) + optimize (fonts, CLS)
- **Fase 3**: threejs (scene setup, shaders, post-processing) + optimize (lazy load, mobile fallback)
- **Fase 4**: frontend-design (components) + bolder (visual drama, scale, texture)
- **Fase 5**: frontend-design (layouts) + bolder (asymmetry, hierarchy)
- **Fase 6**: threejs (secondary scenes) + optimize (performance budgets)
- **Fase 7**: animate (terminal motion) + frontend-design (interaction patterns)
- **Fase 8**: animate (full motion system) + optimize (final audit) + bolder (verify impact)

