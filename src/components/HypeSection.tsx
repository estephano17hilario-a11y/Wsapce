'use client'

import React from 'react'

export default function HypeSection() {

  const features = [
    { emoji: '🌐', title: 'CHAT GLOBAL', cat: 'Comunidad', catClass: 'cat-comunidad', desc: 'Chat en tiempo real en diferentes canales, incluyendo al chat global' },
    { emoji: '👕', title: 'SKINS DE CLAN ÚNICAS', cat: 'Comunidad', catClass: 'cat-comunidad', desc: 'Los clanes son buenos, pero necesitan personalidad para cada miembro..' },
    { emoji: '🏆', title: 'RANKINGS GLOBALES', cat: 'Comunidad', catClass: 'cat-comunidad', desc: 'Los mejores de los mejores, los que toman acción, pertenecen aquí' },
    { emoji: '🗺️', title: 'MINIMAPA DE GUERRA', cat: 'Juego', catClass: 'cat-juego', desc: 'Es un herramienta táctica para la guerra, en especial, si se da, en el espacio...' },
    { emoji: '💣', title: '20+ PÍXELES ESPECIALES', cat: 'Juego', catClass: 'cat-juego', desc: 'Píxeles zombie, bomba, troya, cambia forma, entre otros más espectaculares...' },
    { emoji: '🌌', title: 'UNIVERSO INMENSO', cat: 'Juego', catClass: 'cat-juego', desc: 'Si la tierra te parece grande, el universo, ¿qué es? Es tan inimaginable su tamaño, pero pronto lo podrás ver...' },
    { emoji: '🎤', title: 'CHAT DE VOZ TÁCTICO', cat: 'Tecnología', catClass: 'cat-tecnologia', desc: 'Escribir, hablar y coordinar, que empieze la guerraaa' },
    { emoji: '🔊', title: 'PÍXELES DE AUDIO', cat: 'Tecnología', catClass: 'cat-tecnologia', desc: 'Este píxel es muy especial, es uno donde tu voz o audio, va a quedar resonando en el espacio...' },
    { emoji: '⚙️', title: 'CUENTA PERSONALIZABLE', cat: 'Tecnología', catClass: 'cat-tecnologia', desc: 'banners, banderas, perfiles, nombres, logros, insignias. Desmuestra tu superioridad...' },
  ]

  return (
    <section id="hype-section" className="relative w-full py-20 md:py-28 px-6">
      {/* Luces pesadas removidas para rendimiento: cta-radial, aurora, noise, starfield */}

      <div className="relative max-w-7xl mx-auto">
        <h2 className="text-center text-3xl md:text-6xl font-black tracking-tight shine-text">
          Y ESTO ES SOLO EL COMIENZO...
        </h2>
        <div className="title-underline" />
        <p className="mt-3 text-center text-sm md:text-base text-cyan-200/80">
          Features agrupadas por tipo — una sola rejilla épica, con distintivos por categoría.
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
                {f.desc && (
                  <p className="mt-2 text-xs md:text-sm text-cyan-100/80 leading-relaxed">{f.desc}</p>
                )}
              </div>
            ))}
          </div>

          {/* Layout lado a lado: Secreto + anuncio app */}
  <div className="mt-12 relative group">
            {/* Conector sutil entre tarjetas (solo md+) */}
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-cyan-300/40 via-purple-300/30 to-cyan-300/40 blur-[1px] opacity-70 hidden md:block transition-opacity duration-700 group-hover:opacity-90" />
            <div className="grid gap-6 md:grid-cols-2">
              {/* Columna: Secreto */}
              <div className="flex justify-center">
                <div
                  className="relative lux-card lux-card--soft lux-card--dark lux-card--gold-ring p-6 hype-secret hype-secret--minimal secret-supernova feature-card max-w-[780px] w-full text-center"
                  data-emoji="❓"
                  
                >
                  {/* Overlays ligeros y elegantes */}
                  <span className="inner-lights inner-lights--gold" aria-hidden />
                  <span className="nebula-soft" aria-hidden />
                  <span className="space-dust-soft" aria-hidden />
                  <span className="edge-glow-soft" aria-hidden />
                  <span className="stars-soft" aria-hidden />
                  <span className="blue-accents-soft" aria-hidden />
                  <span className="cat-badge cat-secreto">Secreto</span>
                  <div className="flex flex-col items-center gap-2">
                    <span className="feature-icon text-2xl md:text-3xl tilt-icon">[❓]</span>
                    <span className="text-lg md:text-xl font-extrabold uppercase tracking-wide shine-text tilt-title">FEATURE SECRETA (30/11)</span>
                    <span className="text-[10px] md:text-xs font-bold hype-secret-badge tilt-badge">BRILLA</span>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="text-xs md:text-sm text-cyan-100/80">Algo grande se enciende aquí. Mantente atento.</span>
                  </div>
                </div>
              </div>

              {/* Columna: anuncio app */}
              <div className="flex justify-center">
                <div
                  className="relative lux-card lux-card--soft lux-card--dark lux-card--blue-border p-6 max-w-[780px] w-full text-center"
                  
                >
                  <span className="inner-lights inner-lights--blue" aria-hidden />
                  <span className="nebula-soft" aria-hidden />
                  <span className="space-dust-soft" aria-hidden />
                  <span className="stars-soft" aria-hidden />
                  <span className="blue-accents-soft" aria-hidden />
                  <span className="edge-glow-soft" aria-hidden />

                  <h3 className="text-xl md:text-2xl font-black tracking-tight shine-text">Wspace App — Lanzamiento 25/12</h3>
                  <div className="title-underline" />
                  <p className="mt-3 text-xs md:text-sm text-cyan-100/80">Se lanzará después de la versión web</p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 md:gap-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/30 bg-neutral-900/70 text-emerald-300 shadow-sm">
                      <span className="text-sm">🤖</span>
                      <span className="text-[11px] md:text-xs uppercase tracking-wide">Android</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300/30 bg-neutral-900/70 text-gray-200 shadow-sm">
                      <span className="text-sm"></span>
                      <span className="text-[11px] md:text-xs uppercase tracking-wide">iOS</span>
                    </div>

                    {/* Mini teléfonos estilizados */}
                    <div
                      className="relative w-9 h-16 rounded-2xl border border-neutral-700/60 bg-neutral-950/60 shadow-lg overflow-hidden"
                      
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/30 to-neutral-900/40" />
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-1.5 rounded-full bg-neutral-600/70" />
                      <div className="absolute inset-0 pointer-events-none"><span className="stars-soft" aria-hidden /></div>
                    </div>
                    <div
                      className="relative w-9 h-16 rounded-2xl border border-neutral-700/60 bg-neutral-950/60 shadow-lg overflow-hidden"
                      
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/30 to-neutral-900/40" />
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-1.5 rounded-full bg-neutral-600/70" />
                      <div className="absolute inset-0 pointer-events-none"><span className="space-dust-soft" aria-hidden /></div>
                    </div>
                  </div>

              <p className="mt-3 text-[10px] md:text-xs text-gray-300/80">Elegante, cósmico y listo para despegar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}