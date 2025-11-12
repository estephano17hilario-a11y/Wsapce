"use client"

import React, { useEffect, useState } from 'react'

type RankItem = { user: { email: string } | null; count: number }

export default function RankingsSection() {
  const [items, setItems] = useState<RankItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const [limit, setLimit] = useState<number>(10)
  const [me, setMe] = useState<{ id: string; email: string; plan: string } | null>(null)
  const [myStats, setMyStats] = useState<{ totalInvites: number; byPlan: Record<string, number>; referees: { email: string; plan: string }[] } | null>(null)
  const [myError, setMyError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/rankings/top?limit=50', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) { if (!mounted) return; setError(data.error || 'error'); return }
        if (!mounted) return
        setItems(data.top as RankItem[])
        setUpdatedAt(Date.now())
        try {
          const [uRes, sRes] = await Promise.all([
            fetch('/api/user', { cache: 'no-store' }),
            fetch('/api/referrals/stats', { cache: 'no-store' })
          ])
          const uData = await uRes.json()
          setMe(uData.user || null)
          const sData = await sRes.json()
          if (!sRes.ok) { setMyError(sData.error || 'error') }
          else {
            const referees = Array.isArray(sData.stats.referees) ? (sData.stats.referees as { email: string; plan: string }[]) : []
            setMyStats({ totalInvites: sData.stats.totalInvites, byPlan: sData.stats.byPlan, referees })
            setMyError(null)
          }
        } catch { setMyError('network_error') }
      } catch { if (!mounted) return; setError('network_error') }
      finally { if (!mounted) return; setLoading(false) }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

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

  function generateFakeItems(limit: number): RankItem[] {
    const names = ['nova','strix','zephyr','lyra','orion','vega','kael','astra','nox','raven','ember','onyx','echo','quake','blaze','flare','vertex','delta','sigma','omega']
    const items = Array.from({ length: limit }, (_, i) => ({ user: { email: `${names[i % names.length]}${i + 1}@demo.local` }, count: Math.floor(Math.random() * 9) }))
    for (let i = 0; i < Math.min(3, items.length); i++) items[i].count = 0
    items.sort((a, b) => b.count - a.count)
    return items
  }

  function renderRankItem(it: RankItem, idx: number, list: RankItem[]) {
    const rank = idx + 1
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '⚔️'
    const maxCount = Math.max(1, ...list.map(i => i.count))
    const barW = Math.round((it.count / maxCount) * 100)
    const label = it.user?.email ? abbrEmail(it.user.email) : `USUARIO-${rank}`
    return (
      <div key={idx} className={`lux-card p-3 md:p-4 relative overflow-hidden bg-gradient-to-r from-indigo-900/30 via-fuchsia-900/20 to-sky-900/20 border ${rank <= 3 ? 'border-amber-400/40' : 'border-cyan-500/30'} shadow-[0_0_30px_rgba(0,255,255,0.12)]`}>
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-cyan-400/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-fuchsia-500/10 blur-2xl" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 grid place-items-center rounded-md ${rank <= 3 ? 'bg-amber-500/30 text-amber-200' : 'bg-cyan-500/20 text-cyan-200'}`}>{rank}</div>
            <div className="text-slate-200 text-sm md:text-base">{label}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm md:text-base ${rank <= 3 ? 'text-amber-200' : 'text-emerald-300'}`}>{it.count}</span>
            <span className="text-slate-300 text-sm md:text-base">{medal}</span>
          </div>
        </div>
        <div className="mt-2 h-2 rounded bg-slate-700/40 overflow-hidden">
          <div className={`h-full ${rank <= 3 ? 'bg-gradient-to-r from-amber-300 to-amber-500' : 'bg-gradient-to-r from-cyan-400 to-fuchsia-500'}`} style={{ width: `${barW}%` }} />
        </div>
      </div>
    )
  }

  return (
    <section id="rankings" className="relative w-full py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h3 className="text-2xl md:text-4xl font-black tracking-tight shine-text">Rankings de Referidos</h3>
          <p className="mt-2 text-sm md:text-base text-cyan-200/80">Top cuentas por registros a través de su enlace</p>
        </div>
        <div className="mt-2 text-center text-[11px] text-cyan-200/60">{updatedAt ? `Actualizado: ${new Date(updatedAt).toLocaleTimeString()}` : ''}</div>
        <div className="mt-6 flex justify-center">
          <div className="pricing-toggle" role="tablist" aria-label="Tamaño del ranking">
            <button role="tab" aria-selected={limit === 10} className={`toggle-btn ${limit === 10 ? 'is-active' : ''}`} onClick={() => setLimit(10)}>Top 10</button>
            <button role="tab" aria-selected={limit === 50} className={`toggle-btn ${limit === 50 ? 'is-active' : ''}`} onClick={() => setLimit(50)}>Top 50</button>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3 items-stretch">
          <div className="self-center md:max-w-sm">
            <div className={`lux-card p-4 ${!me && !myStats ? 'card-shimmer' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold shine-text">Mi Panel de Referidos</div>
                  <div className="text-xs text-cyan-200/80">{me ? `Tu usuario: ${abbrEmail(me.email)}` : 'No autenticado'}</div>
                </div>
                <button
                  className="pricing-cta cta-secondary"
                  onClick={async () => {
                    setMyError(null)
                    try {
                      const [uRes, sRes] = await Promise.all([
                        fetch('/api/user', { cache: 'no-store' }),
                        fetch('/api/referrals/stats', { cache: 'no-store' })
                      ])
                      const uData = await uRes.json()
                      setMe(uData.user || null)
                      const sData = await sRes.json()
                      if (!sRes.ok) { setMyError(sData.error || 'error') }
                      else {
                        const referees = Array.isArray(sData.stats.referees) ? (sData.stats.referees as { email: string; plan: string }[]) : []
                        setMyStats({ totalInvites: sData.stats.totalInvites, byPlan: sData.stats.byPlan, referees })
                      }
                    } catch { setMyError('network_error') }
                  }}
                >Actualizar</button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-md p-4 bg-slate-900/50 border border-slate-700/40">
                  <div className="text-sm text-cyan-200/80">Tus invitaciones</div>
                  <div className="text-3xl font-bold">{myStats ? myStats.totalInvites : '—'}</div>
                </div>
                <div className="rounded-md p-4 bg-slate-900/50 border border-slate-700/40">
                  <div className="text-sm text-cyan-200/80">Por plan</div>
                  <div className="mt-2 space-y-1">
                    {myStats ? Object.entries(myStats.byPlan).map(([k, v]) => (
                      <div key={k} className="flex justify-between"><span className="text-slate-300">{k.toUpperCase()}</span><span className="text-slate-100">{v}</span></div>
                    )) : <div className="text-slate-300">—</div>}
                  </div>
                </div>
                <div className="rounded-md p-4 bg-slate-900/50 border border-slate-700/40">
                  <div className="text-sm text-cyan-200/80">Últimos referidos</div>
                  <div className="mt-2 space-y-1">
                    {myStats ? myStats.referees.slice(0, 5).map((r) => (
                      <div key={r.email} className="flex justify-between"><span className="text-slate-300">{abbrEmail(r.email)}</span><span className="text-slate-100">{r.plan.toUpperCase()}</span></div>
                    )) : <div className="text-slate-300">—</div>}
                  </div>
                </div>
              </div>
              {myError && <div className="mt-3 text-sm text-red-400">{myError}</div>}
            </div>
          </div>
          <div className="md:col-span-2">
            {loading && <div className="loading-dots" />}
            {!loading && (() => {
              const src = items.length > 0 ? items.slice(0, limit) : generateFakeItems(limit)
              return src.map((it, idx) => renderRankItem(it, idx, src))
            })()}
          </div>
        </div>
        
        {error && <div className="mt-4 text-center text-red-400 text-sm">{error}</div>}
      </div>
    </section>
  )
}