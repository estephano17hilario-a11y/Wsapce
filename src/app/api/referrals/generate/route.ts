import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserById, generateLinkForUser, createUser, upgradeUserToPlata, readDB, writeDB } from '@/lib/referralDB'
import { decodeSession, encodeSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const store = await cookies()
  const uid = decodeSession(store.get('wspace_sess')?.value) || store.get('wspace_uid')?.value || ''
  if (!uid) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  let user = await getUserById(uid)
  let newUid: string | null = null
  if (!user) {
    try {
      const email = store.get('wspace_email')?.value || ''
      const plan = (store.get('wspace_plan')?.value || 'bronce') as 'bronce' | 'plata' | 'oro'
      if (email) {
        const created = await createUser(email)
        if (plan === 'plata') await upgradeUserToPlata(created.id)
        user = await getUserById(created.id) || created
        newUid = created.id
      }
    } catch {}
  }
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  if (user.plan !== 'plata') return NextResponse.json({ error: 'must_be_plata' }, { status: 403 })
  const link = await generateLinkForUser(uid)
  const origin = req.nextUrl.origin
  const share = `${origin}/?ref=${link.code}`
  try {
    const db = await readDB()
    const u = db.users.find(x => x.id === user!.id)
    if (u) { u.referralCode = link.code; u.referralLinkText = share; await writeDB(db) }
  } catch {}
  const res = NextResponse.json({ ok: true, link: share, code: link.code, expiresAt: link.expiresAt })
  if (newUid) {
    try {
      res.cookies.set('wspace_sess', encodeSession(newUid), { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
      res.cookies.set('wspace_uid', newUid, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
      res.cookies.set('wspace_ref_code', link.code, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
      res.cookies.set('wspace_ref_link', share, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
    } catch {}
  }
  return res
}