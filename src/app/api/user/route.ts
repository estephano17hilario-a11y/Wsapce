import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/referralDB'
import { decodeSession, encodeSession } from '@/lib/auth'

export async function GET() {
  const store = await cookies()
  const uid = decodeSession(store.get('wspace_sess')?.value) || store.get('wspace_uid')?.value || ''
  let user = uid ? await getUserById(uid) : null
  let newUid: string | null = null
  if (!user) {
    try {
      const email = store.get('wspace_email')?.value || ''
      const plan = (store.get('wspace_plan')?.value || 'bronce') as 'bronce' | 'plata' | 'oro'
      if (email) {
        const u = await getUserById(uid)
        if (!u) {
          const { createUser, upgradeUserToPlata } = await import('@/lib/referralDB')
          const created = await createUser(email)
          if (plan === 'plata') await upgradeUserToPlata(created.id)
          user = await getUserById(created.id)
          newUid = created.id
        }
      }
    } catch {}
  }
  const res = new NextResponse(JSON.stringify({ user }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store'
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