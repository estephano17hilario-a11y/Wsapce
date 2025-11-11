'use client'

import React, { useRef } from 'react'

export default function HypeSection() {
  const secretRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const tiltRef = useRef({ rx: 0, ry: 0, scale: 1 })

  const schedule = () => {
    if (frameRef.current != null) return
    frameRef.current = requestAnimationFrame(() => {
      const el = secretRef.current
      if (!el) return
      const { rx, ry, scale } = tiltRef.current
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`
      frameRef.current = null
    })
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = secretRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rx = -((y - rect.height / 2) / rect.height) * 20
    const ry = ((x - rect.width / 2) / rect.width) * 24
    tiltRef.current.rx = rx
    tiltRef.current.ry = ry
    tiltRef.current.scale = 1.02
    schedule()
  }

  const resetTilt = () => {
    tiltRef.current = { rx: 0, ry: 0, scale: 1 }
    schedule()
  }

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = secretRef.current
    if (!el) return
    tiltRef.current.scale = 1.03
    schedule()
  }

  const features = [
    { emoji: '🌐', title: 'CHAT GLOBAL', cat: 'Comunidad', catClass: 'cat-comunidad' },
    { emoji: '👕', title: 'SKINS DE CLAN ÚNICAS', cat: 'Comunidad', catClass: 'cat-comunidad' },
    { emoji: '🏆', title: 'RANKINGS GLOBALES', cat: 'Comunidad', catClass: 'cat-comunidad' },
    { emoji: '🗺️', title: 'MINIMAPA DE GUERRA', cat: 'Juego', catClass: 'cat-juego' },
    { emoji: '💣', title: '20+ PÍXELES ESPECIALES', cat: 'Juego', catClass: 'cat-juego' },
    { emoji: '🌌', title: 'UNIVERSO INMENSO', cat: 'Juego', catClass: 'cat-juego' },
    { emoji: '🎤', title: 'CHAT DE VOZ TÁCTICO', cat: 'Tecnología', catClass: 'cat-tecnologia' },
    { emoji: '🔊', title: 'PÍXELES DE AUDIO', cat: 'Tecnología', catClass: 'cat-tecnologia' },
    { emoji: '⚙️', title: 'OPTIMIZACIONES PREMIUM', cat: 'Tecnología', catClass: 'cat-tecnologia' },
  ]

  return (
    <section id="hype-section" className="relative w-full py-20 md:py-28 px-6">
      {/* Luces pesadas removidas para rendimiento: cta-radial, aurora, noise, starfield */}

      <div className="relative max-w-7xl mx-auto">
        <h2 className="text-center text-3xl md:text-6xl font-black tracking-tight shine-text">
          Y ESTO ES SOLO EL PUTO COMIENZO...
        </h2>
        <div className="title-underline" />
        <p className="mt-3 text-center text-sm md:text-base text-cyan-200/80">
          Próximas features agrupadas por tipo — una sola rejilla épica, con distintivos por categoría.
        </p>

        <div className="mt-14">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-items-stretch">
            {features.map((f) => (
              <div key={f.title} className="relative lux-card hover-tilt float-soft p-6 feature-item feature-card" data-emoji={f.emoji}>
                <div className="absolute -inset-4 -z-10 gradient-ring" />
                <span className="orb" aria-hidden />
                <span className="emoji-burst" data-emoji={f.emoji} aria-hidden />
                <span className={`cat-badge ${f.catClass}`}>{f.cat}</span>
                <div className="flex items-center gap-3">
                  <span className="feature-icon text-2xl">[{f.emoji}]</span>
                  <span className="text-lg md:text-xl font-semibold uppercase tracking-wide">{f.title}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <div
              ref={secretRef}
              className="relative lux-card lux-card--soft tilt-3d p-8 hype-secret hype-secret--minimal secret-supernova feature-card max-w-[780px] w-full text-center"
              data-emoji="❓"
              onPointerEnter={handlePointerEnter}
              onPointerMove={handlePointerMove}
              onPointerLeave={resetTilt}
              onPointerCancel={resetTilt}
              onPointerDown={(e) => {
                try { secretRef.current?.setPointerCapture(e.pointerId) } catch {}
              }}
              onPointerUp={(e) => {
                try { secretRef.current?.releasePointerCapture(e.pointerId) } catch {}
              }}
            >
              {/* Se eliminan ring, orb y burst para reducir capas */}
              {/* Overlays ligeros y elegantes */}
              <span className="nebula-soft" aria-hidden />
              <span className="space-dust-soft" aria-hidden />
              <span className="edge-glow-soft" aria-hidden />
              <span className="stars-soft" aria-hidden />
              <span className="blue-accents-soft" aria-hidden />
              <span className="cat-badge cat-secreto">Secreto</span>
              <div className="flex flex-col items-center gap-3">
                <span className="feature-icon text-3xl md:text-4xl tilt-icon">[❓]</span>
                <span className="text-xl md:text-2xl font-extrabold uppercase tracking-wide shine-text tilt-title">FEATURE SECRETA (20/11)</span>
                <span className="text-[10px] md:text-xs font-bold hype-secret-badge tilt-badge">BRILLA</span>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-xs md:text-sm text-cyan-100/80">Algo grande se enciende aquí. Mantente atento.</span>
              </div>
            </div>
          </div>

          {/* Mini sección integrada: anuncio de la app */}
          <div className="mt-12 flex justify-center">
            <div className="relative lux-card lux-card--soft p-8 max-w-[780px] w-full text-center">
              <span className="nebula-soft" aria-hidden />
              <span className="space-dust-soft" aria-hidden />
              <span className="stars-soft" aria-hidden />
              <span className="blue-accents-soft" aria-hidden />
              <span className="edge-glow-soft" aria-hidden />

              <h3 className="text-2xl md:text-3xl font-black tracking-tight shine-text">Wspace App — Lanzamiento 25/12</h3>
              <div className="title-underline" />
              <p className="mt-3 text-xs md:text-sm text-cyan-100/80">Se lanzará después de la versión web</p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:gap-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/30 bg-neutral-900/70 text-emerald-300 shadow-sm">
                  <span className="text-sm">🤖</span>
                  <span className="text-[11px] md:text-xs uppercase tracking-wide">Android</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300/30 bg-neutral-900/70 text-gray-200 shadow-sm">
                  <span className="text-sm"></span>
                  <span className="text-[11px] md:text-xs uppercase tracking-wide">iOS</span>
                </div>

                {/* Mini teléfonos estilizados */}
                <div className="relative w-10 h-20 rounded-2xl border border-neutral-700/60 bg-neutral-950/60 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/30 to-neutral-900/40" />
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-1.5 rounded-full bg-neutral-600/70" />
                  <div className="absolute inset-0 pointer-events-none"><span className="stars-soft" aria-hidden /></div>
                </div>
                <div className="relative w-10 h-20 rounded-2xl border border-neutral-700/60 bg-neutral-950/60 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/30 to-neutral-900/40" />
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-1.5 rounded-full bg-neutral-600/70" />
                  <div className="absolute inset-0 pointer-events-none"><span className="space-dust-soft" aria-hidden /></div>
                </div>
              </div>

              <p className="mt-5 text-[10px] md:text-xs text-gray-300/80">Elegante, cósmico y listo para despegar</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}