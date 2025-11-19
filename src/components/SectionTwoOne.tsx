"use client"

import { useEffect, useRef, useState } from 'react'
import PixelCanvas from '@/components/PixelCanvas'

export default function SectionTwoOne() {
  const sectionRef = useRef<HTMLDivElement>(null)
  // Dispara la animación una única vez al montar, sin efectos
  const [flagSpawnTick] = useState(1)
  const [cw, setCw] = useState<number>(420)
  const [ch, setCh] = useState<number>(300)

  useEffect(() => {
    const update = () => {
      const el = sectionRef.current
      const rectW = el ? el.getBoundingClientRect().width : window.innerWidth
      const w = Math.max(240, Math.min(420, Math.floor(rectW - 24)))
      const h = Math.round(w * (300 / 420))
      setCw(w)
      setCh(h)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-label="Mockup 2: Lienzo pintable con bandera"
      className="relative w-full bg-transparent py-10 px-6"
    >
      <div className="mx-auto w-full max-w-5xl px-2 sm:px-4 flex items-center justify-center">
        <PixelCanvas width={cw} height={ch} paintable showShip={false} spawnFlagSignal={flagSpawnTick} />
      </div>
    </section>
  )
}