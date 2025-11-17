import { NextResponse } from 'next/server'
import { encodeSession, decodeSession } from '@/lib/auth'
import { normalizeRefLink, createUser, generateLinkForUser, validateCode, getCodeStatus, readDB, writeDB, recordRelation, getTopRankings, seedDemoData } from '@/lib/referralDB'
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

    const code = 'ABCD1234'
    results.normalize_code_ok = normalizeRefLink(code) === code
    results.normalize_url_ok = normalizeRefLink(`https://wspace.live/?ref=${code}`) === code

    const u = await createUser(`selftest.${Date.now()}@demo.local`)
    const link = await generateLinkForUser(u.id)
    const valid = await validateCode(link.code)
    results.link_validates = !!valid && valid.userId === u.id
    const ttlMs = link.expiresAt - link.createdAt
    results.ttl_min_24h = ttlMs >= 24 * 60 * 60 * 1000

    const status1 = await getCodeStatus(link.code)
    results.code_status_valid = status1.status === 'valid'

    const db1 = await readDB()
    const idx = db1.links.findIndex(x => x.code === link.code)
    let restored: { expiresAt: number; active: boolean } | null = null
    if (idx >= 0) {
      restored = { expiresAt: db1.links[idx].expiresAt, active: db1.links[idx].active }
      db1.links[idx].expiresAt = Date.now() - 1000
      await writeDB(db1)
      const status2 = await getCodeStatus(link.code)
      results.code_status_expired = status2.status === 'expired'
      const db2 = await readDB()
      const idx2 = db2.links.findIndex(x => x.code === link.code)
      if (idx2 >= 0) {
        db2.links[idx2].expiresAt = restored.expiresAt
        db2.links[idx2].active = false
        await writeDB(db2)
        const status3 = await getCodeStatus(link.code)
        results.code_status_inactive = status3.status === 'inactive'
        const db3 = await readDB()
        const idx3 = db3.links.findIndex(x => x.code === link.code)
        if (idx3 >= 0) {
          db3.links[idx3].active = restored.active
          await writeDB(db3)
        }
      }
    }

    const rEmail = `selftest.referee.${Date.now()}@demo.local`
    const referee = await createUser(rEmail)
    const relation = await recordRelation(link.code, referee.email)
    results.relation_recorded = !!relation && relation.refereeId === referee.id

    const startSeed = Date.now()
    await seedDemoData(50, 5)
    const seedElapsed = Date.now() - startSeed
    metrics.seed_ms = seedElapsed
    const startTop = Date.now()
    await getTopRankings(50)
    metrics.top_ms = Date.now() - startTop

    results.plan_map_gold = planClassFor('oro') === 'profile-oro'
    results.plan_map_bronce = planClassFor('bronce') === 'profile-bronce'
  } catch {}
  const ok = Object.values(results).every(Boolean)
  return new NextResponse(JSON.stringify({ ok, results, metrics }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' }
  })
}

export async function POST() { return new NextResponse(null, { status: 405 }) }