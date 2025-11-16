import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { decodeSession } from '@/lib/auth'
import { getUserById } from '@/lib/referralDB'

export async function POST(req: NextRequest) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!accessToken) return NextResponse.json({ error: 'missing_access_token' }, { status: 500 })
  const title = 'PACK FUNDADOR (WSPACE.LIVE)'
  const binaryMode = process.env.MP_BINARY_MODE ? process.env.MP_BINARY_MODE === 'true' : true
  const descriptor = process.env.MP_STATEMENT_DESCRIPTOR || 'WSPACE'
  const client = new MercadoPagoConfig({ accessToken })
  const preference = new Preference(client)
  const store = await cookies()
  const uid = decodeSession(store.get('wspace_sess')?.value) || store.get('wspace_uid')?.value || ''
  const user = uid ? await getUserById(uid) : null
  const origin = req.nextUrl.origin
  try {
    const result = await preference.create({
      body: {
        items: [{ id: 'wspace_gold_pack', title, unit_price: 1.0, quantity: 1, currency_id: 'USD' }],
        back_urls: {
          success: `${origin}?status=approved#pricing`,
          failure: `${origin}?status=failure#pricing`,
          pending: `${origin}?status=pending#pricing`
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
    const initPoint = (result as unknown as { init_point?: string; sandbox_init_point?: string }).init_point || (result as unknown as { init_point?: string; sandbox_init_point?: string }).sandbox_init_point || null
    return new NextResponse(JSON.stringify({ preferenceId: result.id, initPoint }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' } })
  } catch {
    return new NextResponse(JSON.stringify({ error: 'preference_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function GET() { return new NextResponse(null, { status: 405 }) }