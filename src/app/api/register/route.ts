import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createUser, getUserByEmail } from '@/lib/referralDB'
import { encodeSession } from '@/lib/auth'

function validEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { email?: string }
  const email = (body.email || '').trim().toLowerCase()
  if (!validEmail(email)) return NextResponse.json({ error: 'email_invalid' }, { status: 400 })

  const existing = await getUserByEmail(email)
  if (existing) return NextResponse.json({ error: 'user_exists' }, { status: 409 })
  const user = await createUser(email)
  const store = await cookies()
  store.set('wspace_sess', encodeSession(user.id), { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  store.set('wspace_uid', user.id, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  store.set('wspace_email', user.email, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  store.set('wspace_plan', user.plan, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  return NextResponse.json({ ok: true, user }, { headers: { 'Cache-Control': 'private, no-store' } })
}