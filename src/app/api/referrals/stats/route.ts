import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getStatsForUser, getUserById, readDB, writeDB } from '@/lib/referralDB'
import { decodeSession, encodeSession } from '@/lib/auth'
import { createUser, upgradeUserToPlata } from '@/lib/referralDB'

export async function GET() {
  const store = await cookies()
  const uid = decodeSession(store.get('wspace_sess')?.value) || store.get('wspace_uid')?.value || ''
  let user = uid ? await getUserById(uid) : null
  let newUid: string | null = null
  if (!user) {
    try {
      const email = store.get('wspace_email')?.value || ''
      const plan = (store.get('wspace_plan')?.value || 'bronce') as 'bronce' | 'plata' | 'oro'
      const refCode = store.get('wspace_ref_code')?.value || ''
      const refLink = store.get('wspace_ref_link')?.value || ''
      if (email) {
        const created = await createUser(email)
        if (plan === 'plata') await upgradeUserToPlata(created.id)
        const db = await readDB()
        const ux = db.users.find(x => x.id === created.id)
        if (ux) { if (refCode) ux.referralCode = refCode; if (refLink) ux.referralLinkText = refLink; await writeDB(db) }
        user = await getUserById(created.id)
        newUid = created.id
      }
    } catch {}
  }
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  const stats = await getStatsForUser(user.id)
  const updatedAt = Date.now()
  const etag = '"' + user.id + ':' + (stats.totalInvites || 0) + ':' + updatedAt + '"'
  const res = new NextResponse(JSON.stringify({ ok: true, stats, user: { id: user.id, email: user.email, plan: user.plan }, updatedAt }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
      'ETag': etag
    }
  })
  try {
    if (newUid) {
      res.cookies.set('wspace_sess', encodeSession(newUid), { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
      res.cookies.set('wspace_uid', newUid, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
    }
    res.cookies.set('wspace_stats_etag', etag, { httpOnly: false, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  } catch {}
  return res
}