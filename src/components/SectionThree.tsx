'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function SectionThree() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const col1Ref = useRef<HTMLDivElement>(null)
  const col2Ref = useRef<HTMLDivElement>(null)
  const col3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'bottom 15%',
      },
    })

    tl.from(titleRef.current, {
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: 'power2.out',
    })
      .from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.5')
      .from([col1Ref.current, col2Ref.current, col3Ref.current], {
        opacity: 0,
        y: 50,
        scale: 0.98,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.15,
      }, '-=0.3')

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full bg-black py-28 px-6">
      {/* Fondo cósmico y textura premium */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[70vw] h-[70vw] cta-radial" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 cta-aurora" />
        <div className="absolute inset-0 premium-noise" />
      </div>

      <div className="max-w-7xl mx-auto">
        <h2
          ref={titleRef}
          className="text-center text-3xl md:text-6xl font-black tracking-tight cinematic-text shine-text mb-4"
        >
          BIENVENIDO A LA PUTA GUERRA.
        </h2>
        <p
          ref={subtitleRef}
          className="text-center text-lg md:text-xl text-gray-300 italic mb-16"
        >
          En Wplace pintabas. En Wspace CONQUISTAS.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          {/* Columna 1: Comunicación */}
          <div ref={col1Ref} className="relative lux-card hover-tilt p-6">
            <div className="absolute -inset-4 -z-10 gradient-ring" />
            <div className="war-chat w-[300px] h-[200px] rounded-lg border border-cyan-900/40 ring-1 ring-cyan-300/10 shadow-xl overflow-hidden bg-black/70">
              <div className="war-chat-header">
                <span className="war-chat-channel">Canal: #CLAN_ALFA</span>
                <span className="war-chat-status">(3/50 EN LÍNEA)</span>
              </div>
              <div className="war-chat-body">
                <div className="war-chat-msg"><span className="war-chat-actor">[Soldado_X]:</span><span className="war-chat-text">Aquí en <span className="war-chat-coords">12932,2353</span></span><span className="war-chat-goto">IR A UBICACIÓN</span></div>
                <div className="war-chat-msg"><span className="war-chat-actor you">[TÚ_Comandante]:</span><span className="war-chat-text">¡Entendido! ¡Enviando Píxel Bomba!</span></div>
                <div className="war-chat-msg"><span className="war-chat-actor">[Soldado_Y]:</span><span className="war-chat-text">¡Joder, qué buena!</span></div>
                <div className="war-chat-msg system"><span className="war-chat-text">[Soldado_Z]: (Se ha unido al canal)</span></div>
              </div>
              <div className="war-chat-input">
                <div className="war-chat-inputbar" contentEditable suppressContentEditableWarning data-placeholder="Escribe tu táctica aquí..."></div>
                <div className="war-chat-send">ENVIAR</div>
              </div>
              <div className="absolute inset-0 premium-noise pointer-events-none" />
            </div>
            <h3 className="mt-6 text-white text-xl font-bold">CHAT DE GUERRA TÁCTICO</h3>
            <p className="mt-3 text-gray-300 leading-relaxed text-sm">
              Coordina ataques en tiempo real. Forma clanes. Identifica aliados. Aquí no estás solo, estás en un puto ejército.
            </p>
          </div>

          {/* Columna 2: Armamento */}
          <div ref={col2Ref} className="relative lux-card hover-tilt p-6">
            <div className="absolute -inset-4 -z-10 gradient-ring" />
            <div className="relative w-[300px] h-[200px] rounded-lg bg-neutral-900/85 border border-neutral-700/40 ring-1 ring-purple-300/10 shadow-xl overflow-hidden flex items-center justify-center text-neutral-400 text-[10px] md:text-xs uppercase tracking-widest select-none placeholder-shimmer">
              Mockup entrante
            </div>
            <h3 className="mt-6 text-white text-xl font-bold">ARSENAL DE CONQUISTA</h3>
            <p className="mt-3 text-gray-300 leading-relaxed text-sm">
              ¿Píxeles normales? ¡No me jodas! Despliega Píxeles Bomba para reventar sus defensas. Usa Caballos de Troya para infiltrarte. Esto no es arte, es dominio.
            </p>
          </div>

          {/* Columna 3: Estrategia */}
          <div ref={col3Ref} className="relative lux-card hover-tilt p-6">
            <div className="absolute -inset-4 -z-10 gradient-ring" />
            <div className="relative w-[300px] h-[200px] rounded-lg bg-neutral-900/85 border border-neutral-700/40 ring-1 ring-amber-300/10 shadow-xl overflow-hidden flex items-center justify-center text-neutral-400 text-[10px] md:text-xs uppercase tracking-widest select-none placeholder-shimmer">
              Mockup entrante
            </div>
            <h3 className="mt-6 text-white text-xl font-bold">GUERRA DE GUERRILLAS 24/7</h3>
            <p className="mt-3 text-gray-300 leading-relaxed text-sm">
              Forma bandos de guerrilla. Libra una guerra constante. En Wspace, el imperio nunca duerme. ¿Crees que puedes descansar?
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}