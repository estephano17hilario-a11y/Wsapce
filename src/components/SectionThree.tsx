'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

type ArsenalItem = {
  title: string;
  description: string;
};

const items: ArsenalItem[] = [
  {
    title: 'CHAT DE GUERRA TÁCTICO',
    description:
      'Coordina ataques en tiempo real. Forma clanes. Identifica aliados. Aquí no estás solo, estás en un puto ejército.',
  },
  {
    title: 'ARSENAL DE CONQUISTA',
    description:
      '¿Píxeles normales? ¡No me jodas! Despliega Píxeles Bomba para reventar sus defensas. Usa Caballos de Troya para infiltrarte. Esto no es arte, es dominio.',
  },
  {
    title: 'GUERRA DE GUERRILLAS 24/7',
    description:
      'Forma bandos de guerrilla. Libra una guerra constante. En Wspace, el imperio nunca duerme. ¿Crees que puedes descansar?',
  },
];

export default function SectionThree() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (titleRef.current) {
      tl.from(titleRef.current, { y: 30, opacity: 0, duration: 0.6 });
    }
    if (subtitleRef.current) {
      tl.from(subtitleRef.current, { y: 20, opacity: 0, duration: 0.5 }, '-=0.3');
    }

    if (cardRefs.current.length) {
      tl.from(cardRefs.current, { y: 30, opacity: 0, stagger: 0.15, duration: 0.55 }, '-=0.2');
    }
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full bg-black py-28 px-6">
      {/* Fondo cósmico sutil */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[65vw] h-[65vw] cta-radial" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 cta-aurora" />
        <div className="absolute inset-0 premium-noise" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Título y subtítulo */}
        <h2 ref={titleRef} className="text-center text-4xl md:text-6xl font-extrabold cinematic-text shine-text mb-4">
          BIENVENIDO A LA PUTA GUERRA.
        </h2>
        <p ref={subtitleRef} className="text-center text-lg md:text-2xl text-white/80 mb-8">
          "En Wplace pintabas. En Wspace CONQUISTAS."
        </p>
        <div className="title-underline mb-14" />

        {/* Arsenal: tres columnas limpias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div
              key={item.title}
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              className="group relative rounded-2xl ring-1 ring-white/10 bg-black/40 p-6 hover:ring-cyan-300/30 transition-all lux-card hover-tilt float-soft"
            >
              {/* Anillo premium rodeando el card */}
              <div className="absolute -inset-3 -z-10 gradient-ring" />

              {/* Placeholder del mockup */}
              <div className="relative flex justify-center">
                <div className="w-[300px] h-[200px] rounded-xl bg-neutral-900/80 ring-1 ring-white/10 shadow-inner overflow-hidden">
                  <div className="absolute inset-0 premium-noise" />
                </div>
              </div>

              {/* Texto del arsenal */}
              <div className="mt-6">
                <h3 className="text-xl font-bold shine-text mb-2">{item.title}</h3>
                <p className="text-white/75 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}