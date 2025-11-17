import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readDB, getUserById } from '@/lib/referralDB'

export async function GET() {
  try {
    const store = await cookies()
    const uid = store.get('wspace_uid')?.value || ''
    const cookieRawLink = store.get('wspace_ref_link')?.value || ''
    const cookieCode = store.get('wspace_ref_code')?.value || ''
    if (!uid) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    const db = await readDB()
    const user = await getUserById(uid)
    const links = db.links.filter(l => l.userId === uid)
    const totalInvites = (user?.referralTotal ?? db.relations.filter(r => r.referrerId === uid).length)
    if (!user) {
      if (cookieRawLink || cookieCode) {
        const code = cookieCode || (cookieRawLink.match(/[?#&]ref=([A-Za-z0-9_-]{8,})/i)?.[1] || '')
        return NextResponse.json({ ok: true, status: code ? 'valid' : 'not_found', rawLink: cookieRawLink || null, code: code || null, expiresAt: null, totalInvites })
      }
      return NextResponse.json({ ok: true, status: 'not_found', totalInvites })
    }
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