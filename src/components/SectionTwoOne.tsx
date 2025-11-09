"use client"

import { useRef, useState } from 'react'
import PixelCanvas from '@/components/PixelCanvas'

export default function SectionTwoOne() {
  const sectionRef = useRef<HTMLDivElement>(null)
  // Dispara la animación una única vez al montar, sin efectos
  const [flagSpawnTick] = useState(1)

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-label="Mockup 2: Lienzo pintable con bandera"
      className="relative w-full bg-transparent py-10 px-6"
    >
      <div className="mx-auto max-w-5xl flex items-center justify-center">
        <PixelCanvas width={420} height={300} paintable showShip={false} spawnFlagSignal={flagSpawnTick} />
      </div>
    </section>
  )
}