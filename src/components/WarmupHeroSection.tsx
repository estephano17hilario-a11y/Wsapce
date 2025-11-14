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
        <div className="relative p-6 md:p-8 text-center">

          {/* Gancho emocional */}
          <h3 className="text-3xl md:text-5xl font-black tracking-tight shine-text">LA GLORIA ES PARA LOS QUE ACTÚAN.</h3>
          <div className="title-underline" aria-hidden />
          <p className="mt-4 text-sm md:text-lg text-cyan-100/80">
            El Lienzo Virgen espera. El Ejército se forma. El tiempo corre.
          </p>

          {/* CTA minimal y accesible */}
          <div className="mt-7">
            <button
              className={`cta-hero cta-border-wave ${ctaBtnActive ? '' : ''} px-10 md:px-16 py-6 md:py-7 text-lg md:text-2xl rounded-2xl text-white shadow-xl relative`}
              aria-label="¡Sí, quiero mi insignia de emperador!"
              onClick={handleClick}
            >
              ¡Sí, quiero mi insignia de emperador!
              <span aria-hidden className="cta-stars" />
              <span aria-hidden className="cta-orbits" />
              <span aria-hidden className="cta-orbits cta-orbits--gold" />
            </button>
          </div>

          {/* Overlay global elegante al pulsar */}
          {ctaOverlayActive && createPortal(<div aria-hidden className="web-burst web-burst--gold" />, document.body)}
        </div>
      </div>
    </section>
  )
}