import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeSession } from '@/lib/auth'
import { getUserById } from '@/lib/referralDB'
import { kv } from '@vercel/kv'

export async function POST(req: NextRequest) {
  const store = await cookies()
  const uid = decodeSession(store.get('wspace_sess')?.value) || store.get('wspace_uid')?.value || ''
  if (!uid) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  const user = await getUserById(uid)
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  if (user.plan !== 'oro') return NextResponse.json({ error: 'must_be_gold' }, { status: 403 })
  let body: { name?: string } = {}
  try { body = await req.json() } catch {}
  const name = (body?.name || user.name || '').trim()
  const ev = { email: user.email, name, ts: Date.now() }
  try {
    await kv.set('wspace:gold:last_announce', ev)
    await kv.incr('wspace:gold:announce_seq')
  } catch {}
  try {
    const g = (globalThis as unknown as { __wspaceGold?: { seq: number; last: unknown } })
    const cur = g.__wspaceGold?.seq || 0
    g.__wspaceGold = { seq: cur + 1, last: ev }
  } catch {}
  return NextResponse.json({ ok: true })
}