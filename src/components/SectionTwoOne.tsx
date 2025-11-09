'use client';

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PixelCanvas from '@/components/PixelCanvas'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function SectionTwoOne() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'bottom 20%',
      },
    })

    tl.from(titleRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.9,
      ease: 'power2.out',
    })
      .from(leftRef.current, {
        opacity: 0,
        y: 40,
        scale: 0.98,
        duration: 0.9,
        ease: 'power2.out',
      }, '-=0.4')
      .from(rightRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.3')

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return (
    <section id="wspace-start" ref={sectionRef} className="relative z-40 w-full bg-transparent py-28 px-6">
      {/* Decoración premium sutil (debajo del contenido) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] cta-radial" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 cta-aurora" />
        <div className="absolute inset-0 premium-noise" />
      </div>

      <div className="relative z-40 max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-center text-3xl md:text-5xl font-extrabold cinematic-text shine-text mb-6">
          WSPACE.LIVE: TU IMPERIO, TU LIENZO CÓSMICO
        </h2>
        <div className="title-underline mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          {/* Columna Izquierda: Visual (Lienzo) */}
          <div ref={leftRef} className="flex justify-center">
            <div className="relative lux-card hover-tilt float-soft">
              {/* Ring de gradiente premium */}
              <div className="absolute -inset-4 -z-10 gradient-ring" />
              {/* Canvas cósmico interactivo */}
              <PixelCanvas width={420} height={300} />
            </div>
          </div>

          {/* Columna Derecha: Texto (Filosofía) */}
          <div ref={rightRef} className="text-gray-300 leading-relaxed space-y-6">
            <p>
              En el vasto universo digital, Wspace.live es el lienzo cósmico donde tu legado comienza. Aquí, cada pixel es una declaración, cada color una ambición.
            </p>
            <p>
              Deja de pintar sobre los límites de otros. En Wspace.live, los límites los pones TÚ. Un pixel puede ser el inicio de tu historia, el fundamento de tu imperio. Construye, lucha, domina.
            </p>
            <p className="font-semibold text-white">
              No es solo un juego. Es una guerra por la creatividad. Tu historia. Tu imperio.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}