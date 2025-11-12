"use client"

import React, { useEffect, useRef, useState } from 'react'

export default function TopGoldTicker() {
  const [active, setActive] = useState(false)
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('')
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

    function scheduleNext(initialDelay?: number) {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      const delay = typeof initialDelay === 'number' ? initialDelay : (Math.floor(10 + Math.random() * 30) * 1000)
      timerRef.current = window.setTimeout(() => {
        const name = pickName()
        setMsg(`${name} acaba de obtener la Insignia de Oro`)
        setShow(true)
        if (hideRef.current) { clearTimeout(hideRef.current); hideRef.current = null }
        hideRef.current = window.setTimeout(() => { setShow(false); scheduleNext() }, 6000)
      }, delay)
    }
    const onTrigger = () => {
      setActive(true)
      if (!startedRef.current) {
        startedRef.current = true
        scheduleNext(2000)
      }
    }
    window.addEventListener('after_andromeda', onTrigger)
    return () => {
      window.removeEventListener('after_andromeda', onTrigger)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (hideRef.current) clearTimeout(hideRef.current)
    }
  }, [])

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${active ? '' : 'pointer-events-none'}`} aria-live="polite">
      <div className={`transition-transform duration-500 ${show ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="mx-auto max-w-7xl">
          <div className="mx-3 mt-2 rounded-md border border-amber-400/30 bg-gradient-to-r from-amber-500/20 via-emerald-500/10 to-cyan-500/20 shadow-[0_0_30px_rgba(255,200,0,0.25)]">
            <div className="flex items-center gap-3 px-3 py-2">
              <span className="text-amber-300 text-lg">👑</span>
              <span className="text-xs md:text-sm text-amber-100 font-semibold">Plan Oro</span>
              <span className="text-[11px] md:text-xs text-cyan-100/90">{msg}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}