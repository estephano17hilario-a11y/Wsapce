"use client"

import React, { useEffect, useMemo, useState } from "react"
import clsx from 'clsx'
import { fetchETagJSON } from '@/lib/utils'
 

type Plan = {
  id: string
  name: string
  priceMonthly: number
  priceText?: string
  priceSuffix?: string
  // annual price is computed with discount
  featuresTitle: string
  limitsTitle: string
  limits: string[]
  features: string[]
  ctaLabel: string
  variant: "starter" | "creator" | "enterprise"
  ribbon?: string
}

export default function PricingSection() {
  const [user, setUser] = useState<{ id: string; email: string; plan: "bronce" | "plata" | "oro" } | null>(null)
  const [displayName, setDisplayName] = useState<string>("")
  const [bronzeEmail, setBronzeEmail] = useState("")
  const [bronzePassword, setBronzePassword] = useState("")
  const [bronzeShowPwd, setBronzeShowPwd] = useState(false)
  const [bronzeStatus, setBronzeStatus] = useState<{ ok?: boolean; error?: string } | null>(null)
  const [bronzeLoading, setBronzeLoading] = useState(false)
  const [bronzeFlash] = useState(false)
  const [oroProcessing, setOroProcessing] = useState(false)
  const [oroFlash, setOroFlash] = useState(false)
  const [oroStatus, setOroStatus] = useState<{ ok?: boolean; error?: string } | null>(null)
  
  const [captureCells, setCaptureCells] = useState<boolean[]>(() => Array.from({ length: 100 }, () => false))
  const [goldEvents, setGoldEvents] = useState<{ email?: string; name?: string; createdAt?: number }[]>([])
  const foundersCount = useMemo(() => Math.min(100, goldEvents.length), [goldEvents.length])
  const [eventsRefreshing, setEventsRefreshing] = useState(false)
  const [lastEventsFetch, setLastEventsFetch] = useState<number | null>(null)
  const lastAnnounceTsRef = React.useRef<number>(0)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [infoIndex, setInfoIndex] = useState<number | null>(null)
  

  const msg = (code?: string) => {
    switch (code) {
      case 'email_invalid': return 'Email inválido'
      case 'user_exists': return 'Ya estás registrado'
      case 'ref_invalid_or_expired': return 'Enlace inválido o expirado'
      case 'ref_invalid': return 'Enlace inválido'
      case 'ref_expired': return 'Enlace caducado'
      case 'ref_inactive': return 'Enlace inactivo'
      case 'self_referral_not_allowed': return 'No puedes auto-referenciarte'
      case 'invite_limit_reached': return 'Límite de invitaciones alcanzado'
      case 'not_authenticated': return 'No autenticado'
      case 'user_not_found': return 'Usuario no encontrado'
      case 'must_be_bronce': return 'primero tienes que tener el plan bronce'
      case 'must_be_plata': return 'primero tienes que tener el plan bronce'
      case 'debes_registrarte_en_bronce': return 'primero tienes que tener el plan bronce'
      case 'network_error': return 'Error de red'
      default: return code || 'Error'
    }
  }

  const fetchUser = async () => {
    try {
      const r = await fetchETagJSON<{ user?: { id: string; email: string; plan: 'bronce' | 'plata' | 'oro' } }>(
        '/api/user',
        { maxAgeSeconds: 8 }
      )
      if (r.json?.user) setUser(r.json.user)
    } catch {}
  }
  useEffect(() => { fetchUser() }, [])
  
  useEffect(() => {
    const onSess = () => { fetchUser() }
    window.addEventListener('user_session_changed', onSess)
    return () => window.removeEventListener('user_session_changed', onSess)
  }, [])

  

  const maskEmail = (e?: string | null) => {
    if (!e) return '—'
    const parts = e.split('@')
    const name = parts[0] || ''
    const domain = parts[1] || ''
    const nameMask = name.length <= 3 ? `${name.slice(0, 1)}***` : `${name.slice(0, 3)}***`
    const domParts = domain.split('.')
    const provider = domParts[0] || ''
    const tld = domParts.slice(1).join('.')
    const providerMask = provider ? `${provider.slice(0, 1)}***` : ''
    return `${nameMask}@${providerMask}${tld ? `.${tld}` : ''}`
  }

  const initialFor = (nm?: string | null, em?: string | null) => {
    const base = (nm && nm.trim()) ? nm.trim() : (em || '')
    const ch = base.trim().charAt(0)
    return ch ? ch.toUpperCase() : '—'
  }

  const colorFor = (nm?: string | null, em?: string | null) => {
    const s = ((nm || '') + (em || '')).trim()
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i)) % 360
    return `hsl(${h} 85% 60%)`
  }

  const fetchGoldEvents = async () => {
    try {
      setEventsRefreshing(true)
      const r = await fetchETagJSON<{ ok?: boolean; events?: { email?: string; name?: string; createdAt?: number }[] }>(
        '/api/gold/events/recent?limit=50',
        { maxAgeSeconds: 25 }
      )
      const arr = (r.json?.events || []) as { email?: string; name?: string; createdAt?: number }[]
      setGoldEvents(arr)
      setLastEventsFetch(Date.now())
    } catch {}
    finally { setEventsRefreshing(false) }
  }

  useEffect(() => {
    fetchGoldEvents()
    const id = window.setInterval(() => fetchGoldEvents(), 60000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    let es: EventSource | null = null
    try {
      es = new EventSource('/api/gold/stream')
      es.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data) as { email?: string; name?: string; ts?: number }
          const ts = typeof d.ts === 'number' ? d.ts : Date.now()
          if (ts && ts !== lastAnnounceTsRef.current) {
            lastAnnounceTsRef.current = ts
            setGoldEvents((prev) => {
              const exists = prev.some(x => x.createdAt === ts && x.email === d.email)
              const item = { email: d.email, name: d.name, createdAt: ts }
              return exists ? prev : [item, ...prev].slice(0, 50)
            })
            
          }
        } catch {}
      }
    } catch {}
    return () => { try { es?.close() } catch {} }
  }, [])

  useEffect(() => {
    // no-op: referidos removidos
  }, [user?.plan])

  async function ensureMercadoPago(): Promise<boolean> {
    try {
      type MPCtor = new (publicKey: string, options?: { locale?: string }) => { checkout: (opts: { preference: { id: string } }) => { render: (opts: { container: string; label: string }) => void } }
      const has = (window as unknown as { MercadoPago?: MPCtor }).MercadoPago
      if (typeof has === 'function') return true
      await new Promise<void>((resolve, reject) => {
        try {
          const s = document.createElement('script')
          s.src = 'https://sdk.mercadopago.com/js/v2'
          s.async = true
          s.onload = () => resolve()
          s.onerror = () => reject(new Error('mp_sdk_error'))
          document.head.appendChild(s)
        } catch (e) { reject(e as Error) }
      })
      const ok = typeof (window as unknown as { MercadoPago?: MPCtor }).MercadoPago === 'function'
      return ok
    } catch { return false }
  }

  useEffect(() => {
    try {
      const n = typeof window !== 'undefined' ? localStorage.getItem('wspace_name') : ''
      if (n) setDisplayName(n)
      const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const pid = sp ? (sp.get('payment_id') || sp.get('collection_id') || sp.get('id')) : null
      const status = sp ? sp.get('status') : null
      if (pid && status === 'approved') {
        ;(async () => {
          try {
            const r0 = await fetch(`/api/payments/confirm?id=${encodeURIComponent(pid)}`)
            const d = await r0.json()
            if (d?.status === 'approved') {
              const uRes = await fetchETagJSON<{ user?: { id: string; email: string; plan: 'bronce' | 'plata' | 'oro' } }>(
                '/api/user',
                { maxAgeSeconds: 0 }
              )
              const uData = uRes.json || {}
              if (uData?.user) setUser(uData.user)
              try { localStorage.setItem('wspace_auth', JSON.stringify(uData.user)) } catch {}
              try { localStorage.setItem('wspace_email', uData.user?.email || '') } catch {}
              try { window.dispatchEvent(new CustomEvent('user_session_changed')) } catch {}
              const nm = (n && n.trim()) ? n : (uData?.user?.email || '')
              window.setTimeout(() => {
                try {
                  window.dispatchEvent(new CustomEvent('gold_purchased', { detail: { email: uData?.user?.email, name: nm } }))
                } catch {}
              }, 2500)
              setOroStatus({ ok: true })
              try {
                await fetch('/api/gold/announce', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nm }) })
              } catch {}
            }
          } catch {}
          finally {
            try {
              const url = new URL(window.location.href)
              url.search = ''
              history.replaceState({}, '', url.toString())
            } catch {}
          }
        })()
      }
    } catch {}
  }, [])


  const plans: Plan[] = useMemo(
    () => [
      {
        id: "recluta-bronce",
        name: "RECLUTA DE BRONCE",
        priceMonthly: 0,
        priceText: "GRATIS (SOLO REGISTRO)",
        priceSuffix: "",
        limitsTitle: "",
        featuresTitle: "TU VENTAJA",
        limits: [],
        features: [
          "✅ ¡ACCESO ESTÁNDAR: 8 HORAS ANTES!",
          "✅ ¡ENTRA ANTES QUE EL PÚBLICO GENERAL!",
          "✅ Insignia de BRONCE",
        ],
        ctaLabel: "Solo me registro...",
        variant: "enterprise",
      },
      {
        id: "fundador-oro",
        name: "FUNDADOR DE ORO",
        priceMonthly: 1.0,
        priceSuffix: "",
        limitsTitle: "",
        featuresTitle: "TU VENTAJA",
        limits: [],
        features: [
          "✅ ¡ACCESO PRIORITARIO: 48 HORAS ANTES!",
          "✅ ¡CONQUISTA EL LIENZO VIRGEN! ¡SÉ REY!",
          "✅ Insignia de ORO [ETERNA] (¡Que brille!)",
          "✅ Skin de Píxel Dorado",
          "✅ Discord de Élite (Acceso VIP)",
          "✅ Tu nombre en el Leaderboard",
        ],
        ctaLabel: "¡FUNDADOR DE ORO ($1.00)!",
        variant: "starter",
      },
    ],
    []
  )

  const variantLabel = (v: Plan["variant"]) => {
    switch (v) {
      case "starter":
        return "ORO"
      case "creator":
        return "PLATA"
      case "enterprise":
        return "BRONCE"
      default:
        return ""
    }
  }

  const priceLabel = (p: Plan) => {
    if (p.priceText) return p.priceText
    return `$${p.priceMonthly.toFixed(2)}`
  }

  return (
  <section id="pricing" className="relative w-full pt-10 md:pt-18 pb-14 md:pb-24 px-6">
    <div className="relative max-w-7xl mx-auto pricing">
      <div className="text-center">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight shine-text">
          Selecciona el plan que te represente
        </h2>
        <p className="mt-3 text-sm md:text-base text-cyan-200/80">
          para forjar un legado, solo una opcion, es la opcion correcta...
        </p>
        {user && (
          <div className="mt-3 text-xs md:text-sm">
            <div className="text-emerald-300">Ya te has registrado: <span className="text-cyan-200/90">{user.email}</span></div>
          </div>
        )}
      </div>


        {/* Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 justify-items-center w-fit mx-auto">
          {plans.map((plan) => (
            <div key={plan.id} className={`pricing-group pricing-group--${plan.variant}`} id={`section-${plan.variant}`}>
              <div className="pricing-group__label" aria-hidden>
                {variantLabel(plan.variant)}
              </div>
              <article
                className={
                  clsx(
                    `pricing-card pricing-card--${plan.variant} lux-card${plan.variant === 'enterprise' && bronzeFlash ? ' bronze-flash' : ''}`,
                    plan.variant === 'starter' && 'relative',
                    plan.variant === 'enterprise' && 'px-3 py-2 md:px-4 md:py-3'
                  )
                }
              >
              {plan.variant === 'starter' && (
                <>
                  <span aria-hidden className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-amber-400/20 via-yellow-300/10 to-cyan-400/20 blur-2xl opacity-50 animate-pulse" />
                  <span aria-hidden className="absolute inset-0 rounded-3xl ring-2 ring-amber-300/25 animate-pulse" />
                </>
              )}
                {plan.ribbon && (
                  <div className="corner-badge">{plan.ribbon}</div>
                )}

              <div className={clsx('pricing-card__inner', plan.variant === 'enterprise' && 'py-2 md:py-3')}>
                <h3 className={clsx('pricing-card__title', plan.variant === 'enterprise' && 'text-sm md:text-base')}>{plan.name}</h3>
                <div className="pricing-card__price">
                  <span className={`price-value ${plan.id === "fundador-oro" ? "price-big" : ""}`}>{priceLabel(plan)}</span>
                  {plan.priceSuffix && <span className="price-suffix">{plan.priceSuffix}</span>}
                </div>
                {plan.variant === 'starter' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs md:text-sm text-cyan-100/80">
                      <span>Fundadores disponibles</span>
                      <span>{foundersCount} / 100</span>
                    </div>
                    <div className="mt-1 h-2.5 md:h-3 w-full rounded-full bg-neutral-700">
                      <div className="h-full rounded-full" style={{ width: `${foundersCount}%`, background: 'linear-gradient(90deg, rgba(253,224,71,0.95) 0%, rgba(34,211,238,0.92) 100%)' }} />
                    </div>
                  </div>
                )}
                {plan.variant === "starter" && user?.plan === 'oro' && (
                  <div className="success-chip mt-2">Ahora formas parte de la élite, felicidades {displayName || (user?.email || '')}</div>
                )}
                {plan.variant === "enterprise" && (!user ? (
                  <div className="pricing-email">
                    <input
                      type="email"
                      className="pricing-email__input"
                      placeholder="Tu Gmail"
                      inputMode="email"
                      aria-label="Tu Gmail"
                      value={bronzeEmail}
                      onChange={(e) => setBronzeEmail(e.target.value)}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type={bronzeShowPwd ? 'text' : 'password'}
                        className="pricing-email__input flex-1"
                        placeholder="Crea una contraseña"
                        aria-label="Crea una contraseña"
                        value={bronzePassword}
                        onChange={(e) => setBronzePassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-modern-secondary px-3 py-2 text-xs md:text-sm"
                        onClick={() => setBronzeShowPwd(v => !v)}
                      >
                        {bronzeShowPwd ? 'Ocultar' : 'Ver'}
                      </button>
                    </div>
                    <button
                      className={`pricing-cta cta-secondary mt-3 ${bronzeLoading ? 'btn-loading' : ''}`}
                      onClick={async () => {
                        setBronzeStatus(null)
                        setBronzeLoading(true)
                        try {
                          const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: bronzeEmail, password: bronzePassword }) })
                          const data = await res.json()
                          if (!res.ok) { setBronzeStatus({ error: msg(data.error) }); return }
                          setBronzeStatus({ ok: true })
                          setUser(data.user)
                          try { localStorage.setItem('wspace_auth', JSON.stringify(data.user)) } catch {}
                          try { localStorage.setItem('wspace_email', data.user?.email || bronzeEmail) } catch {}
                          try { window.dispatchEvent(new CustomEvent('user_session_changed')) } catch {}
                        } catch { setBronzeStatus({ error: msg('network_error') }) }
                        finally { setBronzeLoading(false) }
                      }}
                    >
                      {bronzeLoading ? 'Registrando…' : plan.ctaLabel}
                    </button>
                    {bronzeStatus?.error && <div className="alert-bad mt-2">{bronzeStatus.error}</div>}
                    {bronzeStatus?.ok && (
                      <div className="success-chip mt-2">Registro completado</div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 p-3 md:p-4 rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-black border border-amber-400/30 shadow-[0_0_30px_rgba(56,189,248,0.15)]">
                    <div className="text-sm md:text-base text-amber-100">Te registraste con éxito</div>
                    <div className="mt-1 text-xs md:text-sm text-cyan-200/90">{user.email}</div>
                    <div className="mt-1 text-xs md:text-sm text-neutral-300">Estate al tanto de nuevas directivas, soldado</div>
                  </div>
                ))}
                {plan.variant !== "enterprise" && (
                  <div className="mt-3">
                    <button
                      className={
                        clsx(
                          'btn-glow-once btn-glow-once--subtle cta-premium cta-blink cta-ambient cta-border-wave px-8 md:px-14 py-5 md:py-6 text-lg md:text-2xl rounded-2xl bg-neutral-900/70 hover:bg-neutral-800/80 text-white shadow-xl relative',
                          { 'btn-loading': oroProcessing }
                        )
                      }
                      disabled={oroProcessing}
                      onClick={async () => {
                        if (plan.variant === 'starter') {
                          try {
                            setOroProcessing(true)
                            setOroStatus(null)
                            setOroFlash(true)
                            setTimeout(() => setOroFlash(false), 900)
                            try {
                              const overlay = document.createElement('div')
                              overlay.className = 'web-burst web-burst--gold'
                              document.body.appendChild(overlay)
                              window.setTimeout(() => { try { overlay.remove() } catch {} }, 1200)
                            } catch {}
                            const r = await fetch('/api/create-payment', { method: 'POST' })
                            let d: unknown = null
                            try { d = await r.json() } catch {}
                            const preferenceId = (d as { preferenceId?: string } | null)?.preferenceId
                            const initPoint = (d as { initPoint?: string | null } | null)?.initPoint || null
                            const err = (d as { error?: string } | null)?.error
                            if (!r.ok || !preferenceId) { setOroStatus({ error: msg(err || 'network_error') }); return }
                            if (initPoint) {
                              try {
                                const u = new URL(window.location.href)
                                u.hash = 'pricing'
                                history.replaceState({}, '', u.toString())
                              } catch {}
                              await new Promise((resolve) => setTimeout(resolve, 250))
                              window.location.href = initPoint
                              setOroStatus({ ok: true })
                              return
                            }
                            const pub = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ?? document.querySelector('meta[name="mp-public-key"]')?.getAttribute('content') ?? undefined
                            if (!pub) { setOroStatus({ error: 'Falta clave pública' }); return }
                            const ok = await ensureMercadoPago()
                            if (!ok) { setOroStatus({ error: 'No se pudo cargar Mercado Pago' }); return }
                            type MPCtor = new (publicKey: string, options?: { locale?: string }) => { checkout: (opts: { preference: { id: string } }) => { render: (opts: { container: string; label: string }) => void } }
                            const MP = (window as unknown as { MercadoPago?: MPCtor }).MercadoPago!
                            const mp = new MP(pub as string, { locale: 'es-PE' })
                            const checkout = mp.checkout({ preference: { id: preferenceId } })
                            checkout.render({ container: '#mp-checkout-gold', label: 'Pagar $1.00 USD' })
                            setOroStatus({ ok: true })
                          } catch {}
                          finally { setOroProcessing(false) }
                          return
                        }
                      }}
                      >
                      {plan.ctaLabel}
                      {plan.variant === 'starter' && (
                        <span aria-hidden className="cta-stars" />
                      )}
                      {plan.variant === 'starter' && (
                        <span aria-hidden className="cta-lights-soft" />
                      )}
                      {plan.variant === 'starter' && (
                        <span aria-hidden className="cta-orbits" />
                      )}
                      {plan.variant === 'starter' && (
                        <span aria-hidden className="cta-orbits cta-orbits--gold" />
                      )}
                      {plan.variant === 'starter' && oroFlash && (
                        <span aria-hidden className="once-ripple-subtle once-ripple-subtle--blue" />
                      )}
                    </button>
                    {plan.variant === 'starter' && (
                      <div id="mp-checkout-gold" />
                    )}
                    {plan.variant === 'starter' && oroStatus?.error && <div className="alert-bad mt-2">{oroStatus.error}</div>}
                  </div>
                )}

                {plan.limits.length > 0 && (
                  <div className="pricing-section">
                    <h4 className="pricing-section__title">{plan.limitsTitle}</h4>
                    <ul className="pricing-list">
                      {plan.limits.map((item) => (
                        <li key={item} className="pricing-list__item">
                          <span className="check" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pricing-section">
                  <h4 className="pricing-section__title">{plan.featuresTitle}</h4>
                  <ul className="pricing-list">
                    {plan.features.map((item) => (
                      <li key={item} className="pricing-list__item">
                        <span className="check" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              </article>
            </div>
          ))}
        </div>
        <div className="mt-2 md:mt-4">
          <div className="text-center text-sm md:text-base bg-gradient-to-r from-amber-300 via-cyan-300 to-yellow-300 bg-clip-text text-transparent font-semibold opacity-90">Espacios de fundadores</div>
          <div className="mt-10 md:mt-12 grid md:grid-cols-2 gap-6 md:gap-8 items-start justify-items-center md:justify-items-start">
            <div className="relative md:justify-self-start mx-auto md:ml-0 md:mr-auto w-full max-w-[90vw] md:max-w-[900px] rounded-3xl p-5 md:p-6 bg-neutral-950/70 border border-amber-400/35 shadow-[0_0_40px_rgba(255,200,0,0.22)] overflow-hidden">
              <span aria-hidden className="absolute -inset-8 bg-gradient-to-r from-amber-400/10 via-cyan-400/8 to-yellow-300/10 blur-2xl mix-blend-screen" />
              <span aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-amber-300/45 rounded-3xl" />
              <div className="grid gap-[2px] place-items-center w-full" style={{ gridTemplateColumns: 'repeat(20,minmax(0,1fr))' }}>
                {Array.from({ length: 100 }).map((_, i) => {
                  const occ = goldEvents[i]
                  const has = !!occ
                  return (
                    <button
                      key={i}
                      className={
                        clsx(
                          'relative w-full aspect-square rounded-xl border bg-neutral-900/70 shadow-sm overflow-hidden transition-transform',
                          'hover:scale-[1.01]',
                          has ? 'border-amber-400/60 ring-2 ring-amber-300/60 bg-amber-500/10' : (captureCells[i] ? 'border-amber-400/60 ring-2 ring-amber-300/60 bg-amber-500/10' : 'border-neutral-700/60')
                        )
                      }
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => setHoverIndex((v) => (v === i ? null : v))}
                      onClick={() => {
                        if (has) { setInfoIndex((v) => v === i ? null : i); return }
                        setCaptureCells((prev) => {
                          const next = prev.slice()
                          next[i] = !next[i]
                          return next
                        })
                      }}
                    >
                      <span aria-hidden className="absolute inset-0 pointer-events-none"><span className="stars-soft" /></span>
                      {has ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="w-5/6 h-5/6 rounded-full bg-neutral-900/90 text-amber-100 text-[10px] md:text-xs font-bold flex items-center justify-center border-2"
                            style={{ borderColor: colorFor(occ?.name || null, occ?.email || null) }}
                          >
                            {initialFor(occ?.name || null, occ?.email || null)}
                          </div>
                          {hoverIndex === i && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none rounded-md border border-amber-400/40 bg-neutral-900/90 text-amber-50 px-2 py-1 text-[10px] md:text-xs shadow-xl">
                              <div>{(occ?.name && occ.name.trim()) ? occ.name.trim() : '—'}</div>
                              <div className="text-cyan-200/90">{maskEmail(occ?.email)}</div>
                              <div className="text-neutral-400">{occ?.createdAt ? new Date(occ.createdAt).toLocaleString() : '—'}</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        captureCells[i] && <span aria-hidden className="once-ripple-subtle once-ripple-subtle--blue" />
                      )}
                    </button>
                  )
                })}
              </div>
              {infoIndex !== null && goldEvents[infoIndex] && (
                <div className="absolute left-1/2 top-3 -translate-x-1/2 z-20 rounded-md border border-amber-400/40 bg-neutral-900/95 text-amber-50 px-3 py-2 text-xs md:text-sm shadow-xl">
                  <div className="font-semibold">{(goldEvents[infoIndex]?.name && goldEvents[infoIndex]?.name?.trim()) ? goldEvents[infoIndex]?.name?.trim() : '—'}</div>
                  <div className="text-cyan-200/90">{maskEmail(goldEvents[infoIndex]?.email)}</div>
                  <div className="text-neutral-400">{goldEvents[infoIndex]?.createdAt ? new Date(goldEvents[infoIndex]!.createdAt!).toLocaleString() : '—'}</div>
                  <div className="mt-2 text-right">
                    <button type="button" className="inline-flex items-center px-2 py-1 rounded-sm border border-amber-400/40 bg-neutral-800/80 text-amber-200 hover:bg-neutral-700/80" onClick={() => setInfoIndex(null)}>Cerrar</button>
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs md:text-sm text-amber-100/80">Fundadores colocados: {Math.min(100, goldEvents.length)} / 100</div>
                <button
                  className="inline-flex items-center px-3 py-1.5 rounded-md border border-amber-400/40 bg-neutral-900/70 text-amber-200 text-xs md:text-sm hover:bg-neutral-800/80"
                  onClick={() => setCaptureCells(Array.from({ length: 100 }, () => false))}
                >
                  Reiniciar
                </button>
              </div>
            </div>
            <div className="w-full max-w-xl md:justify-self-end">
              <div className="flex items-center justify-end">
                <button
                  className={clsx('inline-flex items-center px-3 py-1.5 rounded-md border text-xs md:text-sm transition-colors', eventsRefreshing ? 'border-amber-400/40 bg-neutral-900/70 text-amber-200 opacity-70 cursor-not-allowed' : 'border-amber-400/40 bg-neutral-900/70 text-amber-200 hover:bg-neutral-800/80')}
                  onClick={() => { if (!eventsRefreshing) fetchGoldEvents() }}
                >
                  Refresh
                </button>
              </div>
              <div className="mt-3 p-3 md:p-4 rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-black border border-amber-400/30 shadow-[0_0_30px_rgba(56,189,248,0.15)]">
                <div className="grid grid-cols-3 text-xs md:text-sm text-neutral-300">
                  <div>Nombre</div>
                  <div>Email</div>
                  <div>Fecha</div>
                </div>
                <div className="mt-2 divide-y divide-neutral-800/60">
                  {goldEvents.length === 0 ? (
                    <div className="py-3 text-xs md:text-sm text-neutral-400">Sin registros</div>
                  ) : goldEvents.slice(0, 20).map((ev, idx) => (
                    <div key={idx} className="py-2 grid grid-cols-3 items-center text-xs md:text-sm hover:bg-neutral-900/60 rounded-md">
                      <div className="text-amber-200">{(ev.name && ev.name.trim()) ? ev.name.trim() : '—'}</div>
                      <div className="text-cyan-200/90">{maskEmail(ev.email)}</div>
                      <div className="text-neutral-400">{ev.createdAt ? new Date(ev.createdAt).toLocaleString() : '—'}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[10px] md:text-xs text-neutral-500">{lastEventsFetch ? `Actualizado: ${new Date(lastEventsFetch).toLocaleTimeString()}` : ''}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}