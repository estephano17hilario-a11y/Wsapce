import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { updateUserName, getUserById } from '@/lib/referralDB'
import { decodeSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const store = await cookies()
  const uid = decodeSession(store.get('wspace_sess')?.value) || store.get('wspace_uid')?.value || ''
  if (!uid) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  const body = await req.json().catch(() => ({})) as { name?: string }
  const name = (body.name || '').trim()
  if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 })
  const user = await getUserById(uid)
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  const updated = await updateUserName(uid, name)
  return NextResponse.json({ ok: true, user: updated })
}

export async function GET() { return new NextResponse(null, { status: 405 }) }