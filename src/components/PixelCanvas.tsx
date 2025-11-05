'use client';

import { useEffect, useRef } from 'react'

type PixelCanvasProps = {
  width?: number
  height?: number
}

// Canvas cósmico con estrellas, estrella fugaz y pixel art de nave
export default function PixelCanvas({ width = 420, height = 300 }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    const px = 12 // tamaño del píxel
    const shipW = shipMap[0].length * px
    const shipH = shipMap.length * px
    const shipPos = { x: width / 2 - shipW / 2, y: height / 2 - shipH / 2 }

    let hue = 190
    let t = 0
    let raf = 0

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

    const drawStars = () => {
      for (const s of stars) {
        const a = 0.5 + 0.5 * Math.sin(t * 0.03 + s.p)
        ctx.fillStyle = `rgba(255,255,255,${a})`
        ctx.fillRect(s.x, s.y, s.r, s.r)
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

    const render = () => {
      t++
      drawBackground()
      drawStars()
      drawShootingStar()
      drawShip()
      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      hue = (190 + (mx / width) * 120) % 360
    }
    canvas.addEventListener('mousemove', onMove)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousemove', onMove)
    }
  }, [width, height])

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl border border-cyan-900/40 shadow-md bg-black/60"
      aria-label="Lienzo cósmico interactivo"
    />
  )
}