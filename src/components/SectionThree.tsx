'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PixelCanvas from '@/components/PixelCanvas'

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
  const inputRef = useRef<HTMLDivElement>(null)
  const [userMessages, setUserMessages] = useState<string[]>([])
  const [explodeTick, setExplodeTick] = useState(0)

  const handleSend = () => {
    const text = inputRef.current?.innerText || ''
    const clean = text.trim()
    if (!clean) return
    setUserMessages((prev) => [...prev, clean])
    if (inputRef.current) {
      inputRef.current.innerText = ''
    }
  }

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
    <section ref={sectionRef} className="relative z-40 w-full bg-transparent py-28 px-6">
      {/* Fondo cósmico y textura premium (debajo del contenido) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[70vw] h-[70vw] cta-radial" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 cta-aurora" />
        <div className="absolute inset-0 premium-noise" />
      </div>

      <div className="relative z-40 max-w-7xl mx-auto">
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
                {userMessages.map((msg, i) => (
                  <div key={i} className="war-chat-msg"><span className="war-chat-actor you">[lider]:</span><span className="war-chat-text">{msg}</span></div>
                ))}
              </div>
              <div className="war-chat-input">
                <div
                  ref={inputRef}
                  className="war-chat-inputbar"
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder="Escribe tu táctica aquí..."
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
                  onInput={() => {
                    const el = inputRef.current
                    if (!el) return
                    // Evita saltos de línea para que no crezca la altura
                    el.innerText = el.innerText.replace(/[\r\n]+/g, ' ')
                  }}
                ></div>
                <div
                  className="war-chat-send"
                  onMouseEnter={() => {
                    const el = inputRef.current
                    if (el) el.blur()
                  }}
                  onClick={handleSend}
                >
                  ENVIAR
                </div>
              </div>
              <div className="absolute inset-0 premium-noise pointer-events-none" />
            </div>
            <h3 className="mt-6 text-white text-xl font-bold">CHAT DE GUERRA TÁCTICO</h3>
            <p className="mt-3 text-gray-300 leading-relaxed text-sm">
              Coordina ataques en tiempo real. Forma clanes. Identifica aliados. Aquí no estás solo, estás en un puto ejército.
            </p>
          </div>

          {/* Columna 2: Armamento */}
          <div ref={col2Ref} className="relative lux-card hover-tilt float-soft p-6">
            <div className="absolute -inset-4 -z-10 gradient-ring" />
            {/* Lienzo cósmico interactivo (Canvas API, no HTML grid) */}
            <div className="flex items-center justify-center">
              <PixelCanvas width={300} height={200} explodeSignal={explodeTick} />
            </div>
            <div className="mt-3 flex justify-center">
              <button
                className="px-3 py-1 text-[10px] md:text-xs uppercase tracking-widest rounded-md border border-purple-500/40 ring-1 ring-purple-300/20 bg-neutral-900/80 hover:bg-neutral-800 text-white shadow-sm"
                onClick={() => setExplodeTick((x) => x + 1)}
              >
                EXPLOTAR
              </button>
            </div>
            <h3 className="mt-6 text-white text-xl font-bold">ARSENAL DE CONQUISTA</h3>
            <p className="mt-3 text-gray-300 leading-relaxed text-sm">
              ¿Píxeles normales? ¡No me jodas! Despliega Píxeles Bomba para reventar sus defensas. Usa Caballos de Troya para infiltrarte. Esto no es arte, es dominio.
            </p>
          </div>

          {/* Columna 3: Estrategia (Mockup 2 sin destrucción) */}
          <div ref={col3Ref} className="relative lux-card hover-tilt float-soft p-6">
            <div className="absolute -inset-4 -z-10 gradient-ring" />
            {/* Lienzo cósmico pintable por celdas (mockup 2 sin destrucción) */}
            <div className="flex items-center justify-center">
              <PixelCanvas width={300} height={200} paintable />
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