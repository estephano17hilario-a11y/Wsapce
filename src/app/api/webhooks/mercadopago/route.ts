import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { getUserById, upgradeUserToOro, appendGoldEvent } from '@/lib/referralDB'
import { kv } from '@vercel/kv'

async function handlePayment(id: string) {
  const env = process.env
  const accessToken = env.MP_ACCESS_TOKEN || env.MERCADOPAGO_ACCESS_TOKEN || env.MERCADO_PAGO_ACCESS_TOKEN || env.MP_TOKEN || env.MERCADOPAGO_TOKEN || env.MERCADO_PAGO_ACCESS_TOKEN_TEST || env.MERCADOPAGO_ACCESS_TOKEN_TEST || env.MERCADO_PAGO_ACCESS_TOKEN_TES || env.MERCADOPAGO_ACCESS_TOKEN_TES
  if (!accessToken) return { ok: false }
  const client = new MercadoPagoConfig({ accessToken })
  const payment = new Payment(client)
  try {
    const info = await payment.get({ id }) as unknown as { status?: string; external_reference?: string; metadata?: { uid?: string } }
    const status: string = info?.status || ''
    const ref: string | undefined = info?.external_reference
    const metaUid: string = (info as unknown as { metadata?: { uid?: string } })?.metadata?.uid || ''
    const payUid: string = (ref && ref !== 'anon') ? ref : (metaUid || '')
    if (status === 'approved' && payUid) {
      const user = await getUserById(payUid)
      let updated = user
      if (user && user.plan !== 'oro') {
        updated = await upgradeUserToOro(payUid)
      }
      if (updated || user) {
        try { await appendGoldEvent(payUid) } catch {}
        try {
          const ev = { email: ((updated || user)?.email || ''), name: ((updated || user)?.name || ''), ts: Date.now() }
          await kv.set('wspace:gold:last_announce', ev)
          await kv.incr('wspace:gold:announce_seq')
          const g = (globalThis as unknown as { __wspaceGold?: { seq: number; last: unknown } })
          const cur = g.__wspaceGold?.seq || 0
          g.__wspaceGold = { seq: cur + 1, last: ev }
        } catch {}
      }
    }
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

export async function POST(req: NextRequest) {
  let id: string | null = null
  try {
    const b = await req.json()
    id = b?.data?.id || b?.id || null
  } catch {}
  if (!id) id = req.nextUrl.searchParams.get('id')
  if (id) {
    await handlePayment(id)
  }
  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (id) {
    await handlePayment(id)
  }
  return NextResponse.json({ ok: true })
}