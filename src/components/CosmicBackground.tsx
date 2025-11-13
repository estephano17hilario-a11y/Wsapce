'use client'

import { useEffect, useRef } from 'react'

// Fondo cósmico fullscreen: estrellas y estrella fugaz
export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Suavizar transición: iniciar invisible y hacer fade-in al entrar Wspace
    canvas.style.opacity = '0'
    canvas.style.transition = 'opacity 700ms ease-out'

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    // configuración de estrellas
    let width = window.innerWidth
    let height = window.innerHeight
    const makeStars = (count: number) => (
      Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.5,
        p: Math.random() * Math.PI * 2,
      }))
    )
    let STAR_COUNT = Math.round((width * height) / 9000)
    let stars = makeStars(STAR_COUNT)

    const shoot = {
      x: -20,
      y: Math.random() * height * 0.4 + 10,
      vx: Math.max(240, width) / 140,
      life: 140,
    }

    let t = 0
    let raf = 0
    let running = false
    let parallaxX = 0
    let parallaxY = 0
    let started = false

    const drawBackground = () => {
      // Base igual a la escena 6: gradiente vertical suave
      const linear = ctx.createLinearGradient(0, 0, 0, height)
      // slate-950 en top, negro al resto para continuidad
      linear.addColorStop(0, 'rgba(15,23,42,1)')
      linear.addColorStop(0.45, 'rgba(0,0,0,1)')
      linear.addColorStop(1, 'rgba(0,0,0,1)')
      ctx.fillStyle = linear
      ctx.fillRect(0, 0, width, height)

      // Aurora/radial muy sutil para mantener el carácter cósmico
      const aurora = ctx.createRadialGradient(
        width * 0.5,
        height * 0.55,
        24,
        width * 0.5,
        height * 0.45,
        Math.max(width, height)
      )
      aurora.addColorStop(0, 'rgba(34, 211, 238, 0.045)')
      aurora.addColorStop(0.6, 'rgba(168, 85, 247, 0.045)')
      aurora.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = aurora
      ctx.fillRect(0, 0, width, height)
    }

    const drawStars = () => {
      for (const s of stars) {
        const a = 0.95 * (0.6 + 0.4 * Math.sin(t * 0.03 + s.p))
        ctx.fillStyle = `rgba(255,255,255,${a})`
        const px = s.x + parallaxX * 0.08 * s.r
        const py = s.y + parallaxY * 0.08 * s.r
        ctx.fillRect(px, py, s.r, s.r)
      }
    }

    const colorStars = Array.from({ length: Math.max(12, Math.round(STAR_COUNT * 0.012)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.5 + 1.5,
      c: ['#ffd54f','#ff8a65','#4fc3f7','#81c784','#9575cd'][Math.floor(Math.random()*5)],
    }))
    const drawColorStars = () => {
      for (const s of colorStars) {
        ctx.fillStyle = s.c
        const px = s.x + parallaxX * 0.06
        const py = s.y + parallaxY * 0.06
        ctx.beginPath()
        ctx.arc(px, py, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const nebulas = (() => {
      const arr = [] as { x: number; y: number; r: number; stops: { c: string; a: number; p: number }[] }[]
      const base = Math.max(width, height)
      const preset = [
        { x: width*0.18, y: height*0.25, r: base*0.18, stops: [ { c: 'rgba(168,85,247,1)', a: 0.12, p: 0 }, { c: 'rgba(34,211,238,1)', a: 0.10, p: 0.35 }, { c: 'rgba(0,0,0,1)', a: 0, p: 1 } ] },
        { x: width*0.78, y: height*0.32, r: base*0.22, stops: [ { c: 'rgba(99,102,241,1)', a: 0.12, p: 0 }, { c: 'rgba(59,130,246,1)', a: 0.10, p: 0.4 }, { c: 'rgba(0,0,0,1)', a: 0, p: 1 } ] },
        { x: width*0.52, y: height*0.15, r: base*0.16, stops: [ { c: 'rgba(236,72,153,1)', a: 0.10, p: 0 }, { c: 'rgba(251,191,36,1)', a: 0.08, p: 0.35 }, { c: 'rgba(0,0,0,1)', a: 0, p: 1 } ] },
        { x: width*0.32, y: height*0.75, r: base*0.2, stops: [ { c: 'rgba(20,184,166,1)', a: 0.11, p: 0 }, { c: 'rgba(147,197,253,1)', a: 0.09, p: 0.4 }, { c: 'rgba(0,0,0,1)', a: 0, p: 1 } ] },
        { x: width*0.88, y: height*0.72, r: base*0.15, stops: [ { c: 'rgba(234,88,12,1)', a: 0.10, p: 0 }, { c: 'rgba(245,158,11,1)', a: 0.08, p: 0.35 }, { c: 'rgba(0,0,0,1)', a: 0, p: 1 } ] },
      ]
      for (const n of preset) arr.push(n)
      return arr
    })()
    const drawNebulas = () => {
      for (const n of nebulas) {
        const g = ctx.createRadialGradient(n.x, n.y, 12, n.x, n.y, n.r)
        for (const s of n.stops) g.addColorStop(s.p, s.c.replace('1)', `${s.a})`))
        ctx.fillStyle = g
        ctx.globalCompositeOperation = 'lighter'
        ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2)
        ctx.globalCompositeOperation = 'source-over'
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

    const render = () => {
      if (!running) return
      t++
      drawBackground()
      drawNebulas()
      drawStars()
      drawColorStars()
      drawShootingStar()
      raf = requestAnimationFrame(render)
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      parallaxX = (mx / width - 0.5) * 10
      parallaxY = (my / height - 0.5) * 10
    }
    canvas.addEventListener('mousemove', onMove, { passive: true })

    const onStartCosmic = () => {
      if (started) return
      started = true
      running = true
      canvas.style.opacity = '0.85'
      if (!raf) raf = requestAnimationFrame(render)
    }
    window.addEventListener('start_cosmic', onStartCosmic)

    const onVisibility = () => {
      // si ya empezó, pausa animación cuando pestaña esté oculta
      if (!started) return
      running = !document.hidden
      if (running && !raf) {
        raf = requestAnimationFrame(render)
      } else if (!running && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    const onResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      resize()
      STAR_COUNT = Math.round((width * height) / 9000)
      stars = makeStars(STAR_COUNT)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousemove', onMove)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('start_cosmic', onStartCosmic)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-30 pointer-events-none mix-blend-screen opacity-0"
      aria-hidden="true"
    />
  )
}