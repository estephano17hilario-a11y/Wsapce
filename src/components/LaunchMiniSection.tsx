'use client'

import React from 'react'

export default function LaunchMiniSection() {
  return (
    <section id="launch-announcement" className="relative w-full py-16 md:py-20 px-6">
      <div className="relative max-w-5xl mx-auto">
        <div className="relative lux-card lux-card--soft p-8 md:p-10 overflow-hidden text-center">
          {/* Overlays cósmicos suaves para coherencia visual */}
          <span className="nebula-soft" aria-hidden />
          <span className="space-dust-soft" aria-hidden />
          <span className="stars-soft" aria-hidden />
          <span className="blue-accents-soft" aria-hidden />
          <span className="edge-glow-soft" aria-hidden />

          <h3 className="text-2xl md:text-4xl font-black tracking-tight shine-text">
            Wspace App — Lanzamiento 25/12
          </h3>
          <div className="title-underline" />
          <p className="mt-3 text-sm md:text-base text-cyan-100/80">
            Se lanzará después de la versión web
          </p>

          {/* Referencias Android y Apple con elementos de teléfono elegantes */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {/* Badge Android */}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-emerald-400/30 bg-neutral-900/70 text-emerald-300 shadow-sm">
              <AndroidIcon className="w-4 h-4" />
              <span className="text-xs md:text-sm uppercase tracking-wide">Android</span>
            </div>
            {/* Badge Apple */}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300/30 bg-neutral-900/70 text-gray-200 shadow-sm">
              <AppleIcon className="w-4 h-4" />
              <span className="text-xs md:text-sm uppercase tracking-wide">iOS</span>
            </div>

            {/* Mini teléfonos estilizados */}
            <div className="relative w-10 h-20 rounded-2xl border border-neutral-700/60 bg-neutral-950/60 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/30 to-neutral-900/40" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-1.5 rounded-full bg-neutral-600/70" />
              <div className="absolute inset-0 pointer-events-none">
                <span className="stars-soft" aria-hidden />
              </div>
            </div>
            <div className="relative w-10 h-20 rounded-2xl border border-neutral-700/60 bg-neutral-950/60 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/30 to-neutral-900/40" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-1.5 rounded-full bg-neutral-600/70" />
              <div className="absolute inset-0 pointer-events-none">
                <span className="space-dust-soft" aria-hidden />
              </div>
            </div>
          </div>

          <p className="mt-6 text-[11px] md:text-xs text-gray-300/80">
            Elegante, cósmico y listo para despegar
          </p>
        </div>
      </div>
    </section>
  )
}

function AndroidIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5l-1.5-2a.5.5 0 11.86-.5L8.9 4.9a8 8 0 016.2 0l1.54-2.9a.5.5 0 11.86.5L16 5m-9 4a1 1 0 112 0 1 1 0 01-2 0zm9 0a1 1 0 112 0 1 1 0 01-2 0z" />
      <rect x="4" y="9" width="16" height="9" rx="3" />
      <rect x="7" y="18" width="3" height="3" rx="1" />
      <rect x="14" y="18" width="3" height="3" rx="1" />
    </svg>
  )
}

function AppleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.5 13.5c0-2.2 1.8-3 1.8-3-.9-1.2-2.3-1.3-2.8-1.3-.8 0-1.6.5-2 .5-.4 0-1.1-.5-1.8-.5-1.7 0-3.4 1.3-3.4 3.8 0 2.5 1.8 6 3.9 6 .7 0 1.1-.5 1.9-.5s1.1.5 1.9.5c1.5 0 3.7-3.1 3.7-5.5m-2.3-9c.3-.3.5-.8.5-1.3-.5.1-1 .4-1.3.7-.3.3-.5.8-.5 1.3.5 0 1-.4 1.3-.7z" />
    </svg>
  )
}