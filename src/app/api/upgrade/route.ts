import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserById, upgradeUserToPlata } from '@/lib/referralDB'
import { decodeSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const store = await cookies()
  const uid = decodeSession(store.get('wspace_sess')?.value) || store.get('wspace_uid')?.value || ''
  if (!uid) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  const user = await getUserById(uid)
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  let plan: 'plata' | 'oro' = 'plata'
  try {
    const body = await req.json()
    if (body && (body.plan === 'oro' || body.plan === 'plata')) plan = body.plan
  } catch {}
  if (plan === 'plata') {
    if (user.plan !== 'bronce') return NextResponse.json({ error: 'must_be_bronce' }, { status: 400 })
    const updated = await upgradeUserToPlata(uid)
    const res = NextResponse.json({ ok: true, user: updated })
    try {
      res.cookies.set('wspace_plan', updated?.plan || 'plata', { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
    } catch {}
    return res
  }
  if (plan === 'oro') {
    return NextResponse.json({ error: 'must_use_payment' }, { status: 403 })
  }
  return NextResponse.json({ error: 'plan_invalid' }, { status: 400 })
}