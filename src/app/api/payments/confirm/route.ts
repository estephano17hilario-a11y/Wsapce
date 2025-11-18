import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { decodeSession } from '@/lib/auth'
import { getUserById, upgradeUserToOro, appendGoldEvent } from '@/lib/referralDB'
import { kv } from '@vercel/kv'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || req.nextUrl.searchParams.get('payment_id') || req.nextUrl.searchParams.get('collection_id')
  const env = process.env
  const accessToken = env.MP_ACCESS_TOKEN || env.MERCADOPAGO_ACCESS_TOKEN || env.MERCADO_PAGO_ACCESS_TOKEN || env.MP_TOKEN || env.MERCADOPAGO_TOKEN || env.MERCADO_PAGO_ACCESS_TOKEN_TEST || env.MERCADOPAGO_ACCESS_TOKEN_TEST || env.MERCADO_PAGO_ACCESS_TOKEN_TES || env.MERCADOPAGO_ACCESS_TOKEN_TES
  if (!accessToken) return new NextResponse(JSON.stringify({ error: 'missing_access_token' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  if (!id) return new NextResponse(JSON.stringify({ error: 'missing_id' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

  const store = await cookies()
  const uid = decodeSession(store.get('wspace_sess')?.value) || store.get('wspace_uid')?.value || ''

  const client = new MercadoPagoConfig({ accessToken })
  const payment = new Payment(client)
  try {
    const info = await payment.get({ id }) as unknown as { status?: string; external_reference?: string; metadata?: { uid?: string } }
    const status = info?.status || null
    const ref = info?.external_reference || null
    const metaUid = (info as unknown as { metadata?: { uid?: string } })?.metadata?.uid || null
    let upgraded = false
    const payUid = (ref && ref !== 'anon') ? ref : (metaUid || null)
    if (status === 'approved' && payUid) {
      const user = await getUserById(payUid)
      let updated = user
      if (user && user.plan !== 'oro') {
        updated = await upgradeUserToOro(payUid)
        upgraded = true
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
    const res = new NextResponse(JSON.stringify({ status, upgraded }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' } })
    if (status === 'approved') {
      try { res.cookies.set('wspace_plan', 'oro', { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' }) } catch {}
    }
    return res
  } catch {
    return new NextResponse(JSON.stringify({ error: 'payment_lookup_failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function POST() { return new NextResponse(null, { status: 405 }) }