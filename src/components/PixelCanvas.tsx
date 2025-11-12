'use client';

import { useEffect, useRef } from 'react'

type PixelCanvasProps = {
  width?: number
  height?: number
  // Señal incremental para disparar la explosión desde el exterior
  explodeSignal?: number
  // Modo pintura por celdas tipo pixel
  paintable?: boolean
  // Mostrar u ocultar la nave preformada
  showShip?: boolean
  // Señal para generar una bandera ondeante
  spawnFlagSignal?: number
}

// Canvas cósmico con estrellas, estrella fugaz y pixel art de nave
export default function PixelCanvas({ width = 420, height = 300, explodeSignal = 0, paintable = false, showShip = true, spawnFlagSignal = 0 }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startExplosionRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Estrellas de fondo
    const STAR_COUNT = 120
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.5,
      p: Math.random() * Math.PI * 2,
    }))

    // Estrella fugaz
    const shoot = {
      x: -20,
      y: Math.random() * height * 0.4 + 10,
      vx: width / 140,
      life: 140,
    }

    // Pixel art sencillo de nave (grid)
    const shipMap = [
      '........rr........',
      '.......rrrr.......',
      '......rrrrrr......',
      '.....rrrwwrrr.....',
      '....rrwwwwwwrr....',
      '....rwwwwwwwwr....',
      '....rwwwwwwwwr....',
      '.....rrwwwwrr.....',
      '......rrrrrr......',
      '.......rrrr.......',
      '........rr........',
      '.........g........',
    ]

    const px = 12 // tamaño del píxel (proporción del mockup 2)
    const shipW = shipMap[0].length * px
    const shipH = shipMap.length * px
    const shipPos = { x: width / 2 - shipW / 2, y: height / 2 - shipH / 2 }

    let hue = 190
    let t = 0
    let raf = 0
    let running = true
    let isInView = true
    let shipDestroyed = false
    let isExploding = false
    let explosionFrame = 0
    const explosionMax = 90
    let particles: Array<{ x: number, y: number, vx: number, vy: number, color: string, size: number, rot: number, vr: number, life: number }> = []
    // onda de choque y centro de explosión
    let shockwaveR = 0
    let centerX = shipPos.x + shipW / 2
    let centerY = shipPos.y + shipH / 2
    // Efecto de captura: onda expansiva azul desde la base del mástil
    let captureWave: { x: number; y: number; r: number; r0: number; max: number; frame: number; frames: number; locked: boolean } | null = null
    // Animación sincronizada (zoom out + bandera + rejilla + círculo)
    let syncAnim: { startFrame: number; duration: number; progress: number } | null = null
    const totalSyncFrames = Math.max(1, Math.floor(60 * 3.5)) // 3.5s @ ~60fps
    let sceneScale = 1
    let sceneScaleFinal = 1
    // Control para permitir la animación solo una vez
    let flagAnimPlayedOnce = false

    const colorFor = (ch: string) => {
      switch (ch) {
        case 'r':
          return `hsl(${(hue + 20) % 360} 90% 60%)` // rojo/cián dinámico
        case 'w':
          return '#d0f4ff' // blanco frío
        case 'g':
          return `hsl(${(hue + 200) % 360} 90% 60%)` // luz trasera
        default:
          return null
      }
    }

    const drawBackground = () => {
      // Fondo negro con degradado cósmico sutil
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, width, height)
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.6,
        20,
        width * 0.5,
        height * 0.5,
        Math.max(width, height)
      )
      grad.addColorStop(0, 'rgba(34, 211, 238, 0.10)') // cian
      grad.addColorStop(0.6, 'rgba(168, 85, 247, 0.10)') // púrpura
      grad.addColorStop(1, 'rgba(0,0,0,1)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    }

    let parallaxX = 0
    let parallaxY = 0

    const drawStars = () => {
      for (const s of stars) {
        const a = 0.5 + 0.5 * Math.sin(t * 0.03 + s.p)
        ctx.fillStyle = `rgba(255,255,255,${a})`
        // Parallax suave según puntero
        const px = s.x + parallaxX * 0.08 * s.r
        const py = s.y + parallaxY * 0.08 * s.r
        ctx.fillRect(px, py, s.r, s.r)
      }
    }

    const drawShootingStar = () => {
      shoot.life--
      shoot.x += shoot.vx
      shoot.y += shoot.vx * 0.18
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.fillRect(shoot.x, shoot.y, 3, 1)
      if (shoot.life <= 0 || shoot.x > width + 20) {
        shoot.x = -20
        shoot.y = Math.random() * height * 0.4 + 10
        shoot.life = 140
      }
    }

    const drawShip = () => {
      hue = (hue + 0.35) % 360 // ciclo de color
      for (let row = 0; row < shipMap.length; row++) {
        const line = shipMap[row]
        for (let col = 0; col < line.length; col++) {
          const ch = line[col]
          if (ch === '.') continue
          const c = colorFor(ch)
          if (!c) continue
          ctx.fillStyle = c
          ctx.fillRect(shipPos.x + col * px, shipPos.y + row * px, px, px)
        }
      }

      // parpadeo de luz inferior
      if (t % 50 < 5) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(shipPos.x + shipW / 2 - px / 2, shipPos.y + shipH + 2, px, 2)
      }
    }

    // ======== CAPA DE PINTURA POR CELDAS ========
    const cols = Math.floor(width / px)
    const rows = Math.floor(height / px)
    const painted: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null))
    let isPainting = false
    let eraseMode = false
    let paintColor = `hsl(${(hue + 40) % 360} 90% 65%)`

    // Banderas de clan por celda
    const flags: (number | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null))
    const clanColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7']
    let flagMode = false
    let flagClan = 0

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
    const pickCell = (mx: number, my: number) => {
      const c = clamp(Math.floor(mx / px), 0, cols - 1)
      const r = clamp(Math.floor(my / px), 0, rows - 1)
      return { c, r }
    }

    const applyPaint = (mx: number, my: number) => {
      const { c, r } = pickCell(mx, my)
      if (eraseMode) {
        painted[r][c] = null
      } else {
        painted[r][c] = paintColor
      }
    }

    const applyFlag = (mx: number, my: number) => {
      const { c, r } = pickCell(mx, my)
      if (eraseMode) {
        flags[r][c] = null
      } else {
        flags[r][c] = flagClan
      }
    }

    const drawPaintLayer = () => {
      // pinta las celdas coloreadas
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const color = painted[r][c]
          if (!color) continue
          ctx.fillStyle = color
          ctx.fillRect(c * px, r * px, px, px)
        }
      }
      // líneas de rejilla sutiles para guiar el pintado
      if (paintable) {
        // Opacidad constante para las líneas divisorias (rejilla)
    const gridAlpha = 0.07
        ctx.strokeStyle = `rgba(255,255,255,${gridAlpha})`
        ctx.lineWidth = 1
        for (let c = 1; c < cols; c++) {
          ctx.beginPath()
          ctx.moveTo(c * px + 0.5, 0)
          ctx.lineTo(c * px + 0.5, height)
          ctx.stroke()
        }
        for (let r = 1; r < rows; r++) {
          ctx.beginPath()
          ctx.moveTo(0, r * px + 0.5)
          ctx.lineTo(width, r * px + 0.5)
          ctx.stroke()
        }
      }
    }

    // ======== BANDERA CÓSMICA + ENTRADA PIXELADA ========
    type SF = { x: number; y: number; w: number; h: number; colorIndex: number; stars: { x: number; y: number; r: number; a: number }[] }
    const staticFlags: SF[] = []
    // Estado temporal para la animación de aparición (reveal suave)
    type EnterFlag = {
      x: number; y: number; w: number; h: number;
      clothX: number; clothY: number; clothW: number; clothH: number;
      poleX: number; poleY: number; poleW: number; poleH: number;
      startFrame: number;
      duration: number;
      progress: number;
      stars: { x: number; y: number; r: number; a: number }[];
    }
    let enteringFlag: EnterFlag | null = null

    // Path y test de punto dentro de la forma entallada (swallow-tail)
    const makeFlagShape = (clothX: number, clothY: number, clothW: number, clothH: number) => {
      const notch = Math.max(6, Math.floor(clothW * 0.18))
      const baseX = clothX + clothW - notch
      const cy = clothY + clothH * 0.5
      const pts = [
        { x: clothX, y: clothY },
        { x: baseX, y: clothY },
        { x: clothX + clothW, y: cy },
        { x: baseX, y: clothY + clothH },
        { x: clothX, y: clothY + clothH },
      ]
      return { notch, baseX, cy, pts }
    }
    const pointInFlagShape = (pxlX: number, pxlY: number, clothX: number, clothY: number, clothW: number, clothH: number) => {
      const { notch, baseX, cy } = makeFlagShape(clothX, clothY, clothW, clothH)
      if (pxlX <= baseX) return pxlY >= clothY && pxlY <= clothY + clothH
      const k = (pxlX - baseX) / notch
      const yTop = clothY + (cy - clothY) * k
      const yBottom = clothY + clothH - ((clothY + clothH - cy) * k)
      return pxlY >= yTop && pxlY <= yBottom
    }
    const spawnStaticFlag = () => {
      // tamaño de paño de bandera
      const w = Math.max(6, Math.floor(cols * 0.24))
      const h = Math.max(4, Math.floor(rows * 0.22))
      staticFlags.length = 0

      // métricas base
      const poleW = Math.max(2, Math.floor(px * 0.30))
      const clothW = w * px
      const clothH = h * px
      const extraH = Math.floor(clothH * 0.80)

      // Queremos que la PUNTA INFERIOR (base) del mástil quede centrada en (width/2, height/2)
      // baseY = poleY + poleH = centerY
      // poleY = clothY - floor(extraH*0.35), poleH = clothH + extraH
      // => clothY = centerY - clothH - floor(extraH*0.65)
      const centerX = Math.floor(width / 2)
      const centerY = Math.floor(height / 2)
      const clothY = centerY - clothH - Math.floor(extraH * 0.65)
      // poleX = clothX - poleW - floor(px*0.15) y queremos poleX + poleW/2 = centerX
      const offsetX = Math.floor(px * 0.55) - Math.floor(px * 0.15)
      const poleXMidTarget = centerX
      const xPixels = poleXMidTarget - Math.floor(poleW * 0.5) - offsetX
      const x = Math.max(0, Math.min(cols - w, Math.floor(xPixels / px)))
      const y = Math.max(0, Math.min(rows - h, Math.floor(clothY / px)))

      // Recalcular posiciones a partir de x,y cuantizados a la rejilla
      const clothX = (x * px) + Math.floor(px * 0.55) + poleW
      const poleX = clothX - poleW - Math.floor(px * 0.15)
      const poleH = clothH + extraH
      const poleY = clothY - Math.floor(extraH * 0.35)

      // estrellas internas del paño
      const sc = Math.min(36, Math.max(12, Math.floor((w * h) * 0.15)))
      const starsInFlag: { x: number; y: number; r: number; a: number }[] = []
      for (let i = 0; i < sc; i++) {
        const sx = Math.random() * (clothW - px) + px * 0.5
        const sy = Math.random() * (clothH - px) + px * 0.5
        if (!pointInFlagShape(clothX + sx, clothY + sy, clothX, clothY, clothW, clothH)) continue
        const r = Math.max(1, Math.floor(px * (0.10 + Math.random() * 0.12)))
        const a = 0.6 + Math.random() * 0.4
        starsInFlag.push({ x: sx, y: sy, r, a })
      }

      // animación suave con duración fija
      enteringFlag = {
        x, y, w, h,
        clothX, clothY, clothW, clothH,
        poleX, poleY, poleW, poleH,
        startFrame: t,
        duration: 42,
        progress: 0,
        stars: starsInFlag,
      }
    }

    const drawStaticFlags = () => {
      for (const f of staticFlags) {
        const poleW = Math.max(2, Math.floor(px * 0.30))
        const clothX = (f.x * px) + Math.floor(px * 0.55) + poleW
        const clothY = f.y * px
        // Reducir progresivamente el tamaño del paño de la bandera durante la animación sincronizada
        // Mantener el tamaño final permanente: si la animación terminó, usar progreso 1
        const p = syncAnim ? syncAnim.progress : 1
        const e = 1 - Math.pow(1 - p, 3)
        const flagScale = p > 0 ? (1 - 0.18 * e) : 1
        const clothW = Math.max(4, Math.floor(f.w * px * flagScale))
        const clothH = Math.max(4, Math.floor(f.h * px * flagScale))

        // mástil mucho más largo que la bandera
        const poleX = clothX - poleW - Math.floor(px * 0.15)
        const extraH = Math.floor(clothH * 0.80)
        const poleH = clothH + extraH
        const poleY = clothY - Math.floor(extraH * 0.35)
        ctx.save()
        const poleGrad = ctx.createLinearGradient(poleX, poleY, poleX, poleY + poleH)
        poleGrad.addColorStop(0, 'rgba(200,200,210,1)')
        poleGrad.addColorStop(0.5, 'rgba(240,240,245,1)')
        poleGrad.addColorStop(1, 'rgba(160,160,170,1)')
        ctx.fillStyle = poleGrad
        ctx.fillRect(poleX, poleY, poleW, poleH)
        ctx.restore()

        // bandera en forma entallada cósmica
        const shape = makeFlagShape(clothX, clothY, clothW, clothH)
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(shape.pts[0].x, shape.pts[0].y)
        for (let i = 1; i < shape.pts.length; i++) ctx.lineTo(shape.pts[i].x, shape.pts[i].y)
        ctx.closePath()
        const flagGrad = ctx.createLinearGradient(clothX, clothY, clothX + clothW, clothY + clothH)
        flagGrad.addColorStop(0, 'rgba(14,165,233,1)')
        flagGrad.addColorStop(0.5, 'rgba(29,78,216,1)')
        flagGrad.addColorStop(1, 'rgba(2,6,23,1)')
        ctx.fillStyle = flagGrad
        ctx.fill()
        // borde holográfico
        const borderGrad = ctx.createLinearGradient(clothX, clothY, clothX + clothW, clothY)
        borderGrad.addColorStop(0, 'rgba(56,189,248,1)')
        borderGrad.addColorStop(1, 'rgba(99,102,241,1)')
        ctx.strokeStyle = borderGrad
        ctx.lineWidth = Math.max(1, Math.floor(px * 0.08))
        ctx.stroke()
        // estrellas dentro del paño
        for (const s of f.stars) {
          const sx = clothX + Math.round(s.x)
          const sy = clothY + Math.round(s.y)
          if (!pointInFlagShape(sx, sy, clothX, clothY, clothW, clothH)) continue
          ctx.globalAlpha = s.a
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(sx, sy, Math.max(1, Math.floor(s.r)), Math.max(1, Math.floor(s.r)))
          ctx.globalAlpha = 1
        }
        ctx.restore()
      }
    }

    const drawEnteringFlag = () => {
      if (!enteringFlag) return
      const ef = enteringFlag
      const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)
      const elapsed = t - ef.startFrame
      ef.progress = clamp(elapsed / ef.duration, 0, 1)
      const e = easeOutCubic(ef.progress)

      // mástil revelado progresivamente (más largo que la bandera)
      ctx.save()
      const poleGrad = ctx.createLinearGradient(ef.poleX, ef.poleY, ef.poleX, ef.poleY + ef.poleH)
      poleGrad.addColorStop(0, 'rgba(200,200,210,1)')
      poleGrad.addColorStop(0.5, 'rgba(240,240,245,1)')
      poleGrad.addColorStop(1, 'rgba(160,160,170,1)')
      const poleRevealH = Math.floor(ef.poleH * e)
      ctx.fillStyle = poleGrad
      ctx.fillRect(ef.poleX, ef.poleY, ef.poleW, poleRevealH)
      ctx.restore()

      // paño: revelado pixelado suave (bloques del tamaño px)
      const revealW = Math.floor(ef.clothW * e)
      const flagGrad = ctx.createLinearGradient(ef.clothX, ef.clothY, ef.clothX + ef.clothW, ef.clothY + ef.clothH)
      flagGrad.addColorStop(0, 'rgba(14,165,233,1)')
      flagGrad.addColorStop(0.5, 'rgba(29,78,216,1)')
      flagGrad.addColorStop(1, 'rgba(2,6,23,1)')
      const step = Math.max(2, Math.floor(px))
      ctx.save()
      // iterar en grilla, rellenando bloques cuando su centro cae dentro de la forma
      for (let yy = ef.clothY; yy < ef.clothY + ef.clothH; yy += step) {
        for (let xx = ef.clothX; xx < ef.clothX + ef.clothW; xx += step) {
          const cxMid = xx + step * 0.5
          const cyMid = yy + step * 0.5
          if (!pointInFlagShape(cxMid, cyMid, ef.clothX, ef.clothY, ef.clothW, ef.clothH)) continue
          // revelar cuando el bloque está dentro del ancho revelado; suavizar cerca del borde
          const dist = (ef.clothX + revealW) - cxMid
          if (dist <= -step) continue
          // opacidad 100% para el paño durante la revelación
          ctx.globalAlpha = 1
          ctx.fillStyle = flagGrad
          ctx.fillRect(xx, yy, step, step)
        }
      }
      ctx.globalAlpha = 1
      ctx.restore()

      // estrellas que aparecen cuando su X queda dentro del ancho revelado
      for (const s of ef.stars) {
        const sx = ef.clothX + Math.round(s.x)
        const sy = ef.clothY + Math.round(s.y)
        if (sx <= ef.clothX + revealW && pointInFlagShape(sx, sy, ef.clothX, ef.clothY, ef.clothW, ef.clothH)) {
          ctx.globalAlpha = s.a
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(sx, sy, Math.max(1, Math.floor(s.r)), Math.max(1, Math.floor(s.r)))
          ctx.globalAlpha = 1
        }
      }

      if (ef.progress >= 1) {
        staticFlags.length = 0
        staticFlags.push({ x: ef.x, y: ef.y, w: ef.w, h: ef.h, colorIndex: 1, stars: ef.stars })
        enteringFlag = null
        // Inicializa la onda de captura en la base del mástil tras la entrada de la bandera
        // Si ya existe una onda bloqueada (persistente), no la reiniciamos
        if (!captureWave || !captureWave.locked) {
          const r0 = Math.max(6, Math.floor(px * 0.9))
          // origen EXACTO en la punta INFERIOR del mástil (base)
          const cx = ef.poleX + Math.floor(ef.poleW * 0.5)
          const cy = ef.poleY + ef.poleH
          const farX = Math.max(cx, width - cx)
          const farY = Math.max(cy, height - cy)
          // reducir 4% adicional sobre 0.57 ≈ factor 0.547
          const maxBounds = Math.hypot(farX, farY) * 0.97 * 0.547
          captureWave = {
            x: cx,
            y: cy,
            r: r0,
            r0,
            max: Math.max(r0 + 12, maxBounds),
            frame: 0,
            frames: totalSyncFrames, // sincronizada con zoom out y bandera
            locked: false,
          }
        }
        // Arranca la animación sincronizada (zoom out + bandera + rejilla)
        if (!syncAnim) {
          syncAnim = { startFrame: t, duration: totalSyncFrames, progress: 0 }
        }
      }
    }

    const drawFlagsLayer = () => {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = flags[r][c]
          if (idx === null || idx === undefined) continue
          const x = c * px
          const y = r * px
          const color = clanColors[idx]
          ctx.save()
          ctx.translate(x, y)
          // mástil
          ctx.beginPath()
          ctx.strokeStyle = 'rgba(255,255,255,0.35)'
          ctx.lineWidth = 0.8
          ctx.moveTo(px * 0.2, px * 0.2)
          ctx.lineTo(px * 0.2, px * 0.85)
          ctx.stroke()
          // bandera (triángulo)
          ctx.beginPath()
          ctx.moveTo(px * 0.2, px * 0.28)
          ctx.lineTo(px * 0.78, px * 0.45)
          ctx.lineTo(px * 0.2, px * 0.62)
          ctx.closePath()
          ctx.fillStyle = color
          ctx.fill()
          ctx.restore()
        }
      }
    }

    const startExplosion = () => {
      if (isExploding || shipDestroyed) return
      isExploding = true
      explosionFrame = 0
      particles = []
      centerX = shipPos.x + shipW / 2
      centerY = shipPos.y + shipH / 2
      shockwaveR = 0
      for (let row = 0; row < shipMap.length; row++) {
        const line = shipMap[row]
        for (let col = 0; col < line.length; col++) {
          const ch = line[col]
          if (ch === '.') continue
          const color = colorFor(ch)
          if (!color) continue
          const x = shipPos.x + col * px
          const y = shipPos.y + row * px
          // dirección radial desde el centro con ruido
          const dx = x + px / 2 - centerX
          const dy = y + px / 2 - centerY
          const len = Math.max(0.5, Math.hypot(dx, dy))
          const speed = 1.6 + Math.random() * 2.8
          const vx = (dx / len) * speed + (Math.random() - 0.5) * 0.8
          const vy = (dy / len) * speed + (Math.random() - 0.5) * 0.8
          const size = px * (0.7 + Math.random() * 0.9)
          // rotación y vida para dibujar partículas más ricas y suaves
          const rot = Math.random() * Math.PI * 2
          const vr = (Math.random() - 0.5) * 0.12
          const life = 1
          particles.push({ x, y, vx, vy, color, size, rot, vr, life })
        }
      }
    }

    const drawExplosion = () => {
      // progreso normalizado y easing cúbico para suavidad
      const p = Math.min(1, explosionFrame / explosionMax)
      const easeOut = 1 - Math.pow(1 - p, 3)

      // destello inicial fuerte con gradiente y modo aditivo
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      if (explosionFrame < 24) {
        const baseR = Math.max(width, height) * (0.38 + 0.12 * easeOut)
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseR)
        grad.addColorStop(0, `rgba(255,255,255,${0.75 - 0.25 * p})`)
        grad.addColorStop(0.12, 'rgba(255,199,199,0.55)')
        grad.addColorStop(0.32, 'rgba(239,68,68,0.40)')
        grad.addColorStop(1, 'rgba(255,0,0,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)
      }
      // onda de choque (anillo expansivo) con glow y anillo secundario
      const grow = 2.2 + 3.4 * (1 - easeOut)
      shockwaveR += grow
      ctx.shadowBlur = 14
      ctx.shadowColor = 'rgba(239,68,68,0.6)'
      ctx.beginPath()
      ctx.lineWidth = 2 + Math.max(0, 14 - explosionFrame * 0.18)
      ctx.strokeStyle = `rgba(239,68,68,${Math.max(0, 0.45 - p * 0.42)})`
      ctx.arc(centerX, centerY, shockwaveR, 0, Math.PI * 2)
      ctx.stroke()
      // anillo secundario, ligeramente más grande y tenue
      ctx.beginPath()
      ctx.lineWidth = Math.max(0.5, 6 - explosionFrame * 0.12)
      ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.22 - p * 0.20)})`
      ctx.arc(centerX, centerY, shockwaveR * 1.05, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // partículas con rotación, gravedad y mezcla aditiva al inicio
      const alpha = Math.max(0, 1 - p)
      ctx.save()
      ctx.globalAlpha = alpha
      if (explosionFrame < 30) ctx.globalCompositeOperation = 'lighter'
      for (const pt of particles) {
        pt.x += pt.vx
        pt.y += pt.vy
        pt.vx *= 0.985
        pt.vy = pt.vy * 0.985 + 0.04 // leve gravedad
        pt.rot += pt.vr
        pt.life = Math.max(0, pt.life - 0.010)
        ctx.save()
        ctx.translate(pt.x + pt.size * 0.5, pt.y + pt.size * 0.5)
        ctx.rotate(pt.rot)
        ctx.fillStyle = pt.color
        ctx.fillRect(-pt.size * 0.5, -pt.size * 0.5, pt.size, pt.size)
        ctx.restore()
      }
      ctx.restore()

      // chispas (embers) alrededor del anillo para sensación más rica
      if (explosionFrame < 36) {
        const emberCount = 12
        const emberAlpha = Math.max(0, 0.35 - p * 0.28)
        ctx.save()
        ctx.globalAlpha = emberAlpha
        ctx.fillStyle = 'rgba(255,200,100,1)'
        for (let i = 0; i < emberCount; i++) {
          const a = (i / emberCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.25
          const r = shockwaveR * (0.96 + Math.random() * 0.06)
          const ex = centerX + Math.cos(a) * r
          const ey = centerY + Math.sin(a) * r
          ctx.beginPath()
          ctx.arc(ex, ey, 1.6 + Math.random() * 1.1, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      // humo/nebla suave tras el destello
      if (explosionFrame > 18) {
        ctx.save()
        ctx.globalCompositeOperation = 'source-over'
        const smokeR = Math.max(width, height) * (0.52 + 0.10 * easeOut)
        const smoke = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, smokeR)
        smoke.addColorStop(0, `rgba(20,10,10,${0.28 - 0.20 * p})`)
        smoke.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = smoke
        ctx.fillRect(0, 0, width, height)
        ctx.restore()
      }

      explosionFrame++
      if (explosionFrame >= explosionMax) {
        isExploding = false
        shipDestroyed = true
        particles = []
        // Notificar globalmente el fin de la animación de explosión del mockup
        try {
          const ev = new CustomEvent('pixel-explosion-finished')
          document.dispatchEvent(ev)
        } catch {}
      }
    }

    const drawCaptureWave = () => {
      if (!captureWave) return
      const { x, y } = captureWave
      if (!captureWave.locked) {
        captureWave.frame++
        const p = clamp(captureWave.frame / captureWave.frames, 0, 1)
        const e = 1 - Math.pow(1 - p, 4) // easeOutQuart para expansión suave
        // Permitir radio grande hacia el rincón más lejano, compensando zoom y grosor de borde
        const s = sceneScale
        const strokeComp = (1.0 / Math.max(s, 0.0001)) * 0.5
        const farX = Math.max(x, width - x)
        const farY = Math.max(y, height - y)
        // aplicar factor ≈0.547 para otra reducción del 4%
        const maxByBounds = (Math.hypot(farX, farY) / Math.max(s, 0.0001)) * 0.547 - strokeComp
        const targetMax = Math.max(captureWave.r0, Math.min(captureWave.max, maxByBounds))
        captureWave.r = captureWave.r0 + (targetMax - captureWave.r0) * e
        if (p >= 1) captureWave.locked = true
      }
      const grad = ctx.createRadialGradient(x, y, captureWave.r * 0.28, x, y, captureWave.r)
      grad.addColorStop(0, 'rgba(59,130,246,0.60)')
      grad.addColorStop(0.75, 'rgba(59,130,246,0.22)')
      grad.addColorStop(1, 'rgba(59,130,246,0)')
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, captureWave.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(59,130,246,0.65)'
      // Mantener grosor definido pese al zoom; compensar la escala
      ctx.lineWidth = 1.0 / Math.max(sceneScale, 0.0001)
      ctx.stroke()
      ctx.restore()
    }

    const render = () => {
      if (!running) return
      t++

      // Actualiza progreso de animación sincronizada y escala global
      if (syncAnim) {
        const elapsed = t - syncAnim.startFrame
        syncAnim.progress = clamp(elapsed / syncAnim.duration, 0, 1)
        const e = 1 - Math.pow(1 - syncAnim.progress, 3)
        sceneScale = 1 - 0.10 * e // zoom out más notorio
        if (syncAnim.progress >= 1) {
          sceneScaleFinal = sceneScale
          syncAnim = null // fin de animación sincronizada
        }
      } else {
        sceneScale = sceneScaleFinal // mantener el zoom final permanente
      }

      // Aplicar zoom out al mockup completo durante la animación
      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.scale(sceneScale, sceneScale)
      ctx.translate(-width / 2, -height / 2)

      drawBackground()
      drawStars()
      drawShootingStar()
      if (!shipDestroyed && !isExploding && showShip) {
        drawShip()
      }
      if (isExploding) {
        drawExplosion()
      }
      // Capa de pintura por encima de todo
      drawPaintLayer()
      // Banderas de clan encima de la pintura
      drawFlagsLayer()
      // Efecto de captura (onda azul alrededor de la base del mástil) primero
      drawCaptureWave()
      // Animación de entrada de la bandera después del círculo
      drawEnteringFlag()
      // Bandera estática y mástil al final, nada los tapa
      drawStaticFlags()

      ctx.restore()
      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)

    let lastMove = 0
    const onMove = (e: MouseEvent) => {
      const now = performance.now()
      if (now - lastMove < 16) return // ~60fps throttle
      lastMove = now
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      hue = (190 + (mx / width) * 120) % 360
      parallaxX = (mx / width - 0.5) * 10
      parallaxY = (my / height - 0.5) * 10
      paintColor = `hsl(${(hue + 40) % 360} 90% 65%)`
      if (paintable && isPainting) {
        if (flagMode) applyFlag(mx, my)
        else applyPaint(mx, my)
      }
    }
    canvas.addEventListener('mousemove', onMove, { passive: true })

    const onDown = (e: MouseEvent) => {
      if (!paintable) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      eraseMode = e.button === 2 || e.ctrlKey
      isPainting = true
      if (flagMode) applyFlag(mx, my)
      else applyPaint(mx, my)
    }
    const onUp = () => { isPainting = false }
    const onOut = () => { isPainting = false }
    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('mouseup', onUp)
    canvas.addEventListener('mouseleave', onOut)
    canvas.addEventListener('contextmenu', (ev) => { if (paintable) ev.preventDefault() })

    // Atajos de banderas: B para alternar modo bandera, 1-5 para clan
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'b') {
        flagMode = !flagMode
        e.preventDefault()
      } else if (k === 'escape') {
        flagMode = false
      } else if (/^[1-5]$/.test(k)) {
        flagClan = parseInt(k) - 1
        e.preventDefault()
      }
    }
    canvas.addEventListener('keydown', onKey)

    const onEnter = () => {
      // Intensifica el glow en hover
      for (let i = 0; i < 30; i++) {
        stars.push({ x: Math.random() * width, y: Math.random() * height, r: Math.random() * 1.2 + 0.3, p: Math.random() * Math.PI * 2 })
      }
    }
    const onLeave = () => {
      parallaxX = 0
      parallaxY = 0
    }
    canvas.addEventListener('mouseenter', onEnter)
    canvas.addEventListener('mouseleave', onLeave)
    const onSpawnFlag = () => {
      if (flagAnimPlayedOnce) return
      flagAnimPlayedOnce = true
      spawnStaticFlag()
    }
    canvas.addEventListener('spawn-waving-flag', onSpawnFlag as EventListener)

    // Pausar cuando el canvas no esté visible para ahorrar CPU
    const io = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting
      running = isInView && !document.hidden
      if (running && !raf) {
        raf = requestAnimationFrame(render)
      } else if (!running && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }, { root: null, threshold: 0.1 })
    io.observe(canvas)

    const onVisibility = () => {
      running = isInView && !document.hidden
      if (running && !raf) {
        raf = requestAnimationFrame(render)
      } else if (!running && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    // expone el disparador de explosión a otro efecto
    startExplosionRef.current = startExplosion

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('mouseleave', onOut)
      canvas.removeEventListener('keydown', onKey)
      canvas.removeEventListener('mouseenter', onEnter)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('spawn-waving-flag', onSpawnFlag as EventListener)
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [width, height, paintable, showShip])

  // cuando cambia la señal externa (>0), iniciar explosión (no en el montaje)
  useEffect(() => {
    if (explodeSignal <= 0) return
    if (!startExplosionRef.current) return
    startExplosionRef.current()
  }, [explodeSignal])

  // Señal externa para generar bandera ondeante
  useEffect(() => {
    // la implementación de la bandera vive dentro del efecto principal; aquí no podemos acceder.
    // usamos un atributo data y un evento personalizado para solicitar el spawn.
    if (spawnFlagSignal <= 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ev = new CustomEvent('spawn-waving-flag')
    canvas.dispatchEvent(ev)
  }, [spawnFlagSignal])

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl border border-cyan-900/40 shadow-xl bg-black/60 cursor-crosshair focus:outline-none"
      tabIndex={0}
      aria-label="Lienzo cósmico interactivo"
    />
  )
}