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
      } catch {}
      finally { setChecked(true) }
    })()
  }, [sp])

  return (
    <>
      <p className="mt-3 text-sm md:text-base text-cyan-200/80">{status === 'approved' ? 'Tu compra fue aprobada.' : checked ? 'Verificando tu pago...' : ''}</p>
      <div className="mt-2 text-xs md:text-sm text-cyan-200/80">{upgraded ? 'Tu cuenta fue ascendida a ORO.' : status === 'approved' ? 'Tu cuenta se actualizará en breve.' : ''}</div>
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