import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserById, generateLinkForUser } from '@/lib/referralDB'

export async function POST(req: NextRequest) {
  const store = await cookies()
  const uid = store.get('wspace_uid')?.value || ''
  if (!uid) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  const user = await getUserById(uid)
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  if (user.plan !== 'plata') return NextResponse.json({ error: 'must_be_plata' }, { status: 403 })
  const link = await generateLinkForUser(uid)
  const origin = req.nextUrl.origin
  const share = `${origin}/?ref=${link.code}`
  return NextResponse.json({ ok: true, link: share, code: link.code, expiresAt: link.expiresAt })
}