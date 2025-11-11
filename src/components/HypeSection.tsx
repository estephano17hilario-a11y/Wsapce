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
        </div>
      </div>
    </section>
  )
}