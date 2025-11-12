import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserById, upgradeUserToPlata } from '@/lib/referralDB'

export async function POST(req: NextRequest) {
  const store = await cookies()
  const uid = store.get('wspace_uid')?.value || ''
  if (!uid) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  const user = await getUserById(uid)
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  if (user.plan !== 'bronce') return NextResponse.json({ error: 'must_be_bronce' }, { status: 400 })
  const updated = await upgradeUserToPlata(uid)
  return NextResponse.json({ ok: true, user: updated })
}