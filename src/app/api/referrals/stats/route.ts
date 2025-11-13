import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getStatsForUser, getUserById } from '@/lib/referralDB'
import { decodeSession } from '@/lib/auth'

export async function GET() {
  const store = await cookies()
  const uid = decodeSession(store.get('wspace_sess')?.value) || store.get('wspace_uid')?.value || ''
  if (!uid) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  const user = await getUserById(uid)
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  const stats = await getStatsForUser(uid)
  return NextResponse.json({ ok: true, stats })
}