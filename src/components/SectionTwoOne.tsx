'use client';

import PixelCanvas from '@/components/PixelCanvas'

export default function SectionTwoOne() {
  return (
    <section className="relative w-full bg-black py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl md:text-5xl font-extrabold cinematic-text mb-14">
          WSPACE.LIVE: TU IMPERIO, TU LIENZO CÓSMICO
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Columna Izquierda: Visual (Lienzo) */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Canvas cósmico interactivo */}
              <PixelCanvas width={420} height={300} />
              {/* Glow sutil alrededor */}
              <div className="absolute inset-0 -z-10 blur-xl cta-radial"></div>
            </div>
          </div>

          {/* Columna Derecha: Texto (Filosofía) */}
          <div className="text-gray-300 leading-relaxed space-y-6">
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