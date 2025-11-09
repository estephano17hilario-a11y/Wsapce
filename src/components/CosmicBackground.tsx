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
    let STAR_COUNT = Math.round((width * height) / 14000)
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
    let isInView = false
    let parallaxX = 0
    let parallaxY = 0
    let started = false

    const drawBackground = () => {
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
      grad.addColorStop(0, 'rgba(34, 211, 238, 0.10)')
      grad.addColorStop(0.6, 'rgba(168, 85, 247, 0.10)')
      grad.addColorStop(1, 'rgba(0,0,0,1)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    }

    const drawStars = () => {
      for (const s of stars) {
        const a = 0.5 + 0.5 * Math.sin(t * 0.03 + s.p)
        ctx.fillStyle = `rgba(255,255,255,${a})`
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

    const render = () => {
      if (!running) return
      t++
      drawBackground()
      drawStars()
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

    // iniciar cuando la sección Wspace entre en vista, luego mantener
    const anchor = document.getElementById('wspace-start')
    const io = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting
      if (isInView && !started) {
        started = true
        running = true
        // Activar fondo con transición suave para evitar cortes entre secciones
        canvas.style.opacity = '0.85'
        if (!raf) raf = requestAnimationFrame(render)
      }
    }, { root: null, threshold: 0.2 })
    if (anchor) io.observe(anchor)

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
      STAR_COUNT = Math.round((width * height) / 14000)
      stars = makeStars(STAR_COUNT)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousemove', onMove)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      io.disconnect()
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