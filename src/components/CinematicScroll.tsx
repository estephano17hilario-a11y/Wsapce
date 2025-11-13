'use client';

import { useLayoutEffect, useRef, useState, useEffect } from 'react';
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
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const initGuardRef = useRef<boolean>(false);
  const [showScrollHint, setShowScrollHint] = useState(false)
  const hintHiddenRef = useRef<boolean>(false)

  // Referencias para textos
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);
  const text4Ref = useRef<HTMLDivElement>(null);
  const text5Ref = useRef<HTMLDivElement>(null);
  const completionReportedRef = useRef<boolean>(false);
  const [ctaRipple, setCtaRipple] = useState(false)
  const prevHtmlOverflowRef = useRef<string>('')
  const prevBodyOverflowRef = useRef<string>('')
  const unlockTimeoutRef = useRef<number | null>(null)
  const scrollLockCleanupRef = useRef<(() => void) | null>(null)
  const gateLockedRef = useRef<boolean>(false)
  const gateReleasedRef = useRef<boolean>(false)
  const scrollLockedRef = useRef<boolean>(false)
  const wheelHandlerRef = useRef<((e: Event) => void) | null>(null)
  const touchHandlerRef = useRef<((e: Event) => void) | null>(null)
  const keyHandlerRef = useRef<((e: KeyboardEvent) => void) | null>(null)
  const gateClampYRef = useRef<number>(0)
  const gateScrollHandlerRef = useRef<((e: Event) => void) | null>(null)
  const [ctaAttention, setCtaAttention] = useState(true)

  const scrollToIdSlow = (id: string, duration = 2500) => {
    if (typeof window === 'undefined') return
    const el = document.getElementById(id)
    if (!el) return
    const startY = window.scrollY || window.pageYOffset
    const rect = el.getBoundingClientRect()
    const targetY = rect.top + startY
    const start = performance.now()
    const ease = (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2)
    const tick = (now: number) => {
      const elapsed = now - start
      const ratio = Math.min(1, elapsed / duration)
      const eased = ease(ratio)
      const y = startY + (targetY - startY) * eased
      window.scrollTo({ top: y })
      if (ratio < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  const lockScroll = (ms?: number) => {
    if (typeof window === 'undefined') return
    prevHtmlOverflowRef.current = document.documentElement.style.overflow
    prevBodyOverflowRef.current = document.body.style.overflow
    document.documentElement.classList.add('scroll-locked')
    document.body.classList.add('scroll-locked')
    if (!wheelHandlerRef.current) wheelHandlerRef.current = (e: Event) => { e.preventDefault() }
    if (!touchHandlerRef.current) touchHandlerRef.current = (e: Event) => { e.preventDefault() }
    if (!keyHandlerRef.current) keyHandlerRef.current = (e: KeyboardEvent) => { e.preventDefault() }
    if (!scrollLockedRef.current) {
      window.addEventListener('wheel', wheelHandlerRef.current!, { passive: false })
      window.addEventListener('touchmove', touchHandlerRef.current!, { passive: false })
      window.addEventListener('keydown', keyHandlerRef.current!)
      scrollLockedRef.current = true
    }
    scrollLockCleanupRef.current = () => {
      if (wheelHandlerRef.current) window.removeEventListener('wheel', wheelHandlerRef.current)
      if (touchHandlerRef.current) window.removeEventListener('touchmove', touchHandlerRef.current)
      if (keyHandlerRef.current) window.removeEventListener('keydown', keyHandlerRef.current)
      document.documentElement.classList.remove('scroll-locked')
      document.body.classList.remove('scroll-locked')
      scrollLockedRef.current = false
    }
    if (typeof ms === 'number' && ms > 0) {
      if (unlockTimeoutRef.current) { clearTimeout(unlockTimeoutRef.current); unlockTimeoutRef.current = null }
      unlockTimeoutRef.current = window.setTimeout(() => {
        unlockScroll()
        unlockTimeoutRef.current = null
      }, ms)
    }
  }

  const unlockScroll = () => {
    if (unlockTimeoutRef.current) { clearTimeout(unlockTimeoutRef.current); unlockTimeoutRef.current = null }
    scrollLockCleanupRef.current?.()
    gateLockedRef.current = false
    gateReleasedRef.current = true
  }

  useLayoutEffect(() => {
    try { ScrollTrigger.getAll().forEach(t => t.kill()) } catch {}
    try { tlRef.current?.kill(); tlRef.current = null } catch {}
    completionReportedRef.current = false
    try { window.scrollTo({ top: 0, behavior: 'auto' }) } catch {}
    const onUserStart = () => {
      try {
        window.scrollTo({ top: 0, behavior: 'auto' })
        const titleEl = text1Ref.current?.querySelector('h1') as HTMLElement | null
        gsap.set(text1Ref.current, { opacity: 1, y: 0 })
        if (titleEl) gsap.set(titleEl, { opacity: 1, y: 0, scale: 1 })
        tlRef.current?.progress(0)
        ScrollTrigger.refresh()
      } catch {}
    }
    if (initGuardRef.current) return
    initGuardRef.current = true
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
      const tu1 = (text1Ref.current?.querySelectorAll('h1')?.[1] ?? null) as HTMLElement | null
      const title2 = text2Ref.current?.querySelector('h1') as HTMLElement | null
      const subtitle2 = text2Ref.current?.querySelector('p') as HTMLElement | null
      const title3 = text3Ref.current?.querySelector('h1') as HTMLElement | null
      const subtitle3 = text3Ref.current?.querySelector('p') as HTMLElement | null
      const title4 = text4Ref.current?.querySelector('h1') as HTMLElement | null
      const subtitle4 = text4Ref.current?.querySelector('p') as HTMLElement | null
      const title5 = text5Ref.current?.querySelector('h1') as HTMLElement | null
      const subtitle5 = text5Ref.current?.querySelector('p') as HTMLElement | null
      const bpMd = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 768px)').matches
      const bpLg = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 1024px)').matches
      const subtitle4TargetY = bpLg ? -120 : bpMd ? -100 : -80
      const title4TargetY = bpLg ? 20 : bpMd ? 16 : 12
      // Configurar estado inicial de todas las escenas
      gsap.set([scene2Ref.current, scene3Ref.current, scene4Ref.current, scene5Ref.current, scene6Ref.current], { opacity: 0 });
      // Texto de la ESCENA 1 visible desde el inicio (scroll 0)
      gsap.set(text1Ref.current, { opacity: 1, y: 0 });
      gsap.set(subtitle1, { opacity: 0, filter: 'blur(8px)', y: 12 });
      gsap.set(tu1, { opacity: 0, filter: 'blur(10px)', y: 16 });
      gsap.set([text2Ref.current, text3Ref.current, text4Ref.current, text5Ref.current], { opacity: 0, y: 50 });

      // Crear línea de tiempo maestra con suavizado interno
      const tl = gsap.timeline({ smoothChildTiming: true });
      tlRef.current = tl

      // ESCENA 1: Inicio Personal (0% - 16.6%)
      tl.call(() => trackEvent('scene_enter', { id: 1 }))
      // Imagen: fade in + zoom-out con el scroll
      .fromTo(img1,
        { opacity: 1, scale: 4.0, yPercent: 6, transformOrigin: '50% 80%' },
        { opacity: 1, scale: 1, yPercent: 0, duration: 2.2, ease: 'none' }
      )
      // Mantener título principal visible y estable (solo transform para rendimiento)
      // Fade out del título principal ANTES de que aparezca la segunda frase
      .to(title1, { opacity: 0, y: -12, scale: 0.98, duration: 0.6, ease: 'power2.in' })
      // Pequeña pausa para separar visualmente
      .to({}, { duration: 0.4 })
      // Ahora sí entra la segunda frase y luego "TÚ"
      .add(ctaSubtitle(subtitle1))
      .add(ctaTitle(tu1), "-=0")
      .add(ctaFadeOut(tu1, subtitle1), "+=1.2")
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
      // Imagen: zoom in inicial + suave, luego se aleja con el scroll hasta pantalla completa
      .fromTo(img2,
        { opacity: 0, scale: 2.2, transformOrigin: 'center center' },
        { opacity: 1, scale: 1.08, duration: 1.8, ease: 'none' },
        "-=0.4"
      )
      // Texto (Escena 2): efecto CTA para título y subtítulo
      .fromTo(text2Ref.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, "-=0.8")
      .add(ctaSubtitle(subtitle2), "-=0.6")
      .add(ctaTitle(title2), "+=0.5")
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
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      )
      // Imagen: fade in + zoom-out (más agresivo)
      .fromTo(img3,
        { opacity: 0.8, scale: 3.6, transformOrigin: 'center center' },
        { opacity: 1, scale: 0.12, duration: 3.0, ease: 'none' },
        "-=0.4"
      )
      .to({}, { duration: 0.6 })
      .fromTo(text3Ref.current, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, "-=0.8")
      .add(ctaTitle(title3, {
        duration: 2.8,
        from: { filter: 'blur(32px) brightness(0.82)', letterSpacing: '0.26em', scale: 1.28, y: 60 },
        to:   { filter: 'blur(0px) brightness(1.05)', y: 0 }
      }), "+=0.2")
      .add(ctaSubtitle(subtitle3, {
        duration: 2.4,
        from: { filter: 'blur(22px) brightness(0.85)', y: 42 },
        to:   { filter: 'blur(0px) brightness(1)', y: 0 }
      }), "+=0.1")
      .add(ctaFadeOut(title3, null), "+=1.2")
      .add(ctaFadeOut(null, subtitle3), "-=0.6")
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
      .to({}, { duration: 0.6 })
      .fromTo(text4Ref.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.0, ease: 'power2.out' },
        "+=0.0"
      )
      .add(ctaTitle(title4, {
        duration: 2.6,
        from: { filter: 'blur(32px) brightness(0.82)', letterSpacing: '0.26em', scale: 1.28, y: 60 },
        to:   { filter: 'blur(0px) brightness(1.05)', y: title4TargetY }
      }), "+=0.15")
      .add(ctaSubtitle(subtitle4, {
        duration: 2.2,
        from: { filter: 'blur(22px) brightness(0.85)', y: 42 },
        to:   { filter: 'blur(0px) brightness(1)', y: subtitle4TargetY }
      }), "+=0.1")
      .add(ctaFadeOut(title4, subtitle4), "+=1.2")
      // Imagen: salida solo con fade out
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
        { opacity: 0, scale: 4.8, transformOrigin: 'center center' },
        { opacity: 1, scale: 1.0, duration: 3.0, ease: 'none' },
        "-=0.4"
      )
      .to({}, { duration: 0.35 })
      .fromTo(text5Ref.current, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power2.out' }, "+=0.1")
      .add(ctaTitle(title5, { duration: 2.4 }), "+=0.1")
      .add(ctaSubtitle(subtitle5, { duration: 2.0 }), "+=0.05")
      .add(ctaFadeOut(title5, subtitle5), "+=1.2")
      // Imagen: fade out y contenedor: solo fade out
      
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
        '.cta-button',
        { opacity: 0, scale: 0.9, y: 24, filter: 'brightness(0.8) blur(6px)' },
        { opacity: 1, scale: 1, y: 0, filter: 'brightness(1) blur(0px)', duration: 1.3, ease: 'back.out(1.7)' },
        "-=0.8"
      )
      // Mantener la sección Wspace visible por más tiempo sin cambiar visualmente
      .to({}, { duration: 2.5 })
      // Salida: solo fade out para las letras/botón
      .to(['.cta-title', '.cta-button'], { opacity: 0, duration: 1, ease: 'power2.in' })
      .call(() => trackEvent('scene_exit', { id: 6 }));

      // Configurar ScrollTrigger con mejor control
      ScrollTrigger.create({
        trigger: mainContainerRef.current,
        start: "top top",
        end: "+=13500",
        scrub: 0.6, // Más responsivo, menos amortiguación
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
          if (!hintHiddenRef.current && self.progress > 0.03) {
            hintHiddenRef.current = true
            setShowScrollHint(false)
          }
          if (self.progress > 0.92 && !gateLockedRef.current && !gateReleasedRef.current) {
            gateLockedRef.current = true
            lockScroll()
            gateClampYRef.current = Math.max(self.start, self.end - 2)
            if (!gateScrollHandlerRef.current) {
              gateScrollHandlerRef.current = () => {
                const y = window.scrollY || window.pageYOffset
                if (y > gateClampYRef.current) {
                  window.scrollTo({ top: gateClampYRef.current })
                }
              }
              window.addEventListener('scroll', gateScrollHandlerRef.current, { passive: true })
            }
            try { tlRef.current?.progress(0.985) } catch {}
          }
          if (gateLockedRef.current) {
            const hold = Math.max(self.start, self.end - 2)
            const y = window.scrollY || window.pageYOffset
            if (y > hold) {
              window.scrollTo({ top: hold })
            }
          }
        }
      });

      // Escuchar inicio del usuario para garantizar estado inicial perfecto
      window.addEventListener('user_name_set', onUserStart)

      // Animación ligera de glow para el CTA (respeta prefers-reduced-motion)
      const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!reduceMotion) {
        gsap.to('.cta-button', { boxShadow: '0 0 30px rgba(34, 211, 238, 0.6)', repeat: -1, yoyo: true, duration: 2.5, ease: 'sine.inOut' })
      }

    }, mainContainerRef);

    return () => { 
      window.removeEventListener('user_name_set', onUserStart);
      try { tlRef.current?.kill(); tlRef.current = null } catch {}
      try { ScrollTrigger.getAll().forEach(t => t.kill()) } catch {}
      ctx.revert();
      initGuardRef.current = false
      if (unlockTimeoutRef.current) { clearTimeout(unlockTimeoutRef.current); unlockTimeoutRef.current = null }
      scrollLockCleanupRef.current?.()
      if (gateScrollHandlerRef.current) { window.removeEventListener('scroll', gateScrollHandlerRef.current) }
      gateLockedRef.current = false
      gateReleasedRef.current = false
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setShowScrollHint(true), 1200)
    return () => clearTimeout(id)
  }, [])

  return (
    <section ref={mainContainerRef} className="relative w-full h-screen overflow-hidden">
      {/* Contenedor fijo para todas las escenas */}
      <div className="fixed inset-0">
        {showScrollHint && (
          <div className="absolute left-1/2 bottom-10 -translate-x-1/2 z-[60] pointer-events-none">
            <div className="scroll-lux relative">
              <span className="scroll-label">scroll</span>
              <span className="scroll-mouse">
                <span className="scroll-wheel" />
              </span>
            </div>
          </div>
        )}
        
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
          <div ref={text1Ref} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6 opacity-0 pointer-events-none">
            <div className="relative text-center text-white">
              <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl sm:text-6xl md:text-8xl leading-normal font-extrabold py-2 bg-gradient-to-r from-red-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent cinematic-text text-center">
                <span className="block whitespace-nowrap">forma la historia que</span>
                <span className="block whitespace-nowrap">siempre quisistes tener</span>
              </h1>
              <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl md:text-3xl opacity-95 text-white [text-shadow:0_0_12px_rgba(255,255,255,0.8),0_0_6px_rgba(255,255,255,0.6)]">
                una donde los límites los pongas
              </p>
              <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 translate-y-[120px] text-6xl md:text-8xl leading-normal font-extrabold py-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent cinematic-text z-10 [text-shadow:0_0_20px_rgba(56,189,248,0.9),0_0_8px_rgba(56,189,248,0.7)]">
                TÚ
              </h1>
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
          <div ref={text2Ref} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6 opacity-0 pointer-events-none">
            <div className="text-center text-white">
              <div className="relative inline-block max-w-[90vw] px-8 py-6">
                <p className="text-2xl md:text-3xl text-white opacity-95 font-semibold [text-shadow:0_0_16px_rgba(255,255,255,0.9),0_0_8px_rgba(255,255,255,0.7)]">
                  el mundo es un caos para construir esa historia
                </p>
                <h1 className="mt-2 text-6xl md:text-8xl leading-normal font-black py-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent cinematic-text [text-shadow:0_0_22px_rgba(56,189,248,0.9),0_0_10px_rgba(56,189,248,0.7)]">
                  tu legado
                </h1>
              </div>
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
          <div ref={text3Ref} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6 opacity-0 pointer-events-none">
            <div className="relative text-center">
              <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 translate-y-[60px] md:translate-y-[80px] text-6xl md:text-8xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent cinematic-text [text-shadow:0_0_20px_rgba(56,189,248,0.85),0_0_10px_rgba(56,189,248,0.6)]">
                el lienzo perfecto
              </h1>
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
          <div ref={text4Ref} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6 opacity-0 pointer-events-none">
            <div className="relative text-center">
              <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl md:text-3xl text-white [text-shadow:0_0_12px_rgba(255,255,255,0.85),0_0_6px_rgba(255,255,255,0.6)]">
                Una que no entienda de
              </p>
              <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl md:text-[10rem] font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent cinematic-text [text-shadow:0_0_22px_rgba(56,189,248,0.9),0_0_10px_rgba(56,189,248,0.7)]">
                límites
              </h1>
            </div>
          </div>
        </div>

        {/* ESCENA 5: Destino Final */}
        <div ref={scene5Ref} className="absolute inset-0 w-full h-full opacity-0 bg-black">
          <Image
            src="/andromeda zoom out up (2).webp"
            alt="Destino Final - Andrómeda"
            fill
            className="object-cover object-center scene-image"
            loading="lazy"
            sizes="100vw"
            quality={80}
          />
          <div ref={text5Ref} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6 opacity-0 pointer-events-none">
            <div className="relative text-center">
              <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -translate-y-[320px] md:-translate-y-[420px] lg:-translate-y-[480px] text-2xl md:text-3xl text-white opacity-95 [text-shadow:0_0_14px_rgba(255,255,255,0.85),0_0_6px_rgba(255,255,255,0.6)]">
                para construir
              </p>
              <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 translate-y-[6px] md:translate-y-[8px] text-7xl md:text-9xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent cinematic-text [text-shadow:0_0_22px_rgba(56,189,248,0.9),0_0_10px_rgba(56,189,248,0.7)]">
                tu imperio
              </h1>
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
              <h1 className="cta-title wspace-cosmic-title text-7xl md:text-9xl font-extrabold" aria-label="WSPACE">
                <span className="wspace-letter">W</span>
                <span className="wspace-letter">S</span>
                <span className="wspace-letter">P</span>
                <span className="wspace-letter">A</span>
                <span className="wspace-letter">C</span>
                <span className="wspace-letter">E</span>
              </h1>
            <Button
              className={`cta-button cta-button-premium mt-10 px-8 py-6 text-lg rounded-2xl glow-cyan relative left-3 md:left-5 ${ctaRipple ? 'btn-glow-once btn-glow-once--subtle btn-glow-once--subtle-active' : 'btn-glow-once btn-glow-once--subtle'} ${ctaAttention ? 'cta-attn-on' : ''}`}
              onClick={() => {
                lockScroll(3700)
                setCtaRipple(true)
                setTimeout(() => setCtaRipple(false), 900)
                setCtaAttention(false)
                try { window.dispatchEvent(new CustomEvent('start_cosmic')) } catch {}
                setTimeout(() => scrollToIdSlow('wspace-start', 2600), 1000)
                setTimeout(() => unlockScroll(), 3700)
              }}
            >
              Comenzamos
              {ctaRipple && <span aria-hidden className="once-ripple-subtle once-ripple-subtle--blue" />}
              {ctaAttention && <span aria-hidden className="cta-attn-ring" />}
            </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
