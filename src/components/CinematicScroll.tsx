'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

      // ESCENA 6: La Oferta (83.3% - 100%)
      .fromTo(scene6Ref.current, 
        { opacity: 0, y: 200, scale: 0.8 }, 
        { opacity: 1, y: 0, scale: 1, duration: 3, ease: "power3.out" }
      );

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
          const progress = self.progress;
          
          // Efecto de paralaje sutil en las imágenes
          if (scene1Ref.current) {
            gsap.set(scene1Ref.current.querySelector('img'), { y: progress * -50 });
          }
          if (scene2Ref.current) {
            gsap.set(scene2Ref.current.querySelector('img'), { y: progress * -30 });
          }
          if (scene3Ref.current) {
            gsap.set(scene3Ref.current.querySelector('img'), { y: progress * -70 });
          }
          if (scene4Ref.current) {
            gsap.set(scene4Ref.current.querySelector('img'), { y: progress * -40 });
          }
          if (scene5Ref.current) {
            gsap.set(scene5Ref.current.querySelector('img'), { y: progress * -60 });
          }
        }
      });

      // Animaciones adicionales para elementos individuales
      gsap.fromTo(".pricing-card", 
        { y: 100, opacity: 0, rotationY: 45 },
        { 
          y: 0, 
          opacity: 1, 
          rotationY: 0,
          duration: 1.5,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: scene6Ref.current,
            start: "top center",
            toggleActions: "play none none reverse"
          }
        }
      );

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
            priority
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
            priority
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
            priority
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
            priority
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

        {/* ESCENA 6: La Oferta (Sección de Precios) */}
        <div ref={scene6Ref} className="absolute inset-0 w-full h-full bg-slate-950 opacity-0">
          <div className="flex items-center justify-center h-full p-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
                  Wspace
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Tu plataforma para el viaje definitivo
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Plan Básico */}
                <Card className="pricing-card bg-slate-900 border-slate-700 hover:border-cyan-400 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl">Explorador</CardTitle>
                    <CardDescription className="text-gray-400">
                      Para comenzar tu viaje
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-4">
                      $29<span className="text-lg text-gray-400">/mes</span>
                    </div>
                    <ul className="space-y-2 text-gray-300 mb-6">
                      <li>✓ Acceso básico al cosmos</li>
                      <li>✓ 5 viajes por mes</li>
                      <li>✓ Soporte estándar</li>
                    </ul>
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 glow-cyan">
                      Comenzar Viaje
                    </Button>
                  </CardContent>
                </Card>

                {/* Plan Premium */}
                <Card className="pricing-card bg-slate-900 border-cyan-400 hover:border-cyan-300 transition-colors relative">
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-cyan-400 text-black">
                    Más Popular
                  </Badge>
                  <CardHeader>
                    <CardTitle className="text-white text-2xl">Navegante</CardTitle>
                    <CardDescription className="text-gray-400">
                      Para viajeros experimentados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-4">
                      $79<span className="text-lg text-gray-400">/mes</span>
                    </div>
                    <ul className="space-y-2 text-gray-300 mb-6">
                      <li>✓ Acceso completo al cosmos</li>
                      <li>✓ Viajes ilimitados</li>
                      <li>✓ Soporte prioritario</li>
                      <li>✓ Herramientas avanzadas</li>
                    </ul>
                    <Button className="w-full bg-cyan-400 hover:bg-cyan-500 text-black glow-cyan">
                      Explorar Galaxias
                    </Button>
                  </CardContent>
                </Card>

                {/* Plan Enterprise */}
                <Card className="pricing-card bg-slate-900 border-slate-700 hover:border-purple-400 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl">Comandante</CardTitle>
                    <CardDescription className="text-gray-400">
                      Para expediciones corporativas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-4">
                      $199<span className="text-lg text-gray-400">/mes</span>
                    </div>
                    <ul className="space-y-2 text-gray-300 mb-6">
                      <li>✓ Acceso a múltiples universos</li>
                      <li>✓ Expediciones en equipo</li>
                      <li>✓ Soporte 24/7</li>
                      <li>✓ API personalizada</li>
                      <li>✓ Análisis avanzado</li>
                    </ul>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 glow-cyan">
                      Liderar Expedición
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}