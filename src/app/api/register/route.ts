import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, isValidEmail, getUserById } from '@/lib/referralDB'
import { encodeSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string } = {}
  try { body = await req.json() } catch {}
  const email = (body.email || '').trim().toLowerCase()
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'email_invalid' }, { status: 400 })
  }
  const existing = await getUserByEmail(email)
  if (existing) {
    const res = NextResponse.json({ error: 'user_exists' }, { status: 409 })
    try {
      res.cookies.set('wspace_email', email, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
      res.cookies.set('wspace_plan', existing.plan || 'bronce', { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
      res.cookies.set('wspace_sess', encodeSession(existing.id), { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
      res.cookies.set('wspace_uid', existing.id, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
    } catch {}
    return res
  }
  const created = await createUser(email)
  const user = await getUserById(created.id)
  const res = NextResponse.json({ ok: true, user })
  try {
    res.cookies.set('wspace_email', email, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
    res.cookies.set('wspace_plan', (user?.plan || 'bronce'), { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
    res.cookies.set('wspace_sess', encodeSession(created.id), { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
    res.cookies.set('wspace_uid', created.id, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  } catch {}
  return res
}

export async function GET() { return new NextResponse(null, { status: 405 }) }