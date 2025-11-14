import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { decodeSession } from '@/lib/auth'
import { getUserById } from '@/lib/referralDB'

export async function POST(req: NextRequest) {
  const env = process.env
  const accessToken = env.MP_ACCESS_TOKEN || env.MERCADOPAGO_ACCESS_TOKEN || env.MERCADO_PAGO_ACCESS_TOKEN || env.MP_TOKEN || env.MERCADOPAGO_TOKEN
  if (!accessToken) return NextResponse.json({ error: 'missing_access_token' }, { status: 500 })
  const origin = req.nextUrl.origin
  const currency = process.env.MP_CURRENCY || 'PEN'
  const title = 'PACK FUNDADOR (WSPACE.LIVE)'
  const binaryMode = process.env.MP_BINARY_MODE ? process.env.MP_BINARY_MODE === 'true' : true
  const descriptor = process.env.MP_STATEMENT_DESCRIPTOR || 'WSPACE'
  const client = new MercadoPagoConfig({ accessToken })
  const preference = new Preference(client)
  const store = await cookies()
  const uid = decodeSession(store.get('wspace_sess')?.value) || store.get('wspace_uid')?.value || ''
  const user = uid ? await getUserById(uid) : null
  try {
    const result = await preference.create({
      body: {
        items: [{ id: 'wspace_gold_pack', title, unit_price: 4.99, quantity: 1, currency_id: currency }],
        back_urls: {
          success: `${origin}/success`,
          failure: `${origin}/failure`,
          pending: `${origin}/pending`
        },
        notification_url: `${origin}/api/webhooks/mercadopago`,
        external_reference: uid || 'anon',
        metadata: uid ? { uid } : {},
        payer: user?.email ? { email: user.email } : undefined,
        binary_mode: binaryMode,
        statement_descriptor: descriptor,
        auto_return: 'approved'
      }
    })
    return new NextResponse(JSON.stringify({ id: result.id }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' } })
  } catch {
    return new NextResponse(JSON.stringify({ error: 'preference_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function GET() { return new NextResponse(null, { status: 405 }) }