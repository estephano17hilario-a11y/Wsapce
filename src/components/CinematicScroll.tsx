'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ctaTitle, ctaSubtitle, ctaFadeOut } from '@/lib/animations';
import { trackEvent } from '@/lib/analytics';

// Registrar plugins de GSAP
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CinematicScroll() {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const scene1Ref = useRef<HTMLDivElement>(null);
  const scene2Ref = useRef<HTMLDivElement>(null);
  const scene3Ref = useRef<HTMLDivElement>(null);
  const scene4Ref = useRef<HTMLDivElement>(null);
  const scene5Ref = useRef<HTMLDivElement>(null);
  const scene6Ref = useRef<HTMLDivElement>(null);

  // Referencias para textos
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);
  const text4Ref = useRef<HTMLDivElement>(null);
  const text5Ref = useRef<HTMLDivElement>(null);
  const completionReportedRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Cachear imágenes de escenas para evitar querySelector en cada tick
      const img1 = scene1Ref.current?.querySelector('img') as HTMLElement | null
      const img2 = scene2Ref.current?.querySelector('img') as HTMLElement | null
      const img3 = scene3Ref.current?.querySelector('img') as HTMLElement | null
      const img4 = scene4Ref.current?.querySelector('img') as HTMLElement | null
      const img5 = scene5Ref.current?.querySelector('img') as HTMLElement | null
      // Títulos y subtítulos para escenas (CTA-style)
      const title1 = text1Ref.current?.querySelector('h1') as HTMLElement | null
      const subtitle1 = text1Ref.current?.querySelector('p') as HTMLElement | null
      const title2 = text2Ref.current?.querySelector('h1') as HTMLElement | null
      const subtitle2 = text2Ref.current?.querySelector('p') as HTMLElement | null
      const title3 = text3Ref.current?.querySelector('h1') as HTMLElement | null
      const subtitle3 = text3Ref.current?.querySelector('p') as HTMLElement | null
      const title4 = text4Ref.current?.querySelector('h1') as HTMLElement | null
      const subtitle4 = text4Ref.current?.querySelector('p') as HTMLElement | null
      const title5 = text5Ref.current?.querySelector('h1') as HTMLElement | null
      const subtitle5 = text5Ref.current?.querySelector('p') as HTMLElement | null
      // Configurar estado inicial de todas las escenas
      gsap.set([scene2Ref.current, scene3Ref.current, scene4Ref.current, scene5Ref.current, scene6Ref.current], { opacity: 0 });
      gsap.set([text1Ref.current, text2Ref.current, text3Ref.current, text4Ref.current, text5Ref.current], { opacity: 0, y: 50 });

      // Crear línea de tiempo maestra con suavizado interno
      const tl = gsap.timeline({ smoothChildTiming: true });

      // ESCENA 1: Inicio Personal (0% - 16.6%)
      tl.call(() => trackEvent('scene_enter', { id: 1 }))
      // Imagen: fade in + zoom-out con el scroll
      .fromTo(img1,
        { opacity: 1, scale: 4.0, yPercent: 6, transformOrigin: '50% 80%' },
        { opacity: 1, scale: 1, yPercent: 0, duration: 2.2, ease: 'none' }
      )
      // Texto (Escena 1): efecto CTA para título y subtítulo
      .fromTo(text1Ref.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, "-=0.8")
      .add(ctaTitle(title1), "-=0.8")
      .add(ctaSubtitle(subtitle1), "-=0.7")
      .add(ctaFadeOut(title1, subtitle1), "+=1.2")
      // Imagen: fade out al salir de la escena
      .to(img1, { opacity: 0, duration: 0.8, ease: 'power2.in' }, "-=0.6")
      // Contenedor: solo fade out
      .to(scene1Ref.current, { opacity: 0, duration: 0.8, ease: 'power2.in' }, "-=0.4")
      .call(() => trackEvent('scene_exit', { id: 1 }))

      // ESCENA 2: Caos del Mundo (16.6% - 33.3%)
      .call(() => trackEvent('scene_enter', { id: 2 }))
      // Contenedor: solo fade in
      .fromTo(scene2Ref.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      )
      // Imagen: fade in + zoom-out (más agresivo)
      .fromTo(img2,
        { opacity: 0, scale: 1.45, transformOrigin: 'center center' },
        { opacity: 1, scale: 1, duration: 2, ease: 'none' },
        "-=0.4"
      )
      // Texto (Escena 2): efecto CTA para título y subtítulo
      .fromTo(text2Ref.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, "-=0.8")
      .add(ctaTitle(title2), "-=0.8")
      .add(ctaSubtitle(subtitle2), "-=0.7")
      .add(ctaFadeOut(title2, subtitle2), "+=1.2")
      // Imagen: fade out y contenedor: solo fade out
      .to(img2, { opacity: 0, duration: 0.8, ease: 'power2.in' }, "-=0.6")
      .to(scene2Ref.current, { opacity: 0, duration: 0.8, ease: 'power2.in' }, "-=0.4")
      .call(() => trackEvent('scene_exit', { id: 2 }))

      // ESCENA 3: Despegue de la Tierra (33.3% - 50%)
      .call(() => trackEvent('scene_enter', { id: 3 }))
      // Contenedor: solo fade in
      .fromTo(scene3Ref.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      )
      // Imagen: fade in + zoom-out (más agresivo)
      .fromTo(img3,
        { opacity: 0, scale: 1.45, transformOrigin: 'center center' },
        { opacity: 1, scale: 0.12, duration: 2.6, ease: 'none' },
        "-=0.4"
      )
      // Texto (Escena 3): efecto CTA para título y subtítulo
      .fromTo(text3Ref.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, "-=0.8")
      .add(ctaTitle(title3), "-=0.8")
      .add(ctaSubtitle(subtitle3), "-=0.7")
      .add(ctaFadeOut(title3, subtitle3), "+=1.2")
      // Pausa breve antes de salida de Tierra (se detiene un poco)
      .to({}, { duration: 0.3 })
      // Tierra se va un poco antes (sin solape con Espacio)
      .to(img3, { opacity: 0, duration: 0.7, ease: 'power2.in' })
      .to(scene3Ref.current, { opacity: 0, duration: 0.7, ease: 'power2.in' })
      .call(() => trackEvent('scene_exit', { id: 3 }))

      // ESCENA 4: Viaje Cósmico (50% - 66.6%)
      .call(() => trackEvent('scene_enter', { id: 4 }))
      // Contenedor: fade in solapado, antes de que termine de irse Tierra
      .fromTo(scene4Ref.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=1.6" // entra mucho antes, incluso con Tierra visible
      )
      // Imagen del Espacio: fade-in 2x y zoom-in muy agresivo ligado al scroll
      .fromTo(img4, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power2.out' }, "-=1.5")
      .fromTo(img4,
        { scale: 4.2, transformOrigin: 'center center' },
        { scale: 1.0, duration: 2.8, ease: 'none' },
        "-=1.5"
      )
      // Asegurar visibilidad del contenedor de texto (evita que desaparezca)
      .fromTo(text4Ref.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' },
        "-=1.4"
      )
      // Texto: igual al CTA (Wspace) para título y subtítulo (centralizado)
      .add(ctaTitle(title4), "-=1.2")
      .add(ctaSubtitle(subtitle4), "-=1.0")
      .add(ctaFadeOut(title4, subtitle4), "+=1.2")
      // Imagen: salida con más zoom-out + fade out
      .to(img4, { scale: 0.9, duration: 1.4, ease: 'none' })
      .to(img4, { opacity: 0, duration: 0.8, ease: 'power2.in' }, "-=0.6")
      .to(scene4Ref.current, { opacity: 0, duration: 0.8, ease: 'power2.in' }, "-=0.4")
      .call(() => trackEvent('scene_exit', { id: 4 }))

      // ESCENA 5: Destino Final (66.6% - 83.3%)
      .call(() => trackEvent('scene_enter', { id: 5 }))
      // Contenedor: solo fade in
      .fromTo(scene5Ref.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      )
      // Imagen: fade in + zoom-out (más agresivo)
      .fromTo(img5,
        { opacity: 0, scale: 1.45, transformOrigin: 'center center' },
        { opacity: 1, scale: 1, duration: 2, ease: 'none' },
        "-=0.4"
      )
      // Texto (Escena 5): efecto CTA para título y subtítulo
      .fromTo(text5Ref.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, "-=0.8")
      .add(ctaTitle(title5), "-=0.8")
      .add(ctaSubtitle(subtitle5), "-=0.7")
      .add(ctaFadeOut(title5, subtitle5), "+=1.2")
      // Imagen: fade out y contenedor: solo fade out
      .to(img5, { opacity: 0, duration: 0.8, ease: 'power2.in' }, "-=0.6")
      .to(scene5Ref.current, { opacity: 0, duration: 0.8, ease: 'power2.in' }, "-=0.4")
      .call(() => trackEvent('scene_exit', { id: 5 }))
      .call(() => { try { window.dispatchEvent(new CustomEvent('after_andromeda')) } catch {} })

      // ESCENA 6: CTA (83.3% - 100%)
      .call(() => trackEvent('scene_enter', { id: 6 }))
      .fromTo(scene6Ref.current, 
        { opacity: 0, y: 200, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 2.8, ease: "power3.out" }
      )
      // Entrada espectacular del texto y botón del CTA
      .fromTo(
        '.cta-title',
        { opacity: 0, filter: 'blur(14px)', letterSpacing: '0.15em', scale: 1.2, y: 40, transformOrigin: 'center center' },
        { opacity: 1, filter: 'blur(0px)', letterSpacing: '0em', scale: 1, y: 0, duration: 1.8, ease: 'expo.out' },
        "-=1.2"
      )
      .fromTo(
        '.cta-subtitle',
        { opacity: 0, filter: 'blur(10px)', y: 30 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.4, ease: 'power3.out' },
        "-=1.0"
      )
      .fromTo(
        '.cta-button',
        { opacity: 0, scale: 0.9, y: 24, filter: 'brightness(0.8) blur(6px)' },
        { opacity: 1, scale: 1, y: 0, filter: 'brightness(1) blur(0px)', duration: 1.3, ease: 'back.out(1.7)' },
        "-=0.8"
      )
      // Mantener la sección Wspace visible por más tiempo sin cambiar visualmente
      .to({}, { duration: 2.5 })
      // Salida: solo fade out para las letras/botón
      .to(['.cta-title', '.cta-subtitle', '.cta-button'], { opacity: 0, duration: 1, ease: 'power2.in' })
      .call(() => trackEvent('scene_exit', { id: 6 }));

      // Configurar ScrollTrigger con mejor control
      ScrollTrigger.create({
        trigger: mainContainerRef.current,
        start: "top top",
        end: "+=13500",
        scrub: 0.8, // Progreso más directo, menos amortiguación
        pin: true,
        animation: tl,
        anticipatePin: 1,
        refreshPriority: -1,
        onUpdate: (self) => {
          // Mantener las imágenes centradas; sin paralaje vertical
          if (!completionReportedRef.current && self.progress >= 0.99) {
            trackEvent('scroll_completion', { progress: self.progress })
            completionReportedRef.current = true
          }
        }
      });

      // Animación ligera de glow para el CTA (respeta prefers-reduced-motion)
      const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!reduceMotion) {
        gsap.to('.cta-button', { boxShadow: '0 0 30px rgba(34, 211, 238, 0.6)', repeat: -1, yoyo: true, duration: 2.5, ease: 'sine.inOut' })
      }

    }, mainContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={mainContainerRef} className="relative w-full h-screen overflow-hidden">
      {/* Contenedor fijo para todas las escenas */}
      <div className="fixed inset-0">
        
        {/* ESCENA 1: Inicio Personal */}
        <div ref={scene1Ref} className="absolute inset-0 w-full h-full bg-black">
          <Image
            src="/persona sun up - copia.webp"
            alt="Inicio Personal"
            fill
            className="object-cover object-center scene-image"
            priority
            sizes="100vw"
            quality={80}
          />
          <div ref={text1Ref} className="absolute inset-0 flex items-center justify-center opacity-0">
            <div className="text-center text-white">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent cinematic-text">
                Tu Viaje Comienza
              </h1>
              <p className="text-xl opacity-80">
                Desde lo personal hacia lo infinito
              </p>
            </div>
          </div>
        </div>

        {/* ESCENA 2: Caos del Mundo */}
        <div ref={scene2Ref} className="absolute inset-0 w-full h-full opacity-0 bg-black">
          <Image
            src="/perxonas up - copia.webp"
            alt="Caos del Mundo"
            fill
            className="object-cover object-center scene-image"
            loading="lazy"
            sizes="100vw"
            quality={80}
          />
          <div ref={text2Ref} className="absolute inset-0 flex items-center justify-center opacity-0">
            <div className="text-center text-white">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent cinematic-text">
                El Caos Nos Rodea
              </h1>
              <p className="text-xl opacity-80">
                Pero hay una salida...
              </p>
            </div>
          </div>
        </div>

        {/* ESCENA 3: Despegue de la Tierra */}
        <div ref={scene3Ref} className="absolute inset-0 w-full h-full opacity-0 bg-black">
          <Image
            src="/tierra para implementar - copia - copia.webp"
            alt="Despegue de la Tierra"
            fill
            className="object-contain object-center scene-image"
            loading="lazy"
            sizes="100vw"
            quality={80}
          />
          <div ref={text3Ref} className="absolute inset-0 flex items-center justify-center opacity-0">
            <div className="text-center text-white">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent cinematic-text">
                Elevándose
              </h1>
              <p className="text-xl opacity-80">
                Dejando atrás lo conocido
              </p>
            </div>
          </div>
        </div>

        {/* ESCENA 4: Viaje Cósmico */}
        <div ref={scene4Ref} className="absolute inset-0 w-full h-full opacity-0 bg-black">
          <Image
            src="/espacio azul up - copia.webp"
            alt="Viaje Cósmico"
            fill
            className="object-cover object-center scene-image"
            loading="lazy"
            sizes="100vw"
            quality={80}
          />
          <div ref={text4Ref} className="absolute inset-0 flex items-center justify-center opacity-0">
            <div className="text-center text-white">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent cinematic-text">
                Atravesando el Cosmos
              </h1>
              <p className="text-xl opacity-80">
                Hacia nuevas dimensiones
              </p>
            </div>
          </div>
        </div>

        {/* ESCENA 5: Destino Final */}
        <div ref={scene5Ref} className="absolute inset-0 w-full h-full opacity-0 bg-black">
          <Image
            src="/andromeda up - copia.webp"
            alt="Destino Final - Andrómeda"
            fill
            className="object-cover object-center scene-image"
            loading="lazy"
            sizes="100vw"
            quality={80}
          />
          <div ref={text5Ref} className="absolute inset-0 flex items-center justify-center opacity-0">
            <div className="text-center text-white">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent cinematic-text">
                Andrómeda
              </h1>
              <p className="text-xl opacity-80">
                El destino final te espera
              </p>
            </div>
          </div>
        </div>

        {/* ESCENA 6: CTA final Wspace */}
        <div ref={scene6Ref} className="absolute inset-0 w-full h-full bg-gradient-to-b from-slate-950 via-black to-black opacity-0">
          <div className="relative h-full flex items-center justify-center p-8">
            {/* Fondo cósmico ligero */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Usamos vmin para evitar desplazamientos por incluir barra de scroll en vw */}
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[80vmin] h-[80vmin] cta-radial"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 cta-aurora"></div>
            </div>

            <div className="relative text-center max-w-3xl">
              <h1 className="cta-title text-6xl md:text-8xl font-extrabold tracking-tight cinematic-text">
                Wspace
              </h1>
              <p className="cta-subtitle mt-6 text-xl md:text-2xl text-gray-300">
                Donde tu viaje se vuelve épico.
              </p>
            <Button className="cta-button mt-10 px-8 py-6 text-lg rounded-full glow-cyan">
              Empezamos
            </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}