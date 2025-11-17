import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readDB, getUserById } from '@/lib/referralDB'
import { decodeSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const store = await cookies()
    const uid = decodeSession(store.get('wspace_sess')?.value) || ''
    const cookieRawLink = store.get('wspace_ref_link')?.value || ''
    const cookieCode = store.get('wspace_ref_code')?.value || ''
    if (!uid) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    const db = await readDB()
    const user = await getUserById(uid)
    const links = db.links.filter(l => l.userId === uid)
    const cookieTotal = parseInt(store.get('wspace_ref_total')?.value || '0') || 0
    const totalRel = db.relations.filter(r => r.referrerId === uid).length
    const totalInvites = user?.referralTotal ?? (totalRel || cookieTotal)
    if (!user) {
      if (cookieRawLink || cookieCode) {
        const code = cookieCode || (cookieRawLink.match(/[?#&]ref=([A-Za-z0-9_-]{8,})/i)?.[1] || '')
        const etag = '"' + uid + ':' + (code || '') + ':' + (cookieRawLink || '') + ':' + totalInvites + '"'
        const inm = req.headers.get('if-none-match')
        if (inm && inm === etag) return new NextResponse(null, { status: 304, headers: { 'ETag': etag, 'Cache-Control': 'private, max-age=10, stale-while-revalidate=60' } })
        const res = NextResponse.json({ ok: true, status: code ? 'valid' : 'not_found', rawLink: cookieRawLink || null, code: code || null, expiresAt: null, totalInvites }, { headers: { 'Cache-Control': 'private, max-age=10, stale-while-revalidate=60', 'ETag': etag } })
        try { res.cookies.set('wspace_ref_total', String(totalInvites), { httpOnly: false, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' }) } catch {}
        return res
      }
      const etag = '"' + uid + ':::' + totalInvites + '"'
      const inm = req.headers.get('if-none-match')
      if (inm && inm === etag) return new NextResponse(null, { status: 304, headers: { 'ETag': etag, 'Cache-Control': 'private, max-age=10, stale-while-revalidate=60' } })
      const res = NextResponse.json({ ok: true, status: 'not_found', totalInvites }, { headers: { 'Cache-Control': 'private, max-age=10, stale-while-revalidate=60', 'ETag': etag } })
      try { res.cookies.set('wspace_ref_total', String(totalInvites), { httpOnly: false, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' }) } catch {}
      return res
    }
    const rawLink = user.referralLinkText || null
    const code = user.referralCode || (rawLink ? (rawLink.match(/[?#&]ref=([A-Za-z0-9_-]{8,})/i)?.[1] || null) : null)
    const status = links.length > 0 ? (links.slice().sort((a, b) => b.createdAt - a.createdAt)[0].lastStatus ?? 'valid') : (code ? 'valid' : 'not_found')
    const expiresAt = links.length > 0 ? links.slice().sort((a, b) => b.createdAt - a.createdAt)[0].expiresAt : null
    const etag = '"' + uid + ':' + (code || '') + ':' + (rawLink || '') + ':' + totalInvites + '"'
    const inm = req.headers.get('if-none-match')
    if (inm && inm === etag) return new NextResponse(null, { status: 304, headers: { 'ETag': etag, 'Cache-Control': 'private, max-age=10, stale-while-revalidate=60' } })
    const payload = { ok: true, status, code, rawLink, expiresAt, lastStatus: status !== 'not_found' ? status : null, lastStatusAt: null, totalInvites }
    const res = NextResponse.json(payload, { headers: { 'Cache-Control': 'private, max-age=10, stale-while-revalidate=60', 'ETag': etag } })
    try { res.cookies.set('wspace_ref_total', String(totalInvites), { httpOnly: false, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' }) } catch {}
    return res
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}