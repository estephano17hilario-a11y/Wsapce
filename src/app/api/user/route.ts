import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/referralDB'

export async function GET() {
  const store = await cookies()
  const uid = store.get('wspace_uid')?.value || ''
  const user = uid ? await getUserById(uid) : null
  return NextResponse.json({ user })
}