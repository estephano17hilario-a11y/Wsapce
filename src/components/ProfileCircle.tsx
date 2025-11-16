"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type User = { id: string; email: string; plan: "bronce" | "plata" | "oro"; createdAt?: number; name?: string }

export default function ProfileCircle({ inlineName }: { inlineName?: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const [hiddenByCinematic, setHiddenByCinematic] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const startedRef = useRef<number>(0)

  const name = useMemo(() => {
    const n = inlineName && inlineName.trim() ? inlineName.trim() : (typeof window !== 'undefined' ? (localStorage.getItem('wspace_name') || "") : "")
    return n
  }, [inlineName])

  const initial = useMemo(() => {
    const base = (name && name.trim()) ? name.trim() : (user?.email || "")
    const ch = (base || "").trim().charAt(0)
    return ch ? ch.toUpperCase() : "—"
  }, [name, user?.email])

  const planClass = user?.plan === "oro" ? "profile-oro" : user?.plan === "plata" ? "profile-plata" : "profile-bronce"

  const refresh = async () => {
    try {
      setLoading(true)
      setError(null)
      const r = await fetch('/api/user', { cache: 'no-store' })
      const d = await r.json()
      if (d?.user) {
        queueMicrotask(() => setUser(d.user))
        try { localStorage.setItem('wspace_auth', JSON.stringify(d.user)) } catch {}
        setLoading(false)
      } else {
        let email: string | null = null
        try { email = JSON.parse(localStorage.getItem('wspace_auth') || 'null')?.email || null } catch {}
        if (!email) { try { email = localStorage.getItem('wspace_email') || null } catch {} }
        if (email) {
          try {
            const lr = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
            const ld = await lr.json()
            if (lr.ok && ld?.user) {
              queueMicrotask(() => setUser(ld.user))
              try { localStorage.setItem('wspace_auth', JSON.stringify(ld.user)) } catch {}
              setLoading(false)
            } else {
              setLoading(false)
            }
          } catch { setLoading(false) }
        } else {
          setLoading(false)
        }
      }
    } catch { setLoading(false) }
  }

  useEffect(() => { startedRef.current = performance.now(); const id = setTimeout(() => { refresh() }, 0); return () => clearTimeout(id) }, [])
  useEffect(() => {
    const fn = () => { refresh() }
    window.addEventListener('user_session_changed', fn)
    return () => window.removeEventListener('user_session_changed', fn)
  }, [])

  useEffect(() => {
    const el = typeof window !== 'undefined' ? document.getElementById('cinematic-zone') : null
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => { try { queueMicrotask(() => setHiddenByCinematic(entry.isIntersecting)) } catch {} }, { threshold: 0.15 })
    obs.observe(el)
    return () => { try { obs.disconnect() } catch {} }
  }, [])

  useEffect(() => {
    const onOverlay = (e: Event) => {
      const v = (e as CustomEvent<{ visible: boolean }>).detail?.visible ?? false
      queueMicrotask(() => setOverlayVisible(v))
    }
    window.addEventListener('overlay_visible_changed', onOverlay as EventListener)
    return () => window.removeEventListener('overlay_visible_changed', onOverlay as EventListener)
  }, [])

  useEffect(() => {
    let t: number | null = null
    if (loading) {
      t = window.setTimeout(() => {
        if (loading && performance.now() - startedAt >= 30000) {
          setError('Tiempo de carga agotado')
          setLoading(false)
        }
      }, 30500)
    }
    return () => { if (t) window.clearTimeout(t) }
  }, [loading])

  return (
    <div className={`profile-anchor ${hiddenByCinematic && !overlayVisible ? 'hidden' : ''}`}>
      <button className={`profile-circle ${planClass} ${loading ? 'is-loading' : ''} ${error ? 'profile-error' : ''}`} onClick={() => setOpen((o) => !o)}>
        <span className="profile-initial">{initial}</span>
      </button>
      {open && (
        <div className="profile-panel">
          <div className="profile-title">Perfil</div>
          <div className="profile-row"><span>Nombre</span><span>{(name && name.trim()) ? name : '—'}</span></div>
          <div className="profile-row"><span>Email</span><span>{user?.email || '—'}</span></div>
          <div className="profile-row"><span>Plan</span><span>{user?.plan ? user.plan.toUpperCase() : 'NO REGISTRADO'}</span></div>
          <div className="profile-row"><span>Registro</span><span>{user?.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</span></div>
          {error && <div className="profile-row"><span>Error</span><span>{error}</span></div>}
        </div>
      )}
    </div>
  )
}