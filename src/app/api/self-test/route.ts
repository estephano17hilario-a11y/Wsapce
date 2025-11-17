import { NextResponse } from 'next/server'
import { encodeSession, decodeSession } from '@/lib/auth'
import { createUser } from '@/lib/referralDB'
import { planClassFor } from '@/components/ProfileCircle'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(JSON.stringify({ ok: false, error: 'disabled_in_production' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
  }
  const results: Record<string, boolean> = {}
  const metrics: Record<string, number> = {}
  try {
    const uid = 'selftest_' + Math.random().toString(36).slice(2, 8)
    const token = encodeSession(uid)
    results.auth_ok = decodeSession(token) === uid
    results.auth_tamper_rejected = decodeSession(token + 'x') === null

    const u = await createUser(`selftest.${Date.now()}@demo.local`)
    results.user_created = !!u && !!u.id

    results.plan_map_gold = planClassFor('oro') === 'profile-oro'
    results.plan_map_bronce = planClassFor('bronce') === 'profile-bronce'
  } catch {}
  const ok = Object.values(results).every(Boolean)
  return new NextResponse(JSON.stringify({ ok, results, metrics }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' }
  })
}

export async function POST() { return new NextResponse(null, { status: 405 }) }