import { NextRequest, NextResponse } from 'next/server'
import { seedDemoData } from '@/lib/referralDB'

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'disabled_in_production' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({})) as { users?: number; minZeros?: number }
  const users = typeof body.users === 'number' ? body.users : 25
  const minZeros = typeof body.minZeros === 'number' ? body.minZeros : 3
  const r = await seedDemoData(users, minZeros)
  return NextResponse.json({ ok: true, result: r })
}