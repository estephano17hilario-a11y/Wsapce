"use client"

import { useEffect, useRef, useState } from "react"
import { preloadImages } from "@/lib/preload"

export default function LoadingOverlay() {
  const [visible, setVisible] = useState(true)
  const [name, setName] = useState("")
  const [progress, setProgress] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const startedRef = useRef(false)
  const prevHtmlOverflowRef = useRef<string>("")
  const prevBodyOverflowRef = useRef<string>("")

  useEffect(() => {
    prevHtmlOverflowRef.current = document.documentElement.style.overflow
    prevBodyOverflowRef.current = document.body.style.overflow
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflowRef.current || ""
      document.body.style.overflow = prevBodyOverflowRef.current || ""
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const STAR_COUNT = Math.min(80, Math.max(40, Math.round((w * h) / 40000)))
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      p: Math.random() * Math.PI * 2,
    }))

    let t = 0
    let last = performance.now()

    const draw = (now: number) => {
      const dt = now - last
      if (dt < 33) { // ~30fps
        rafRef.current = requestAnimationFrame(draw)
        return
      }
      last = now
      t += dt
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, w, h)
      for (const s of stars) {
        const a = 0.85 * (0.6 + 0.4 * Math.sin(t * 0.0015 + s.p))
        ctx.fillStyle = `rgba(255,255,255,${a})`
        ctx.fillRect(s.x, s.y, s.r, s.r)
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    if (!startedRef.current) {
      startedRef.current = true
      rafRef.current = requestAnimationFrame(draw)
    }
    return () => { cancelAnimationFrame(rafRef.current) }
  }, [])

  useEffect(() => {
    const urls = [
      "/andromeda up - copia.webp",
      "/espacio azul up - copia.webp",
      "/persona sun up - copia.webp",
      "/perxonas up - copia.webp",
      "/tierra para implementar - copia - copia.webp",
    ]
    const total = urls.length
    preloadImages(urls, (loaded) => {
      const p = Math.min(1, loaded / Math.max(1, total))
      setProgress(p)
    }).catch(() => {})
  }, [])

  const ready = progress >= 1

  const start = () => {
    try {
      const clean = name.trim()
      if (clean) {
        localStorage.setItem("wspace_name", clean)
        window.dispatchEvent(new CustomEvent("user_name_set", { detail: { name: clean } }))
      }
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-white flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
      <div className="relative w-full max-w-sm mx-auto p-5 rounded-xl bg-black/60 border border-white/10 shadow-lg">
        <div className="text-center font-semibold">¿Cuál es tu nombre?</div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Escribe tu nombre"
          className="mt-3 w-full rounded-md bg-neutral-900/70 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
          aria-label="Nombre"
        />
        <div className="mt-4">
          <div className="h-1.5 w-full rounded-full bg-neutral-700">
            <div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="mt-2 text-xs text-neutral-300">Precargando… {Math.round(progress * 100)}%</div>
        </div>
        {ready && (
          <button
            type="button"
            className="mt-5 w-full rounded-md bg-neutral-100 text-black font-bold py-2.5 hover:bg-white/90"
            onClick={start}
          >
            ¿Comenzamos?
          </button>
        )}
      </div>
    </div>
  )
}