import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/referralDB'
import { decodeSession, encodeSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const store = await cookies()
  const uid = decodeSession(store.get('wspace_sess')?.value) || ''
  let user = uid ? await getUserById(uid) : null
  let newUid: string | null = null
  if (!user) {
    try {
      const email = store.get('wspace_email')?.value || ''
      const plan = (store.get('wspace_plan')?.value || 'bronce') as 'bronce' | 'plata' | 'oro'
      if (email) {
        const { createUser, upgradeUserToPlata, upgradeUserToOro, getUserByEmail } = await import('@/lib/referralDB')
        const existing = await getUserByEmail(email)
        if (existing) {
          user = existing
          if (plan === 'plata' && user.plan === 'bronce') user = (await upgradeUserToPlata(user.id)) || user
          if (plan === 'oro' && user.plan !== 'oro') user = (await upgradeUserToOro(user.id)) || user
          newUid = user.id
        } else {
          const created = await createUser(email)
          if (plan === 'plata') await upgradeUserToPlata(created.id)
          if (plan === 'oro') await upgradeUserToOro(created.id)
          user = await getUserById(created.id)
          newUid = created.id
        }
      }
    } catch {}
  }
  const etag = '"' + (user ? (user.id + ':' + user.plan + ':' + (user.email || '')) : 'guest') + '"'
  const inm = req.headers.get('if-none-match')
  const res304 = inm && inm === etag ? new NextResponse(null, { status: 304, headers: { 'ETag': etag, 'Cache-Control': 'private, no-store' } }) : null
  if (res304) return res304
  const res = new NextResponse(JSON.stringify({ user }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store',
      'ETag': etag
    }
  })
  if (newUid) {
    try {
      res.cookies.set('wspace_sess', encodeSession(newUid), { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
      res.cookies.set('wspace_uid', newUid, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
    } catch {}
  }
  return res
}
export const dynamic = 'force-dynamic'