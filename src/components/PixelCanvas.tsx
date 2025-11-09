'use client';

import { useEffect, useRef } from 'react'

type PixelCanvasProps = {
  width?: number
  height?: number
  // Señal incremental para disparar la explosión desde el exterior
  explodeSignal?: number
  // Modo pintura por celdas tipo pixel
  paintable?: boolean
}

// Canvas cósmico con estrellas, estrella fugaz y pixel art de nave
export default function PixelCanvas({ width = 420, height = 300, explodeSignal = 0, paintable = false }: PixelCanvasProps) {
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
    let particles: Array<{ x: number, y: number, vx: number, vy: number, color: string, size: number }> = []
    // onda de choque y centro de explosión
    let shockwaveR = 0
    let centerX = shipPos.x + shipW / 2
    let centerY = shipPos.y + shipH / 2

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
        // Reducimos la opacidad de las líneas en 75% (0.08 -> 0.02)
        ctx.strokeStyle = 'rgba(255,255,255,0.02)'
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
          particles.push({ x, y, vx, vy, color, size })
        }
      }
    }

    const drawExplosion = () => {
      // destello inicial fuerte con gradiente y modo aditivo
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      if (explosionFrame < 14) {
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.4)
        grad.addColorStop(0, `rgba(255,255,255,${0.45})`)
        grad.addColorStop(0.25, `rgba(255,255,255,${0.20})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)
      }
      // onda de choque (anillo expansivo)
      shockwaveR += 3.2
      ctx.beginPath()
      ctx.lineWidth = 2 + Math.max(0, 12 - explosionFrame * 0.15)
      ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.35 - explosionFrame * 0.005)})`
      ctx.arc(centerX, centerY, shockwaveR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // partículas con desvanecido temporal
      const alpha = Math.max(0, 1 - explosionFrame / explosionMax)
      ctx.save()
      ctx.globalAlpha = alpha
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.982
        p.vy = p.vy * 0.982 + 0.035 // leve gravedad
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, p.size, p.size)
      }
      ctx.restore()

      explosionFrame++
      if (explosionFrame >= explosionMax) {
        isExploding = false
        shipDestroyed = true
        particles = []
      }
    }

    const render = () => {
      if (!running) return
      t++
      drawBackground()
      drawStars()
      drawShootingStar()
      if (!shipDestroyed && !isExploding) {
        drawShip()
      }
      if (isExploding) {
        drawExplosion()
      }
      // Capa de pintura por encima de todo
      drawPaintLayer()
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
        applyPaint(mx, my)
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
      applyPaint(mx, my)
    }
    const onUp = () => { isPainting = false }
    const onOut = () => { isPainting = false }
    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('mouseup', onUp)
    canvas.addEventListener('mouseleave', onOut)
    canvas.addEventListener('contextmenu', (ev) => { if (paintable) ev.preventDefault() })

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
      canvas.removeEventListener('mouseenter', onEnter)
      canvas.removeEventListener('mouseleave', onLeave)
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [width, height, paintable])

  // cuando cambia la señal externa (>0), iniciar explosión (no en el montaje)
  useEffect(() => {
    if (explodeSignal <= 0) return
    if (!startExplosionRef.current) return
    startExplosionRef.current()
  }, [explodeSignal])

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl border border-cyan-900/40 shadow-xl bg-black/60 cursor-crosshair"
      aria-label="Lienzo cósmico interactivo"
    />
  )
}