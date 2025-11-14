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
  const [bronzeEmail, setBronzeEmail] = useState("")
  const [bronzeRef, setBronzeRef] = useState("")
  const [bronzeStatus, setBronzeStatus] = useState<{ ok?: boolean; error?: string } | null>(null)
  const [bronzeLoading, setBronzeLoading] = useState(false)
  const [plataLink, setPlataLink] = useState<string | null>(null)
  const [plataStatus, setPlataStatus] = useState<{ ok?: boolean; error?: string } | null>(null)
  const [plataGenerating, setPlataGenerating] = useState(false)
  const [plataExpiresAt, setPlataExpiresAt] = useState<number | null>(null)
  const [bronzeFlash, setBronzeFlash] = useState(false)
  const [oroProcessing, setOroProcessing] = useState(false)

  const msg = (code?: string) => {
    switch (code) {
      case 'email_invalid': return 'Email inválido'
      case 'user_exists': return 'Ya estás registrado'
      case 'ref_invalid_or_expired': return 'Enlace inválido o expirado'
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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/user', { cache: 'no-store' })
        const data = await res.json()
        if (data.user) setUser(data.user)
      } catch {}
    }
    load()
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
        priceMonthly: 4.99,
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
        ctaLabel: "¡FORJAR MI LEGADO [ORO] ($4.99)!",
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
                              { 'opacity-60 cursor-not-allowed': plan.variant === 'creator' && !!plataLink }
                            )
                      }
                      disabled={plan.variant === 'creator' && !!plataLink}
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
                            const r = await fetch('/api/create-payment', { method: 'POST' })
                            const d = await r.json()
                            if (!r.ok || !d.id) { return }
                            const pub = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || 'APP_USR-442ce80d-80a5-4712-a832-dd98e0b4844e'
                            type MPCtor = new (publicKey: string, options?: { locale?: string }) => { checkout: (opts: { preference: { id: string }; autoOpen?: boolean }) => void }
                            const MP = (window as unknown as { MercadoPago?: MPCtor }).MercadoPago
                            if (typeof MP === 'function') {
                              const mp = new MP(pub, { locale: 'es-PE' })
                              mp.checkout({ preference: { id: d.id }, autoOpen: true })
                            }
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
                    </button>
                    {plan.variant === 'creator' && (
                      <div className="mt-2 text-xs text-cyan-200/80">
                        {user?.plan === 'plata' ? 'Tu plan: PLATA' : user?.plan === 'bronce' ? 'Tu plan: BRONCE (se requiere subir a PLATA para generar link)' : 'Regístrate en BRONCE para continuar'}
                      </div>
                    )}
                    {plan.variant === 'creator' && plataGenerating && (
                      <div className="mt-3 text-xs">
                        <div className="loading-dots" />
                        <div className="text-cyan-200/80 mt-1">Generando tu enlace único…</div>
                      </div>
                    )}
                    {plan.variant === 'creator' && plataLink && (
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