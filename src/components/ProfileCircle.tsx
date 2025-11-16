"use client"

import { useEffect, useMemo, useState } from "react"

type User = { id: string; email: string; plan: "bronce" | "plata" | "oro"; createdAt?: number; name?: string }

export default function ProfileCircle({ inlineName }: { inlineName?: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const [hiddenByCinematic, setHiddenByCinematic] = useState(false)

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
      const r = await fetch('/api/user', { cache: 'no-store' })
      const d = await r.json()
      if (d?.user) {
        queueMicrotask(() => setUser(d.user))
        try { localStorage.setItem('wspace_auth', JSON.stringify(d.user)) } catch {}
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
            }
          } catch {}
        }
      }
    } catch {}
  }

  useEffect(() => { const id = setTimeout(() => { refresh() }, 0); return () => clearTimeout(id) }, [])
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

  return (
    <div className={`profile-anchor ${hiddenByCinematic ? 'hidden' : ''}`}>
      <button className={`profile-circle ${planClass}`} onClick={() => setOpen((o) => !o)}>
        <span className="profile-initial">{initial}</span>
      </button>
      {open && (
        <div className="profile-panel">
          <div className="profile-title">Perfil</div>
          <div className="profile-row"><span>Nombre</span><span>{(name && name.trim()) ? name : '—'}</span></div>
          <div className="profile-row"><span>Email</span><span>{user?.email || '—'}</span></div>
          <div className="profile-row"><span>Plan</span><span>{user?.plan ? user.plan.toUpperCase() : 'NO REGISTRADO'}</span></div>
          <div className="profile-row"><span>Registro</span><span>{user?.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</span></div>
        </div>
      )}
    </div>
  )
}