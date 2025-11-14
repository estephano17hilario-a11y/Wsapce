import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { getUserById, upgradeUserToOro } from '@/lib/referralDB'

async function handlePayment(id: string) {
  const accessToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) return { ok: false }
  const client = new MercadoPagoConfig({ accessToken })
  const payment = new Payment(client)
  try {
    const info = await payment.get({ id }) as unknown as { status?: string; external_reference?: string }
    const status: string = info?.status || ''
    const ref: string | undefined = info?.external_reference
    if (status === 'approved' && ref) {
      const user = await getUserById(ref)
      if (user && user.plan !== 'oro') {
        await upgradeUserToOro(ref)
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