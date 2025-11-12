"use client"

import React, { useState } from 'react'
import { createPortal } from 'react-dom'

export default function WarmupHeroSection() {
  const [ctaBtnActive, setCtaBtnActive] = useState(false)
  const [ctaOverlayActive, setCtaOverlayActive] = useState(false)
  const [ctaOverlayPlayed, setCtaOverlayPlayed] = useState(false)

  const handleClick = () => {
    // Brillo elegante del botón
    setCtaBtnActive(true)
    setTimeout(() => setCtaBtnActive(false), 900)
    // Overlay global elegante (misiles dorados sutiles)
    if (!ctaOverlayPlayed) {
      setCtaOverlayPlayed(true)
      setCtaOverlayActive(true)
      setTimeout(() => setCtaOverlayActive(false), 1200)
    }
    // Scroll suave hacia la sección de precios
    setTimeout(() => {
      const el = document.getElementById('pricing')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 180)
  }

  return (
    <section id="cta-warmup" className="relative w-full my-64 md:my-96 px-6">
      <div className="relative max-w-4xl mx-auto">
        <div className="relative warmup-hero p-6 md:p-8 text-center overflow-hidden">
          {/* Overlays cósmicos suaves (sin recuadro) */}
          <span className="nebula-soft" aria-hidden />
          <span className="space-dust-soft" aria-hidden />
          <span className="stars-soft" aria-hidden />
          <span className="blue-accents-soft" aria-hidden />
          <div className="absolute bottom-0 left-0 w-full h-1/2 cta-aurora" aria-hidden />

          {/* Gancho emocional */}
          <h3 className="text-3xl md:text-5xl font-black tracking-tight shine-text">LA PUTA GLORIA ES PARA LOS QUE ACTÚAN.</h3>
          <div className="title-underline" aria-hidden />
          <p className="mt-4 text-sm md:text-lg text-cyan-100/80">
            El Lienzo Virgen espera. El Ejército se forma. El tiempo corre.
          </p>

          {/* CTA — botón elegante y super premium */}
          <div className="mt-7">
            <button
              className={`btn-glow-once btn-glow-once--subtle cta-premium ${ctaBtnActive ? 'btn-glow-once--subtle-active' : ''} px-6 md:px-10 py-4 md:py-6 text-base md:text-lg uppercase tracking-widest rounded-2xl bg-neutral-900/60 hover:bg-neutral-800/70 text-white shadow-xl relative`}
              aria-label="¡SÍ, JODER! ¡QUIERO MI INSIGNIA DE FUNDADOR!"
              onClick={handleClick}
            >
              ¡SÍ, JODER! ¡QUIERO MI INSIGNIA DE FUNDADOR!
              {ctaBtnActive && <span aria-hidden className="once-ripple-subtle once-ripple-subtle--gold" />}
            </button>
          </div>

          {/* Overlay global elegante al pulsar */}
          {ctaOverlayActive && createPortal(<div aria-hidden className="web-burst web-burst--gold" />, document.body)}
        </div>
      </div>
    </section>
  )
}