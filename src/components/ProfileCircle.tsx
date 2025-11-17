"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type User = { id: string; email: string; plan: "bronce" | "plata" | "oro"; createdAt?: number; name?: string }

export function planClassFor(plan: "bronce" | "plata" | "oro" | "guest") {
  return plan === "oro" ? "profile-oro" : plan === "plata" ? "profile-plata" : plan === "bronce" ? "profile-bronce" : "profile-guest"
}

export default function ProfileCircle({ inlineName }: { inlineName?: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const startedRef = useRef<number>(0)
  const prevPlanRef = useRef<"bronce" | "plata" | "oro" | "guest" | null>(null)
  const [flash, setFlash] = useState(false)

  const name = useMemo(() => {
    const n = inlineName && inlineName.trim() ? inlineName.trim() : (typeof window !== 'undefined' ? (localStorage.getItem('wspace_name') || "") : "")
    return n
  }, [inlineName])

  const initial = useMemo(() => {
    const base = (name && name.trim()) ? name.trim() : (user?.email || "")
    const ch = (base || "").trim().charAt(0)
    return ch ? ch.toUpperCase() : "—"
  }, [name, user?.email])

  const currentPlan: "bronce" | "plata" | "oro" | "guest" = user?.plan ? user.plan : "guest"
  const planClass = planClassFor(currentPlan)

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
        const newPlan: "bronce" | "plata" | "oro" | "guest" = d.user?.plan ? d.user.plan : "guest"
        if (prevPlanRef.current && prevPlanRef.current !== newPlan) {
          setFlash(true)
          window.setTimeout(() => setFlash(false), 1200)
        }
        prevPlanRef.current = newPlan
        
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
              const newPlan2: "bronce" | "plata" | "oro" | "guest" = ld.user?.plan ? ld.user.plan : "guest"
              if (prevPlanRef.current && prevPlanRef.current !== newPlan2) {
                setFlash(true)
                window.setTimeout(() => setFlash(false), 1200)
              }
              prevPlanRef.current = newPlan2
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
    const onGold = () => { refresh() }
    window.addEventListener('gold_purchased', onGold as EventListener)
    return () => window.removeEventListener('gold_purchased', onGold as EventListener)
  }, [])

  


  useEffect(() => {
    let t: number | null = null
    if (loading) {
      t = window.setTimeout(() => {
        if (loading && performance.now() - (startedRef.current || 0) >= 30000) {
          setError('Tiempo de carga agotado')
          setLoading(false)
        }
      }, 30500)
    }
    return () => { if (t) window.clearTimeout(t) }
  }, [loading])

  return (
    <div className={`profile-anchor`}>
      <button className={`profile-circle ${planClass} ${flash ? 'profile-flash' : ''} ${loading ? 'is-loading' : ''} ${error ? 'profile-error' : ''}`} onClick={() => setOpen((o) => !o)}>
        <span className="profile-initial">{initial}</span>
      </button>
      {open && (
        <div className="profile-panel">
          <div className="profile-title">Perfil</div>
          <div className="profile-row"><span>Nombre</span><span>{(name && name.trim()) ? name : '—'}</span></div>
          <div className="profile-row"><span>Email</span><span>{user?.email || '—'}</span></div>
          <div className="profile-row"><span>Plan</span><span>{user?.plan ? user.plan.toUpperCase() : 'INVITADO'}</span></div>
          <div className="profile-row"><span>Registro</span><span>{user?.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</span></div>
          {error && <div className="profile-row"><span>Error</span><span>{error}</span></div>}
        </div>
      )}
    </div>
  )
}