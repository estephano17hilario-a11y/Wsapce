"use client"

import { useEffect, useRef, useState } from "react"
import { preloadImages } from "@/lib/preload"

export default function LoadingOverlay() {
  const [visible, setVisible] = useState(true)
  const [name, setName] = useState("")
  const [progress, setProgress] = useState(0)
  const [uiProgress, setUiProgress] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const startedRef = useRef(false)
  const prevHtmlOverflowRef = useRef<string>("")
  const prevBodyOverflowRef = useRef<string>("")
  const startAtRef = useRef<number>(0)
  const [timeReady, setTimeReady] = useState(false)

  useEffect(() => {
    startAtRef.current = performance.now()
    const id = setTimeout(() => setTimeReady(true), 1200)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (visible) {
      prevHtmlOverflowRef.current = document.documentElement.style.overflow
      prevBodyOverflowRef.current = document.body.style.overflow
      document.documentElement.style.overflow = "hidden"
      document.body.style.overflow = "hidden"
    } else {
      document.documentElement.style.overflow = prevHtmlOverflowRef.current || ""
      document.body.style.overflow = prevBodyOverflowRef.current || ""
    }
  }, [visible])

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

  useEffect(() => {
    if (!visible) return
    let r = 0
    const step = () => {
      setUiProgress((p) => {
        const target = progress
        const delta = target - p
        if (delta <= 0.001) return target
        const inc = Math.max(0.02, delta * 0.25)
        return Math.min(target, p + inc)
      })
      r = requestAnimationFrame(step)
    }
    r = requestAnimationFrame(step)
    return () => cancelAnimationFrame(r)
  }, [progress, visible])

  const ready = progress >= 1 && timeReady

  const start = () => {
    try {
      const clean = name.trim()
      if (clean) {
        localStorage.setItem("wspace_name", clean)
        window.dispatchEvent(new CustomEvent("user_name_set", { detail: { name: clean } }))
      }
    } catch {}
    document.documentElement.style.overflow = prevHtmlOverflowRef.current || ""
    document.body.style.overflow = prevBodyOverflowRef.current || ""
    setVisible(false)
  }

  return (
    <>
      {visible && (
        <div className="fixed inset-0 z-[9999] bg-black text-white flex items-center justify-center">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
          <div className="relative w-full max-w-lg md:max-w-xl mx-auto p-6 md:p-7 rounded-2xl bg-black/60 border border-white/10 shadow-lg">
            <div className="text-center text-lg md:text-xl font-semibold">¿Cuál es tu nombre?</div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribe tu nombre"
              className="mt-4 w-full rounded-md bg-neutral-900/70 border border-neutral-700 px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-cyan-400"
              aria-label="Nombre"
            />
            <div className="mt-1 text-xs md:text-sm text-neutral-400">(luego descubriras el porqué)</div>
            <div className="mt-4">
              <div className="h-2.5 md:h-3 w-full rounded-full bg-neutral-700">
                <div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.round(uiProgress * 100)}%` }} />
              </div>
              <div className="mt-2 text-sm md:text-base text-neutral-300">Precargando… {Math.round(uiProgress * 100)}%</div>
            </div>
            {ready && (
              <button
                type="button"
                className="mt-6 w-full rounded-md bg-neutral-100 text-black font-bold py-3.5 md:py-4 text-base hover:bg-white/90"
                onClick={start}
              >
                ¿Comenzamos?
              </button>
            )}
          </div>
          <div className="absolute left-4 bottom-3 text-white/70 text-xs md:text-sm">Wspace</div>
        </div>
      )}
      
    </>
  )
}