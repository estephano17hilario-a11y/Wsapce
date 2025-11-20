import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isValidEmail, verifyLogin, getUserByEmail } from '@/lib/referralDB'
import { encodeSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { email?: string; password?: string }
  const email = (body.email || '').trim().toLowerCase()
  const password = (body.password || '').trim()
  if (!isValidEmail(email)) return NextResponse.json({ error: 'email_invalid' }, { status: 400 })
  if (!password) return NextResponse.json({ error: 'password_required' }, { status: 400 })
  const user = await verifyLogin(email, password)
  if (!user) {
    const exists = await getUserByEmail(email)
    return NextResponse.json({ error: exists ? 'password_incorrect' : 'user_not_found' }, { status: exists ? 401 : 404 })
  }
  const store = await cookies()
  store.set('wspace_sess', encodeSession(user.id), { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  store.set('wspace_uid', user.id, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  store.set('wspace_email', user.email, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  store.set('wspace_plan', user.plan, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' })
  return NextResponse.json({ ok: true, user }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function GET() { return new NextResponse(null, { status: 405 }) }