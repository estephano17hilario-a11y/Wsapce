import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readDB, getUserById } from '@/lib/referralDB'

export async function GET() {
  try {
    const store = await cookies()
    const uid = store.get('wspace_uid')?.value || ''
    if (!uid) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    const db = await readDB()
    const user = await getUserById(uid)
    const links = db.links.filter(l => l.userId === uid)
    const totalInvites = db.relations.filter(r => r.referrerId === uid).length
    if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
    const rawLink = user.referralLinkText || null
    const code = user.referralCode || (rawLink ? (rawLink.match(/[?#&]ref=([A-Za-z0-9_-]{8,})/i)?.[1] || null) : null)
    const status = links.length > 0 ? (links.slice().sort((a, b) => b.createdAt - a.createdAt)[0].lastStatus ?? 'valid') : (code ? 'valid' : 'not_found')
    const expiresAt = links.length > 0 ? links.slice().sort((a, b) => b.createdAt - a.createdAt)[0].expiresAt : null
    const payload = { ok: true, status, code, rawLink, expiresAt, lastStatus: status !== 'not_found' ? status : null, lastStatusAt: null, totalInvites }
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'private, max-age=10' } })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}