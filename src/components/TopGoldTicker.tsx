"use client"

import React, { useEffect, useRef, useState } from 'react'

export default function TopGoldTicker() {
  const [active, setActive] = useState(false)
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('')
  const [sticky, setSticky] = useState(false)
  const stickyRef = useRef(false)
  const [compact, setCompact] = useState(false)
  const compactTimerRef = useRef<number | null>(null)
  const [flash, setFlash] = useState(false)
  const flashTimerRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const hideRef = useRef<number | null>(null)
  const startedRef = useRef(false)

  

  useEffect(() => {
    function pickName() {
      const names = ['nova','strix','zephyr','lyra','orion','vega','kael','astra','nox','raven','ember','onyx','echo','quake','blaze','flare','vertex','delta','sigma','omega','sol','luna','arix','kira','zane','ivy','nero','pax','quinn','vex']
      const n = names[Math.floor(Math.random() * names.length)]
      const num = Math.floor(Math.random() * 900) + 100
      return `${n}${num}`
    }
    function abbrEmail(e?: string | null) {
      if (!e) return '—'
      const parts = e.split('@')
      const name = parts[0] || ''
      const domain = parts[1] || ''
      const nameMask = name.length <= 3 ? `${name.slice(0, 1)}***` : `${name.slice(0, 3)}***`
      const domParts = domain.split('.')
      const provider = domParts[0] || ''
      const tld = domParts.slice(1).join('.')
      const providerMask = provider ? `${provider.slice(0, 1)}***` : ''
      return `${nameMask}@${providerMask}${tld ? `.${tld}` : ''}`
    }

    function kickCompactCycle() {
      setCompact(false)
      if (compactTimerRef.current) { clearTimeout(compactTimerRef.current); compactTimerRef.current = null }
      compactTimerRef.current = window.setTimeout(() => { setCompact(true) }, 5000)
    }

    function doFlash() {
      setFlash(true)
      if (flashTimerRef.current) { clearTimeout(flashTimerRef.current); flashTimerRef.current = null }
      flashTimerRef.current = window.setTimeout(() => { setFlash(false) }, 500)
    }

    function scheduleNext(initialDelay?: number) {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      const delay = typeof initialDelay === 'number' ? initialDelay : (Math.floor(10 + Math.random() * 30) * 1000)
      timerRef.current = window.setTimeout(() => {
        const name = pickName()
        setMsg(`${name} acaba de obtener la Insignia de Oro`)
        setShow(true)
        doFlash()
        kickCompactCycle()
        if (!stickyRef.current) {
          if (hideRef.current) { clearTimeout(hideRef.current); hideRef.current = null }
          hideRef.current = window.setTimeout(() => { setShow(false); scheduleNext() }, 6000)
        } else {
          scheduleNext()
        }
      }, delay)
    }
    const onTrigger = () => {
      setActive(true)
      setSticky(true)
      stickyRef.current = true
      setShow(true)
      doFlash()
      kickCompactCycle()
      if (!startedRef.current) {
        startedRef.current = true
        scheduleNext(1500)
      }
    }
    window.addEventListener('after_andromeda', onTrigger)
    const onGold = (e: Event) => {
      try {
        const ev = e as CustomEvent<{ email?: string }>
        const email: string | undefined = ev?.detail?.email
        const label = email ? abbrEmail(email) : pickName()
        setActive(true)
        setMsg(`${label} acaba de obtener la Insignia de Oro`)
        setShow(true)
        doFlash()
        kickCompactCycle()
        if (!stickyRef.current) {
          if (hideRef.current) { clearTimeout(hideRef.current); hideRef.current = null }
          hideRef.current = window.setTimeout(() => { setShow(false); scheduleNext(10_000) }, 6000)
        } else {
          scheduleNext(10_000)
        }
      } catch {}
    }
    window.addEventListener('gold_purchased', onGold)
    return () => {
      window.removeEventListener('after_andromeda', onTrigger)
      window.removeEventListener('gold_purchased', onGold)
    }
  }, [])

  useEffect(() => {
    stickyRef.current = sticky
  }, [sticky])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (hideRef.current) clearTimeout(hideRef.current)
      if (compactTimerRef.current) clearTimeout(compactTimerRef.current)
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    }
  }, [])

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${active ? '' : 'pointer-events-none'}`} aria-live="polite">
      <div className={`transition-all duration-700 ease-out ${show ? 'translate-y-0 opacity-100 blur-0' : '-translate-y-full opacity-0 blur-sm'}`}>
        <div className={`mx-auto max-w-7xl transition-transform duration-700 ${compact ? '-translate-y-[calc(100%-6px)] md:-translate-y-[calc(100%-8px)]' : 'translate-y-0'}`}>
          <div className="mx-3 mt-2 rounded-md border border-amber-400/30 bg-gradient-to-r from-amber-500/20 via-emerald-500/10 to-cyan-500/20 shadow-[0_0_30px_rgba(255,200,0,0.25)] relative overflow-hidden">
            <span aria-hidden className={`absolute inset-0 rounded-md bg-amber-300/25 blur-md mix-blend-screen transition-opacity duration-500 ${flash ? 'opacity-100' : 'opacity-0'}`} />
            <span aria-hidden className={`absolute inset-0 rounded-md ring-2 ring-amber-300/60 transition-opacity duration-500 pointer-events-none ${flash ? 'opacity-70' : 'opacity-0'}`} />
            <div className="flex items-center gap-3 px-4 py-3 md:py-4">
              <span className="text-amber-300 text-2xl md:text-3xl">👑</span>
              <span className="text-sm md:text-base text-amber-100 font-semibold">Plan Oro</span>
              <span className="text-xs md:text-sm text-cyan-100/90">{msg}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}