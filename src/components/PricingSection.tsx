"use client"

import React, { useEffect, useMemo, useState } from "react"
import clsx from 'clsx'
 

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
  const [bronzeRef, setBronzeRef] = useState("")
  const [plataLinkStatus, setPlataLinkStatus] = useState<"unknown" | "valid" | "expired" | "inactive" | "not_found">("unknown")
  const [bronzeStatus, setBronzeStatus] = useState<{ ok?: boolean; error?: string } | null>(null)
  const [bronzeLoading, setBronzeLoading] = useState(false)
  const [plataLink, setPlataLink] = useState<string | null>(null)
  const [plataStatus, setPlataStatus] = useState<{ ok?: boolean; error?: string } | null>(null)
  const [plataGenerating, setPlataGenerating] = useState(false)
  const [plataExpiresAt, setPlataExpiresAt] = useState<number | null>(null)
  const [bronzeFlash, setBronzeFlash] = useState(false)
  const [oroProcessing, setOroProcessing] = useState(false)
  const [oroFlash, setOroFlash] = useState(false)
  const [oroStatus, setOroStatus] = useState<{ ok?: boolean; error?: string } | null>(null)

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
      const res = await fetch('/api/user', { cache: 'no-store' })
      const data = await res.json()
      if (data.user) setUser(data.user)
    } catch {}
  }
  useEffect(() => { fetchUser() }, [])
  
  useEffect(() => {
    const onSess = () => { fetchUser() }
    window.addEventListener('user_session_changed', onSess)
    return () => window.removeEventListener('user_session_changed', onSess)
  }, [])

  useEffect(() => {
    if (user?.plan === 'plata') {
      ;(async () => {
        try {
          setPlataStatus(null)
          const r = await fetch('/api/referrals/status', { cache: 'no-store' })
          const d = await r.json()
          if (!r.ok) { setPlataStatus({ error: msg(d.error) }); return }
          setPlataLinkStatus((d?.status || 'unknown') as typeof plataLinkStatus)
          setPlataLink(typeof d?.code === 'string' ? d.code : null)
          setPlataExpiresAt(typeof d?.expiresAt === 'number' ? d.expiresAt : null)
        } catch { setPlataStatus({ error: msg('network_error') }) }
      })()
    }
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
      const ref = sp ? (sp.get('ref') || '') : ''
      if (ref && ref.trim().length >= 8) setBronzeRef(ref.trim())
      const pid = sp ? (sp.get('payment_id') || sp.get('collection_id') || sp.get('id')) : null
      const status = sp ? sp.get('status') : null
      if (pid && status === 'approved') {
        ;(async () => {
          try {
            const r = await fetch(`/api/payments/confirm?id=${encodeURIComponent(pid)}`)
            const d = await r.json()
            if (d?.status === 'approved') {
              const uRes = await fetch('/api/user', { cache: 'no-store' })
              const uData = await uRes.json()
              if (uData?.user) setUser(uData.user)
              try { localStorage.setItem('wspace_auth', JSON.stringify(uData.user)) } catch {}
              try { localStorage.setItem('wspace_email', uData.user?.email || '') } catch {}
              try { window.dispatchEvent(new CustomEvent('user_session_changed')) } catch {}
              window.setTimeout(() => {
                try {
                  const nm = (n && n.trim()) ? n : (uData?.user?.email || '')
                  window.dispatchEvent(new CustomEvent('gold_purchased', { detail: { email: uData?.user?.email, name: nm } }))
                } catch {}
              }, 2500)
              setOroStatus({ ok: true })
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
      {
        id: "heraldo-plata",
        name: "HERALDO DE PLATA",
        priceMonthly: 0,
        priceText: "GRATIS (CON 5 RECLUTAS)",
        priceSuffix: "",
        limitsTitle: "",
        featuresTitle: "TU VENTAJA",
        limits: [],
        features: [
          "✅ ¡ACCESO TÁCTICO: 18 HORAS ANTES!",
          "✅ ¡ASEGURA TU TERRITORIO!",
          "✅ Insignia de PLATA",
        ],
        ctaLabel: "Pagar con Sangre (Generar mi Link)",
        variant: "creator",
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
  <section id="pricing" className="relative w-full pt-14 md:pt-18 pb-20 md:pb-24 px-6">
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
            {user.plan === 'plata' && (
              <div className="mt-2">
                <div className="text-emerald-300">Ya eres PLATA</div>
                {plataLink ? (
                  <div className="break-all text-cyan-200/90 mt-1">Tu enlace único: {plataLink}</div>
                ) : (
                  <div className="mt-1 text-cyan-200/80">
                    <div className="loading-dots" />
                    <div className="mt-1">Generando tu enlace único…</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>


        {/* Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className={`pricing-group pricing-group--${plan.variant}`} id={`section-${plan.variant}`}>
              <div className="pricing-group__label" aria-hidden>
                {variantLabel(plan.variant)}
              </div>
              <article
                className={`pricing-card pricing-card--${plan.variant} lux-card${plan.variant === 'enterprise' && bronzeFlash ? ' bronze-flash' : ''}`}
              >
              {plan.ribbon && (
                <div className="corner-badge">{plan.ribbon}</div>
              )}

              <div className="pricing-card__inner">
                <h3 className="pricing-card__title">{plan.name}</h3>
                <div className="pricing-card__price">
                  <span className={`price-value ${plan.id === "fundador-oro" ? "price-big" : ""}`}>{priceLabel(plan)}</span>
                  {plan.priceSuffix && <span className="price-suffix">{plan.priceSuffix}</span>}
                </div>
                {plan.variant === "starter" && user?.plan === 'oro' && (
                  <div className="success-chip mt-2">Ahora formas parte de la élite, felicidades {displayName || (user?.email || '')}</div>
                )}
                {plan.variant === "enterprise" && (
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
                    <input
                      type="text"
                      className="pricing-email__input mt-2"
                      placeholder="Coloca enlace de invitación (opcional)"
                      aria-label="Enlace de invitación"
                      value={bronzeRef}
                      onChange={(e) => setBronzeRef(e.target.value)}
                    />
                    <button
                      className={`pricing-cta cta-secondary mt-3 ${bronzeLoading ? 'btn-loading' : ''}`}
                      onClick={async () => {
                        setBronzeStatus(null)
                        setPlataLink(null)
                        setBronzeLoading(true)
                        try {
                          const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: bronzeEmail, referralLink: bronzeRef }) })
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
                    {user && (
                      <div className="success-chip mt-2">Ya te has registrado: <span className="text-cyan-200/90">{user.email}</span></div>
                    )}
                  </div>
                )}
                {plan.variant !== "enterprise" && (
                  <div className="mt-3">
                    <button
                      className={
                        plan.variant === 'starter'
                          ? clsx(
                              'btn-glow-once btn-glow-once--subtle cta-premium cta-blink cta-ambient cta-border-wave px-8 md:px-14 py-5 md:py-6 text-lg md:text-2xl rounded-2xl bg-neutral-900/70 hover:bg-neutral-800/80 text-white shadow-xl relative',
                              { 'btn-loading': oroProcessing }
                            )
                          : clsx(
                              'pricing-cta',
                              plan.variant === 'creator' ? 'cta-secondary' : 'cta-primary',
                              { 'btn-loading': plan.variant === 'creator' && plataGenerating },
                              { 'opacity-60 cursor-not-allowed': plan.variant === 'creator' && !!plataLink && plataLinkStatus === 'valid' }
                            )
                      }
                      disabled={plan.variant === 'creator' && !!plataLink && plataLinkStatus === 'valid'}
                      onClick={async () => {
                        if (plan.variant === 'creator') {
                          setPlataStatus(null)
                          setPlataLink(null)
                          if (plataLink) { return }
                          if (!user) { setPlataStatus({ error: msg('debes_registrarte_en_bronce') }); setBronzeFlash(true); setTimeout(() => setBronzeFlash(false), 1200); return }
                          if (user.plan === 'bronce') {
                            try {
                              const res = await fetch('/api/upgrade', { method: 'POST' })
                              const data = await res.json()
                              if (!res.ok) { setPlataStatus({ error: msg(data.error) }); return }
                              setUser(data.user)
                              try { localStorage.setItem('wspace_auth', JSON.stringify(data.user)) } catch {}
                              try { window.dispatchEvent(new CustomEvent('user_session_changed')) } catch {}
                            } catch { setPlataStatus({ error: msg('network_error') }); return }
                          }
                          setPlataGenerating(true)
                          try {
                            const res = await fetch('/api/referrals/generate', { method: 'POST' })
                            const data = await res.json()
                            if (!res.ok) { setPlataStatus({ error: msg(data.error) }); if (data.error === 'must_be_plata') { setBronzeFlash(true); setTimeout(() => setBronzeFlash(false), 1200) } return }
                            setPlataStatus({ ok: true })
                            setPlataLink(data.link as string)
                            setPlataExpiresAt(typeof data.expiresAt === 'number' ? data.expiresAt : null)
                          } catch { setPlataStatus({ error: msg('network_error') }) }
                          finally { setPlataGenerating(false) }
                          return
                        }
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
                      {plan.variant === 'creator' ? (plataGenerating ? 'Generando enlace…' : plan.ctaLabel) : plan.ctaLabel}
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
                    {plan.variant === 'creator' && (
                      <div className="mt-2 text-xs text-cyan-200/80">
                        {user?.plan === 'plata' ? (
                          plataLinkStatus === 'valid' ? 'Tu plan: PLATA — Enlace activo' : plataLinkStatus === 'expired' ? 'Tu plan: PLATA — Enlace caducado (genera uno nuevo)' : plataLinkStatus === 'inactive' ? 'Tu plan: PLATA — Enlace inactivo (genera uno nuevo)' : 'Tu plan: PLATA — Aún no has generado enlace'
                        ) : user?.plan === 'bronce' ? 'Tu plan: BRONCE (se requiere subir a PLATA para generar link)' : 'Regístrate en BRONCE para continuar'}
                      </div>
                    )}
                    {plan.variant === 'creator' && plataGenerating && (
                      <div className="mt-3 text-xs">
                        <div className="loading-dots" />
                        <div className="text-cyan-200/80 mt-1">Generando tu enlace único…</div>
                      </div>
                    )}
                    {plan.variant === 'creator' && plataLink && plataLinkStatus === 'valid' && (
                      <div className="mt-3 text-xs">
                        <div className="text-emerald-300">Enlace generado:</div>
                        <div className="break-all text-cyan-200/90">{plataLink}</div>
                        {plataExpiresAt && (
                          <div className="text-cyan-200/70 mt-1">Expira: {new Date(plataExpiresAt).toLocaleDateString()}</div>
                        )}
                        <div className="text-cyan-200/70 mt-1">Este enlace es único de tu cuenta y queda bloqueado 90 días.</div>
                      </div>
                    )}
                    {plan.variant === 'creator' && plataStatus?.error && <div className="alert-bad mt-2">{plataStatus.error}</div>}
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
      </div>
    </section>
  )
}