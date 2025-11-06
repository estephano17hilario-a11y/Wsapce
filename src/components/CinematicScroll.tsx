'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

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

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Cachear imágenes de escenas para evitar querySelector en cada tick
      const img1 = scene1Ref.current?.querySelector('img') as HTMLElement | null
      const img2 = scene2Ref.current?.querySelector('img') as HTMLElement | null
      const img3 = scene3Ref.current?.querySelector('img') as HTMLElement | null
      const img4 = scene4Ref.current?.querySelector('img') as HTMLElement | null
      const img5 = scene5Ref.current?.querySelector('img') as HTMLElement | null

      const setY1 = img1 ? gsap.quickSetter(img1, 'y', 'px') : null
      const setY2 = img2 ? gsap.quickSetter(img2, 'y', 'px') : null
      const setY3 = img3 ? gsap.quickSetter(img3, 'y', 'px') : null
      const setY4 = img4 ? gsap.quickSetter(img4, 'y', 'px') : null
      const setY5 = img5 ? gsap.quickSetter(img5, 'y', 'px') : null
      // Configurar estado inicial de todas las escenas
      gsap.set([scene2Ref.current, scene3Ref.current, scene4Ref.current, scene5Ref.current, scene6Ref.current], { opacity: 0 });
      gsap.set([text1Ref.current, text2Ref.current, text3Ref.current, text4Ref.current, text5Ref.current], { opacity: 0, y: 50 });

      // Crear línea de tiempo maestra
      const tl = gsap.timeline();

      // ESCENA 1: Inicio Personal (0% - 16.6%)
      tl.fromTo(text1Ref.current, 
        { opacity: 0, y: 50, scale: 0.8 }, 
        { opacity: 1, y: 0, scale: 1, duration: 2, ease: "power2.out" }
      )
      .to(text1Ref.current, 
        { opacity: 0, y: -50, scale: 1.1, duration: 1.5, ease: "power2.in" }, 
        "+=2"
      )
      .to(scene1Ref.current, 
        { opacity: 0, scale: 1.1, duration: 1.5, ease: "power2.in" }, 
        "-=1"
      )

      // ESCENA 2: Caos del Mundo (16.6% - 33.3%)
      .fromTo(scene2Ref.current, 
        { opacity: 0, rotationZ: -5 }, 
        { opacity: 1, rotationZ: 0, duration: 1.5, ease: "power2.out" }
      )
      .fromTo(text2Ref.current, 
        { opacity: 0, y: 50, rotationX: 45 }, 
        { opacity: 1, y: 0, rotationX: 0, duration: 2, ease: "back.out(1.7)" }, 
        "-=1"
      )
      .to(text2Ref.current, 
        { opacity: 0, y: -50, rotationX: -45, duration: 1.5, ease: "power2.in" }, 
        "+=1.5"
      )
      .to(scene2Ref.current, 
        { opacity: 0, rotationZ: 5, scale: 0.9, duration: 1.5, ease: "power2.in" }, 
        "-=1"
      )

      // ESCENA 3: Despegue de la Tierra (33.3% - 50%)
      .fromTo(scene3Ref.current, 
        { opacity: 0, scale: 1.3, y: 100 }, 
        { opacity: 1, scale: 1, y: 0, duration: 2, ease: "power3.out" }
      )
      .fromTo(text3Ref.current, 
        { opacity: 0, y: 100, scale: 0.5 }, 
        { opacity: 1, y: 0, scale: 1, duration: 2, ease: "elastic.out(1, 0.5)" }, 
        "-=1.5"
      )
      .to(text3Ref.current, 
        { opacity: 0, y: -100, scale: 1.5, duration: 1.5, ease: "power2.in" }, 
        "+=1.5"
      )
      .to(scene3Ref.current, 
        { opacity: 0, scale: 0.7, y: -100, duration: 2, ease: "power3.in" }, 
        "-=1"
      )

      // ESCENA 4: Viaje Cósmico (50% - 66.6%)
      .fromTo(scene4Ref.current, 
        { opacity: 0, rotationZ: -15, scale: 0.8 }, 
        { opacity: 1, rotationZ: 0, scale: 1, duration: 2.5, ease: "power2.out" }
      )
      .fromTo(text4Ref.current, 
        { opacity: 0, y: 50, x: -100, rotationY: 90 }, 
        { opacity: 1, y: 0, x: 0, rotationY: 0, duration: 2.5, ease: "power3.out" }, 
        "-=2"
      )
      .to(text4Ref.current, 
        { opacity: 0, y: -50, x: 100, rotationY: -90, duration: 1.5, ease: "power2.in" }, 
        "+=1.5"
      )
      .to(scene4Ref.current, 
        { opacity: 0, rotationZ: 15, scale: 1.2, duration: 2, ease: "power2.in" }, 
        "-=1"
      )

      // ESCENA 5: Destino Final (66.6% - 83.3%)
      .fromTo(scene5Ref.current, 
        { opacity: 0, scale: 0.3, rotationZ: 180 }, 
        { opacity: 1, scale: 1, rotationZ: 0, duration: 3, ease: "power4.out" }
      )
      .fromTo(text5Ref.current, 
        { opacity: 0, y: 50, scale: 0.3, rotationZ: -180 }, 
        { opacity: 1, y: 0, scale: 1, rotationZ: 0, duration: 2.5, ease: "back.out(2)" }, 
        "-=2.5"
      )
      .to(text5Ref.current, 
        { opacity: 0, y: -50, scale: 0.8, duration: 2, ease: "power2.in" }, 
        "+=2"
      )
      .to(scene5Ref.current, 
        { opacity: 0, scale: 1.1, duration: 2, ease: "power2.in" }, 
        "-=1.5"
      )

      // ESCENA 6: CTA (83.3% - 100%)
      .fromTo(scene6Ref.current, 
        { opacity: 0, y: 200, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 2.2, ease: "power3.out" }
      )
      .fromTo('.cta-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, "-=1")
      .fromTo('.cta-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, "-=0.6")
      .fromTo('.cta-button', { opacity: 0, y: 20, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.4)' }, "-=0.4");

      // Configurar ScrollTrigger con mejor control
      ScrollTrigger.create({
        trigger: mainContainerRef.current,
        start: "top top",
        end: "+=12000", // Duración más larga para mejor control
        scrub: 1.2, // Scrub más suave
        pin: true,
        animation: tl,
        anticipatePin: 1,
        refreshPriority: -1,
        onUpdate: (self) => {
          // Efectos adicionales basados en el progreso
          const progress = self.progress
          // Paralaje sutil usando quickSetter (más eficiente que gsap.set por tick)
          setY1 && setY1(progress * -50)
          setY2 && setY2(progress * -30)
          setY3 && setY3(progress * -70)
          setY4 && setY4(progress * -40)
          setY5 && setY5(progress * -60)
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
    <section ref={mainContainerRef} className="relative w-screen h-screen overflow-hidden">
      {/* Contenedor fijo para todas las escenas */}
      <div className="fixed top-0 left-0 w-screen h-screen">
        
        {/* ESCENA 1: Inicio Personal */}
        <div ref={scene1Ref} className="absolute inset-0 w-full h-full">
          <Image
            src="/persona sun up - copia.webp"
            alt="Inicio Personal"
            fill
            className="object-cover scene-image"
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
        <div ref={scene2Ref} className="absolute inset-0 w-full h-full opacity-0">
          <Image
            src="/perxonas up - copia.webp"
            alt="Caos del Mundo"
            fill
            className="object-cover scene-image"
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
        <div ref={scene3Ref} className="absolute inset-0 w-full h-full opacity-0">
          <Image
            src="/tierra para implementar - copia - copia.webp"
            alt="Despegue de la Tierra"
            fill
            className="object-cover scene-image"
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
        <div ref={scene4Ref} className="absolute inset-0 w-full h-full opacity-0">
          <Image
            src="/espacio azul up - copia.webp"
            alt="Viaje Cósmico"
            fill
            className="object-cover scene-image"
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
        <div ref={scene5Ref} className="absolute inset-0 w-full h-full opacity-0">
          <Image
            src="/andromeda up - copia.webp"
            alt="Destino Final - Andrómeda"
            fill
            className="object-cover scene-image"
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
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] cta-radial"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 cta-aurora"></div>
            </div>

            <div className="relative text-center max-w-3xl">
              <h1 className="cta-title text-6xl md:text-8xl font-extrabold tracking-tight cinematic-text">
                Wspace
              </h1>
              <p className="cta-subtitle mt-6 text-xl md:text-2xl text-gray-300">
                Donde tu viaje se vuelve épico.
              </p>
              <Button className="cta-button mt-10 px-8 py-6 text-lg rounded-full bg-cyan-500 hover:bg-cyan-400 text-black glow-cyan">
                Empezamos
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}