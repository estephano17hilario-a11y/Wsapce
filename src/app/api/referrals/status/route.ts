import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readDB } from '@/lib/referralDB'

export async function GET() {
  try {
    const store = await cookies()
    const uid = store.get('wspace_uid')?.value || ''
    if (!uid) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    const db = await readDB()
    const links = db.links.filter(l => l.userId === uid)
    if (links.length === 0) {
      return NextResponse.json({ ok: true, status: 'not_found' })
    }
    const latest = links.slice().sort((a, b) => b.createdAt - a.createdAt)[0]
    const status = latest.lastStatus ?? 'valid'
    const payload = { ok: true, status, code: latest.code, expiresAt: latest.expiresAt, lastStatus: latest.lastStatus ?? null, lastStatusAt: latest.lastStatusAt ?? null }
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'private, max-age=10' } })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}