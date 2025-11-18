"use client"

import { useEffect, useRef, useState } from "react"
import { preloadImages } from "@/lib/preload"
import { fetchETagJSON } from "@/lib/utils"

export default function LoadingOverlay() {
  const [visible, setVisible] = useState(true)
  const [name, setName] = useState("")
  const [progress, setProgress] = useState(0)
  const [uiProgress, setUiProgress] = useState(0)
  const [nameDelayOk, setNameDelayOk] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const startedRef = useRef(false)
  const prevHtmlOverflowRef = useRef<string>("")
  const prevBodyOverflowRef = useRef<string>("")
  const startAtRef = useRef<number>(0)
  const [timeReady, setTimeReady] = useState(false)
  const nameDelayTimerRef = useRef<number | null>(null)
  const typedAtRef = useRef<number>(0)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginOk, setLoginOk] = useState(false)
  const [savedEmail, setSavedEmail] = useState<string>("")
  const [hasCookieSession, setHasCookieSession] = useState(false)

  useEffect(() => {
    startAtRef.current = performance.now()
    const id = setTimeout(() => setTimeReady(true), 1200)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    try {
      const skip = typeof window !== 'undefined' ? (sessionStorage.getItem('skip_overlay_once') === '1') : false
      if (skip) {
        try { sessionStorage.removeItem('skip_overlay_once') } catch {}
        setVisible(false)
      }
    } catch {}
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetchETagJSON<{ user?: { id: string; email: string; plan: 'bronce' | 'plata' | 'oro' } }>(
          '/api/user',
          { maxAgeSeconds: 0 }
        )
        const d = r.json || {}
        const u = (d as { user?: { id: string; email: string; plan: 'bronce' | 'plata' | 'oro' } }).user
        if (u) {
          try { localStorage.setItem('wspace_auth', JSON.stringify(u)) } catch {}
          try { window.dispatchEvent(new CustomEvent('user_session_changed')) } catch {}
          setHasCookieSession(true)
          try { if (!localStorage.getItem('wspace_email')) localStorage.setItem('wspace_email', u.email) } catch {}
        } else {
          let email: string | null = null
          try { email = JSON.parse(localStorage.getItem('wspace_auth') || 'null')?.email || null } catch {}
          if (!email) {
            try { email = localStorage.getItem('wspace_email') || null } catch {}
          }
          if (email) setSavedEmail(email)
        }
      } catch {}
    })()
  }, [])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const n = localStorage.getItem('wspace_name')
        if (n) setName(n)
      }
    } catch {}
  }, [])

  useEffect(() => {
    const hasText = name.trim().length > 0
    if (hasText) {
      typedAtRef.current = performance.now()
      if (nameDelayTimerRef.current) { clearTimeout(nameDelayTimerRef.current); nameDelayTimerRef.current = null }
      window.setTimeout(() => setNameDelayOk(false), 0)
      nameDelayTimerRef.current = window.setTimeout(() => { setNameDelayOk(true) }, 600)
      try { localStorage.setItem('wspace_name', name.trim()) } catch {}
    } else {
      typedAtRef.current = 0
      if (nameDelayTimerRef.current) { clearTimeout(nameDelayTimerRef.current); nameDelayTimerRef.current = null }
      window.setTimeout(() => setNameDelayOk(false), 0)
    }
    return () => { if (nameDelayTimerRef.current) { clearTimeout(nameDelayTimerRef.current); nameDelayTimerRef.current = null } }
  }, [name])

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
    try { window.dispatchEvent(new CustomEvent('overlay_visible_changed', { detail: { visible } })) } catch {}
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
      "/persona sun up - copia.webp",
    ]
    const total = urls.length
    preloadImages(urls, (loaded) => {
      const p = Math.min(1, loaded / Math.max(1, total))
      setProgress(p)
    }, 8000).catch(() => {})
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

  const ready = timeReady && name.trim().length > 0 && nameDelayOk

  const start = () => {
    try {
      const clean = name.trim()
      if (clean) {
        localStorage.setItem("wspace_name", clean)
        window.dispatchEvent(new CustomEvent("user_name_set", { detail: { name: clean } }))
        try { fetch('/api/profile/name', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: clean }) }) } catch {}
      }
    } catch {}
    document.documentElement.style.overflow = prevHtmlOverflowRef.current || ""
    document.body.style.overflow = prevBodyOverflowRef.current || ""
    setVisible(false)
  }

  const accountDetected = hasCookieSession || !!savedEmail

  return (
    <>
      {visible && (
        <div className="fixed inset-0 z-[9999] bg-black text-white flex items-center justify-center">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
          <div className="relative w-full max-w-lg md:max-w-xl mx-auto p-6 md:p-7 rounded-2xl bg-black/60 border border-white/10 shadow-lg">
            {accountDetected ? (
              <div className="mt-2">
                <div className="text-center text-lg md:text-xl font-semibold">Cuenta detectada</div>
                <div className="mt-4 grid gap-3">
                  <button
                    type="button"
                    className="w-full rounded-md bg-neutral-100 text-black font-bold py-3.5 md:py-4 text-base hover:bg-white/90"
                    onClick={async () => {
                      if (loginLoading) return
                      setLoginError(null)
                      setLoginOk(false)
                      setLoginLoading(true)
                      try {
                        let ok = false
                        if (hasCookieSession) {
                          ok = true
                        } else if (savedEmail) {
                          const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: savedEmail }) })
                          const d = await r.json()
                          if (r.ok) {
                            ok = true
                            try { localStorage.setItem('wspace_auth', JSON.stringify(d.user)) } catch {}
                            try { localStorage.setItem('wspace_email', d.user?.email || savedEmail) } catch {}
                            try { window.dispatchEvent(new CustomEvent('user_session_changed')) } catch {}
                          } else {
                            setLoginError(d?.error || 'error')
                          }
                        }
                        if (ok) {
                          const url = new URL(window.location.href)
                          url.hash = 'pricing'
                          history.replaceState({}, '', url.toString())
                        }
                      } catch {}
                      document.documentElement.style.overflow = prevHtmlOverflowRef.current || ""
                      document.body.style.overflow = prevBodyOverflowRef.current || ""
                      setVisible(false)
                      try { const el = document.getElementById('pricing'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) } catch {}
                      setLoginOk(true)
                    }}
                  >
                    Entrar por cuenta <span className="ml-1 blur-soft">{(typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('wspace_auth') || 'null')?.email || localStorage.getItem('wspace_email') || savedEmail || '') : '') || 'detectada'}</span>
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-md border border-neutral-600 bg-neutral-900/70 text-neutral-200 font-semibold py-3.5 md:py-4 text-base hover:bg-neutral-800/80"
                    onClick={() => { setLoginOpen(true); setLoginError(null); setLoginOk(false) }}
                  >
                    Entrar por otra cuenta
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center text-lg md:text-xl font-semibold">¿Cuál es tu nombre?</div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Escribe tu nombre"
                  className="mt-4 w-full rounded-md bg-neutral-900/70 border border-neutral-700 px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  aria-label="Nombre"
                  autoFocus
                  maxLength={80}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (ready) start() } }}
                />
              </>
            )}
            <div className="mt-1 text-xs md:text-sm text-neutral-400">(luego descubriras el porqué)</div>
            <div className="mt-4">
              <div className="h-2.5 md:h-3 w-full rounded-full bg-neutral-700">
                <div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.round(uiProgress * 100)}%` }} />
              </div>
              <div className="mt-2 text-sm md:text-base text-neutral-300">Precargando… {Math.round(uiProgress * 100)}%</div>
            </div>
            {!accountDetected && progress >= 1 && timeReady && name.trim().length === 0 && (
              <div className="mt-3 text-xs md:text-sm text-red-300">Ingresa tu nombre para continuar</div>
            )}
            {!accountDetected && ready && (
              <button
                type="button"
                className="mt-6 w-full rounded-md bg-neutral-100 text-black font-bold py-3.5 md:py-4 text-base hover:bg-white/90"
                onClick={start}
              >
                ¿Comenzamos?
              </button>
            )}
            {!accountDetected && (
              <div className="mt-6 text-center">
                <span className="text-xs md:text-sm text-neutral-300">¿ya tienes cuenta?</span>
                <button type="button" className="ml-2 inline-flex items-center px-3 py-1.5 rounded-md border border-cyan-400/40 bg-neutral-900/70 text-cyan-200 text-xs md:text-sm hover:bg-neutral-800/80" onClick={() => { setLoginOpen(true); setLoginError(null); setLoginOk(false) }}>Iniciar sesión</button>
              </div>
            )}
          </div>
          <div className="absolute left-4 bottom-3 text-white/70 text-xs md:text-sm">Wspace</div>
          {loginOpen && (
            <div className="absolute inset-0 z-[10000] grid place-items-center bg-black/60">
              <div className="lux-card p-5 w-[92%] max-w-sm bg-neutral-900/80 border border-cyan-400/30">
                <div className="text-center text-lg font-bold">Inicia sesión</div>
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Tu Gmail" className="mt-4 w-full rounded-md bg-neutral-900 border border-neutral-700 px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-cyan-400" aria-label="Tu Gmail" />
                {loginError && <div className="mt-2 text-xs text-red-400">{loginError}</div>}
                {loginOk && <div className="mt-2 text-xs text-emerald-300">Sesión iniciada</div>}
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button type="button" className="px-3 py-1.5 rounded-md text-xs md:text-sm bg-neutral-800 text-white" onClick={() => setLoginOpen(false)}>Cerrar</button>
                  <button type="button" className={`px-3 py-1.5 rounded-md text-xs md:text-sm ${loginLoading ? 'opacity-60 cursor-not-allowed' : 'bg-cyan-500 text-black hover:bg-cyan-400'}`} onClick={async () => {
                    if (loginLoading) return
                    setLoginError(null)
                    setLoginOk(false)
                    setLoginLoading(true)
                    try {
                      const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail }) })
                      const d = await r.json()
                      if (!r.ok) { setLoginError(d.error || 'error'); return }
                      setLoginOk(true)
                      try { localStorage.setItem('wspace_auth', JSON.stringify(d.user)) } catch {}
                      try { localStorage.setItem('wspace_email', d.user?.email || loginEmail) } catch {}
                      try { window.dispatchEvent(new CustomEvent('user_session_changed')) } catch {}
                      try {
                        const url = new URL(window.location.href)
                        url.hash = 'pricing'
                        history.replaceState({}, '', url.toString())
                      } catch {}
                      setLoginOpen(false)
                      document.documentElement.style.overflow = prevHtmlOverflowRef.current || ""
                      document.body.style.overflow = prevBodyOverflowRef.current || ""
                      setVisible(false)
                      try {
                        const el = document.getElementById('pricing')
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      } catch {}
                    } catch { setLoginError('network_error') }
                    finally { setLoginLoading(false) }
                  }}>Entrar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
    </>
  )
}