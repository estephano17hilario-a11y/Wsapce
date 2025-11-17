import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createUser, getUserByEmail, normalizeRefLink, readDB, recordRelation, getCodeStatus } from '@/lib/referralDB'
import { encodeSession } from '@/lib/auth'

function validEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { email?: string; referralLink?: string }
  const email = (body.email || '').trim().toLowerCase()
  const referralLink = body.referralLink || ''
  if (!validEmail(email)) return NextResponse.json({ error: 'email_invalid' }, { status: 400 })

  const existing = await getUserByEmail(email)
  if (existing) return NextResponse.json({ error: 'user_exists' }, { status: 409 })

  let code = normalizeRefLink(referralLink)
  if (code) {
    const status = await getCodeStatus(code)
    if (status.status === 'not_found') {
      code = null
    } else {
      const link = status.link!
      const db = await readDB()
      const referrer = db.users.find(u => u.id === link.userId)
      if (referrer && referrer.email.toLowerCase() === email) {
        code = null
      } else {
        const currentCount = db.relations.filter(r => r.referrerId === link.userId).length
        if (currentCount >= db.config.inviteLimit) code = null
      }
    }
  }

  const user = await createUser(email, code || undefined)
  if (code) {
    await recordRelation(code, email)
  }
  const store = await cookies()
  store.set('wspace_sess', encodeSession(user.id), { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  store.set('wspace_uid', user.id, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  store.set('wspace_email', user.email, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  store.set('wspace_plan', user.plan, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  return NextResponse.json({ ok: true, user }, { headers: { 'Cache-Control': 'private, no-store' } })
}