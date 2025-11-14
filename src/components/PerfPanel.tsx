'use client'

import { useEffect, useRef, useState } from 'react'

export default function PerfPanel() {
  const [fps, setFps] = useState(0)
  const [cls, setCls] = useState<number | null>(null)
  const [longTasks, setLongTasks] = useState<number>(0)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number>(0)
  const framesRef = useRef<number>(0)

  useEffect(() => {
    const loop = (t: number) => {
      framesRef.current++
      const dt = t - lastRef.current
      if (dt >= 1000) {
        setFps(framesRef.current)
        framesRef.current = 0
        lastRef.current = t
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    lastRef.current = performance.now()
    rafRef.current = requestAnimationFrame(loop)
    const po = 'PerformanceObserver' in window ? new PerformanceObserver((list: PerformanceObserverEntryList) => {
      list.getEntries().forEach((e) => {
        const entryType = (e as PerformanceEntry).entryType
        const name = (e as PerformanceEntry).name
        if (entryType === 'longtask' || name === 'longtask') {
          setLongTasks((v) => v + 1)
        }
      })
    }) : null
    try { po?.observe({ entryTypes: ['longtask'] as string[] }) } catch {}
    const clsPO = 'PerformanceObserver' in window ? new PerformanceObserver((list: PerformanceObserverEntryList) => {
      list.getEntries().forEach((e) => {
        const name = (e as PerformanceEntry).name
        const ls = e as PerformanceEntry & { value?: number; hadRecentInput?: boolean }
        if (name === 'layout-shift' && !ls.hadRecentInput) {
          const inc = typeof ls.value === 'number' ? ls.value : 0
          setCls((v) => (v || 0) + inc)
        }
      })
    }) : null
    try { clsPO?.observe({ type: 'layout-shift', buffered: true } as unknown as PerformanceObserverInit) } catch {}
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); try { po?.disconnect(); clsPO?.disconnect() } catch {} }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-[60] px-3 py-2 rounded-xl border border-neutral-700/60 bg-neutral-900/80 text-cyan-200/90 text-xs shadow-xl backdrop-blur">
      <div>FPS: {fps}</div>
      <div>Long tasks: {longTasks}</div>
      <div>CLS: {cls ?? 0}</div>
    </div>
  )
}