import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserById, readDB, writeDB } from '@/lib/referralDB'
import { decodeSession, encodeSession } from '@/lib/auth'

export async function GET() {
  const store = await cookies()
  const uid = decodeSession(store.get('wspace_sess')?.value) || ''
  let user = uid ? await getUserById(uid) : null
  let newUid: string | null = null
  if (!user) {
    try {
      const email = store.get('wspace_email')?.value || ''
      const plan = (store.get('wspace_plan')?.value || 'bronce') as 'bronce' | 'plata' | 'oro'
      const refCode = store.get('wspace_ref_code')?.value || ''
      const refLink = store.get('wspace_ref_link')?.value || ''
      if (email) {
        const u = await getUserById(uid)
        if (!u) {
          const { createUser, upgradeUserToPlata } = await import('@/lib/referralDB')
          const created = await createUser(email)
          if (plan === 'plata') await upgradeUserToPlata(created.id)
          try {
            const db = await readDB()
            const ux = db.users.find(x => x.id === created.id)
            if (ux) { if (refCode) ux.referralCode = refCode; if (refLink) ux.referralLinkText = refLink; await writeDB(db) }
          } catch {}
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