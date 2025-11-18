"use client"
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function VerifyPayment() {
  const sp = useSearchParams()
  const [status, setStatus] = useState<string | null>(null)
  const [upgraded, setUpgraded] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const id = sp.get('payment_id') || sp.get('collection_id') || sp.get('id')
    if (!id) { setChecked(true); setStatus(null); return }
    ;(async () => {
      try {
        const r = await fetch(`/api/payments/confirm?id=${encodeURIComponent(id)}`)
        const d = await r.json()
        setStatus(typeof d.status === 'string' ? d.status : null)
        setUpgraded(!!d.upgraded)
        if (d?.status === 'approved') {
          try {
            const ur = await fetch('/api/user', { cache: 'no-store' })
            const ud = await ur.json()
            try { localStorage.setItem('wspace_auth', JSON.stringify(ud.user)) } catch {}
            try { localStorage.setItem('wspace_email', ud.user?.email || '') } catch {}
            try { window.dispatchEvent(new CustomEvent('user_session_changed')) } catch {}
            const nm = (ud?.user?.name && ud.user.name.trim()) ? ud.user.name.trim() : (ud?.user?.email || '')
            window.setTimeout(async () => {
              try { window.dispatchEvent(new CustomEvent('gold_purchased', { detail: { email: ud?.user?.email, name: nm } })) } catch {}
              try { await fetch('/api/gold/announce', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nm }) }) } catch {}
            }, 1000)
          } catch {}
        }
      } catch {}
      finally { setChecked(true) }
    })()
  }, [sp])

  return (
    <>
      <p className="mt-3 text-sm md:text-base text-cyan-200/80">{status === 'approved' ? 'Tu compra fue aprobada.' : checked ? 'Verificando tu pago...' : ''}</p>
      <div className="mt-2 text-xs md:text-sm text-cyan-200/80">{upgraded ? 'Tu cuenta fue ascendida a ORO.' : status === 'approved' ? 'Tu cuenta se actualizará en breve.' : ''}</div>
      {(status === 'approved' || upgraded) && (
        <div className="mt-6 text-center">
          <div className="text-2xl md:text-4xl font-black tracking-tight wspace-cosmic-title">Ahora formas parte de la elite</div>
          <div className="mt-2 text-base md:text-lg text-cyan-200/85">Siéntete orgulloso</div>
        </div>
      )}
    </>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">¡BIENVENIDO A LA ÉLITE!</h1>
        <Suspense fallback={<p className="mt-3 text-sm md:text-base text-cyan-200/80">Verificando tu pago…</p>}>
          <VerifyPayment />
        </Suspense>
      </div>
    </main>
  )
}