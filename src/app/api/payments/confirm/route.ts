import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { decodeSession } from '@/lib/auth'
import { getUserById, upgradeUserToOro } from '@/lib/referralDB'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || req.nextUrl.searchParams.get('payment_id') || req.nextUrl.searchParams.get('collection_id')
  const env = process.env
  const accessToken = env.MP_ACCESS_TOKEN || env.MERCADOPAGO_ACCESS_TOKEN || env.MERCADO_PAGO_ACCESS_TOKEN || env.MP_TOKEN || env.MERCADOPAGO_TOKEN || env.MERCADO_PAGO_ACCESS_TOKEN_TEST || env.MERCADOPAGO_ACCESS_TOKEN_TEST
  if (!accessToken) return new NextResponse(JSON.stringify({ error: 'missing_access_token' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  if (!id) return new NextResponse(JSON.stringify({ error: 'missing_id' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

  const store = await cookies()
  const uid = decodeSession(store.get('wspace_sess')?.value) || store.get('wspace_uid')?.value || ''

  const client = new MercadoPagoConfig({ accessToken })
  const payment = new Payment(client)
  try {
    const info = await payment.get({ id }) as unknown as { status?: string; external_reference?: string }
    const status = info?.status || null
    const ref = info?.external_reference || null
    let upgraded = false
    if (status === 'approved' && ref && uid && ref === uid) {
      const user = await getUserById(uid)
      if (user && user.plan !== 'oro') {
        await upgradeUserToOro(uid)
        upgraded = true
      }
    }
    return new NextResponse(JSON.stringify({ status, upgraded }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' } })
  } catch {
    return new NextResponse(JSON.stringify({ error: 'payment_lookup_failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function POST() { return new NextResponse(null, { status: 405 }) }