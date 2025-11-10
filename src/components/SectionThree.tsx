'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PixelCanvas from '@/components/PixelCanvas'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type ChatMsg = { actor?: string; text: string; system?: boolean; you?: boolean; server?: boolean }

export default function SectionThree() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const col1Ref = useRef<HTMLDivElement>(null)
  const col2Ref = useRef<HTMLDivElement>(null)
  const col3Ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)
  const chatBodyRef = useRef<HTMLDivElement>(null)
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([])
  const [explodeTick, setExplodeTick] = useState(0)
  const [flagSpawnTick, setFlagSpawnTick] = useState(0)
  const [explosionFxPlayed, setExplosionFxPlayed] = useState(false)
  const [explosionFxActive, setExplosionFxActive] = useState(false)
  const [flagFxPlayed, setFlagFxPlayed] = useState(false)
  const [flagFxActive, setFlagFxActive] = useState(false)
  const [webExplosionFxPlayed, setWebExplosionFxPlayed] = useState(false)
  const [webExplosionFxActive, setWebExplosionFxActive] = useState(false)
  const [webCaptureFxPlayed, setWebCaptureFxPlayed] = useState(false)
  const [webCaptureFxActive, setWebCaptureFxActive] = useState(false)
  const [explodeChatPlayedOnce, setExplodeChatPlayedOnce] = useState(false)
  const [flagChatOnce, setFlagChatOnce] = useState(false)

  const handleSend = () => {
    const text = inputRef.current?.innerText || ''
    const clean = text.trim()
    if (!clean) return
    setChatMessages((prev) => [...prev, { actor: '[lider]:', text: clean, you: true }])
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

  // Auto-scroll del chat hacia abajo cuando llegan nuevos mensajes (instantáneo para rendimiento)
  useEffect(() => {
    const body = chatBodyRef.current
    if (!body) return
    body.scrollTop = body.scrollHeight
  }, [chatMessages])

  return (
    <section id="wspace-start" ref={sectionRef} className="relative z-40 w-full bg-transparent py-28 px-6">
      {/* Fondo cósmico y textura premium (debajo del contenido) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* vmin para que el radial grande quede perfectamente centrado sin depender de vw */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[70vmin] h-[70vmin] cta-radial" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 cta-aurora" />
        <div className="absolute inset-0 premium-noise" />
      </div>

      <div className="relative z-40 max-w-7xl mx-auto">
        <h2
          ref={titleRef}
          className="text-center text-3xl md:text-6xl font-black tracking-tight cinematic-text shine-text mb-4"
        >
          DE PÍXELES... A PUTOS IMPERIOS.
        </h2>
        <p
          ref={subtitleRef}
          className="text-center text-lg md:text-xl text-gray-300 italic mb-16"
        >
          COMUNICA, DESTRUYE Y CREA. Bienvenido a la puta guerra.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:gap-16 items-start">
          {/* Columna 1: Comunicación */}
          <div ref={col1Ref} className="relative lux-card hover-tilt p-6">
            <div className="absolute -inset-4 -z-10 gradient-ring" />
            <div className="flex items-center justify-center">
              <div className="war-chat w-[420px] h-[280px] rounded-lg border border-cyan-900/40 ring-1 ring-cyan-300/10 shadow-xl overflow-hidden bg-black/70">
              <div className="war-chat-header">
                <span className="war-chat-channel">Canal: #CLAN_ALFA</span>
                <span className="war-chat-status">(3/50 EN LÍNEA)</span>
              </div>
              <div ref={chatBodyRef} className="war-chat-body">
                <div className="war-chat-msg"><span className="war-chat-actor">[Soldado_X]:</span><span className="war-chat-text">Aquí en <span className="war-chat-coords">12932,2353</span></span><span className="war-chat-goto">IR A UBICACIÓN</span></div>
                <div className="war-chat-msg"><span className="war-chat-actor you">[TÚ_Comandante]:</span><span className="war-chat-text">¡Entendido! ¡Enviando Píxel Bomba!</span></div>
                {chatMessages.map((m, i) => (
                  <div key={`chat-${i}`} className={`war-chat-msg ${m.system ? 'system' : ''}`}>
                    {m.actor && (
                      <span className={`war-chat-actor${m.you ? ' you' : ''}${m.server ? ' server' : ''}`}>{m.actor}</span>
                    )}
                    <span className="war-chat-text">{m.text}</span>
                  </div>
                ))}
              </div>
              <div className="war-chat-input">
                <div
                  ref={inputRef}
                  className="war-chat-inputbar"
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  inputMode="text"
                  autoCapitalize="none"
                  data-placeholder="Escribe tu táctica aquí..."
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
                  onInput={() => {
                    const el = inputRef.current
                    if (!el) return
                    // Mantener caret visible al final cuando el texto se hace largo
                    el.scrollLeft = el.scrollWidth
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
            </div>
            <h3 className="mt-6 text-white text-2xl md:text-3xl font-extrabold">CHAT DE GUERRA TÁCTICO</h3>
            <p className="mt-3 text-gray-300 leading-relaxed text-base md:text-lg">
              Coordina ataques en tiempo real. Forma clanes. Identifica aliados. Aquí no estás solo, estás en un puto ejército.
            </p>
          </div>

          {/* Columna 2: Armamento */}
          <div ref={col2Ref} className="relative lux-card hover-tilt float-soft p-6">
            <div className="absolute -inset-4 -z-10 gradient-ring" />
            {/* Lienzo cósmico interactivo (Canvas API, no HTML grid) */}
            <div className="flex items-center justify-center">
              <PixelCanvas width={360} height={240} explodeSignal={explodeTick} />
            </div>
            <div className="mt-4 flex justify-center">
              {/* Overlay global rojo (sin límites), solo primer clic */}
              {webExplosionFxActive && createPortal(<div aria-hidden className="web-burst web-burst--red" />, document.body)}
              <button
                className={`btn-glow-once ${explosionFxActive ? 'btn-glow-once-active' : ''} px-4 py-2 text-xs md:text-sm uppercase tracking-widest rounded-md border border-purple-500/40 ring-1 ring-purple-300/20 bg-neutral-900/80 hover:bg-neutral-800 text-white shadow-sm`}
                onClick={() => {
                  setExplodeTick((x) => x + 1)
                  // Programar mensajes del Coronel 2s antes de terminar la explosión.
                  // La explosión dura ~1500ms; 2s antes => aparece inmediatamente.
                  if (!explodeChatPlayedOnce) {
                    setExplodeChatPlayedOnce(true)
                    const explosionDurationMs = 1500
                    const delayMs = Math.max(0, explosionDurationMs - 2000)
                    setTimeout(() => {
                      setChatMessages((prev) => [...prev, { actor: '[Coronel]:', text: 'joder, que buena' }])
                      setTimeout(() => {
                        setChatMessages((prev) => [...prev, { actor: '[Coronel]:', text: 'ahora tenemos que capturar la zona' }])
                      }, 600)
                    }, delayMs)
                  }
                  if (!explosionFxPlayed) {
                    setExplosionFxPlayed(true)
                    setExplosionFxActive(true)
                    setTimeout(() => setExplosionFxActive(false), 1000)
                  }
                  if (!webExplosionFxPlayed) {
                    setWebExplosionFxPlayed(true)
                    setWebExplosionFxActive(true)
                    setTimeout(() => setWebExplosionFxActive(false), 1000)
                  }
                }}
              >
                EXPLOTAR
                {explosionFxActive && <span aria-hidden className="once-burst once-burst--purple" />}
              </button>
            </div>
            <h3 className="mt-6 text-white text-2xl md:text-3xl font-extrabold">ARSENAL DE CONQUISTA</h3>
            <p className="mt-3 text-gray-300 leading-relaxed text-base md:text-lg">
              ¿Píxeles normales? ¡No me jodas! Despliega Píxeles Bomba para reventar sus defensas. Usa Caballos de Troya para infiltrarte. Esto no es arte, es dominio.
            </p>
          </div>

          {/* Columna 3: Estrategia (Mockup 2 sin destrucción) */}
          <div ref={col3Ref} className="relative lux-card hover-tilt float-soft p-6">
            <div className="absolute -inset-4 -z-10 gradient-ring" />
            {/* Lienzo cósmico pintable por celdas (mockup 2 sin destrucción) */}
            <div className="flex items-center justify-center">
              <PixelCanvas width={360} height={240} paintable showShip={false} spawnFlagSignal={flagSpawnTick} />
            </div>
            <div className="mt-4 flex justify-center">
              <button
                className={`btn-glow-once btn-glow-once--subtle ${flagFxActive ? 'btn-glow-once--subtle-active' : ''} px-4 py-2 text-xs md:text-sm uppercase tracking-widest rounded-md border border-cyan-500/30 ring-1 ring-cyan-300/10 bg-neutral-900/80 hover:bg-neutral-800 text-white shadow-sm`}
                onClick={() => {
                  setFlagSpawnTick((x) => x + 1)
                  if (!flagFxPlayed) {
                    setFlagFxPlayed(true)
                    setFlagFxActive(true)
                    setTimeout(() => setFlagFxActive(false), 1000)
                  }
                  if (!webCaptureFxPlayed) {
                    setWebCaptureFxPlayed(true)
                    setWebCaptureFxActive(true)
                    setTimeout(() => setWebCaptureFxActive(false), 1100)
                  }
                  // Mensajes tras PONER LA BANDERA
                  if (!flagChatOnce) {
                    setFlagChatOnce(true)
                    // 2 segundos después del clic
                    setTimeout(() => {
                      setChatMessages((prev) => [...prev, { actor: '[Jugador_Y]:', text: 'Vamosss, asi se hace' }])
                      setTimeout(() => {
                        setChatMessages((prev) => [...prev, { actor: '[Jugador_A]:', text: 'w' }])
                      }, 200)
                      setTimeout(() => {
                        setChatMessages((prev) => [...prev, { actor: '[Jugador_B]:', text: 'w' }])
                      }, 400)
                    }, 2000)
                    // 3 segundos después del clic: anuncio del servidor (remitente en gris)
                    setTimeout(() => {
                      setChatMessages((prev) => [...prev, { actor: '[wspace_servidor]:', text: 'vuestro clan ha pasado del top 40 al top 12 del ranking global', server: true }])
                    }, 3000)
                  }
                }}
              >
                PONER LA BANDERA
                {flagFxActive && <span aria-hidden className="once-ripple-subtle once-ripple-subtle--blue" />}
              </button>
              {/* Overlay global azul (logro captura) se mantiene */}
              {webCaptureFxActive && createPortal(<div aria-hidden className="web-burst web-burst--blue" />, document.body)}
            </div>
            <h3 className="mt-6 text-white text-2xl md:text-3xl font-extrabold">GUERRA DE GUERRILLAS 24/7</h3>
            <p className="mt-3 text-gray-300 leading-relaxed text-base md:text-lg">
              Forma bandos de guerrilla. Libra una guerra constante. En Wspace, el imperio nunca duerme. ¿Crees que puedes descansar?
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}