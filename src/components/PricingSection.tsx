"use client"

import React, { useMemo, useState } from "react"

type BillingCycle = "monthly" | "annually"

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
  const [cycle, setCycle] = useState<BillingCycle>("monthly")

  const discount = 0.25 // 25% de ahorro para anual

  const plans: Plan[] = useMemo(
    () => [
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
    <section id="pricing" className="relative w-full py-20 md:py-28 px-6">
      <div className="relative max-w-7xl mx-auto pricing">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight shine-text">
            Choose the Perfect Plan for You
          </h2>
          <p className="mt-3 text-sm md:text-base text-cyan-200/80">
            Choose a plan that will help you create professional videos with AI quickly
            and easily. Suitable for personal projects, teamwork and large-scale content.
          </p>
        </div>

        {/* Toggle Monthly / Annually */}
        <div className="mt-6 flex justify-end md:justify-end">
          <div className="pricing-toggle" role="tablist" aria-label="Billing cycle">
            <button
              role="tab"
              aria-selected={cycle === "monthly"}
              className={`toggle-btn ${cycle === "monthly" ? "is-active" : ""}`}
              onClick={() => setCycle("monthly")}
            >
              Monthly
            </button>
            <button
              role="tab"
              aria-selected={cycle === "annually"}
              className={`toggle-btn ${cycle === "annually" ? "is-active" : ""}`}
              onClick={() => setCycle("annually")}
            >
              Annually
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className={`pricing-group pricing-group--${plan.variant}`} id={`section-${plan.variant}`}>
              <div className="pricing-group__label" aria-hidden>
                {variantLabel(plan.variant)}
              </div>
              <article
                className={`pricing-card pricing-card--${plan.variant} lux-card`}
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
                {/* Recuadro para Gmail solo en Bronce */}
                {plan.variant === "enterprise" && (
                  <div className="pricing-email">
                    <input
                      type="email"
                      className="pricing-email__input"
                      placeholder="Tu Gmail"
                      inputMode="email"
                      aria-label="Tu Gmail"
                    />
                  </div>
                )}
                {plan.variant !== "enterprise" && (
                  <button className={`pricing-cta ${plan.variant === "creator" ? "cta-secondary" : "cta-primary"}`}>
                    {plan.ctaLabel}
                  </button>
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