import { NextRequest, NextResponse } from 'next/server'
import { getRecentGoldEvents } from '@/lib/referralDB'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limitParam = url.searchParams.get('limit')
  const sinceParam = url.searchParams.get('since')
  const limit = limitParam ? Math.max(1, Math.min(50, parseInt(limitParam))) : 10
  const since = sinceParam ? parseInt(sinceParam) : undefined
  const events = await getRecentGoldEvents(limit, Number.isFinite(since as number) ? since : undefined)
  return new NextResponse(JSON.stringify({ ok: true, events }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30'
    }
  })
}

export async function POST() { return new NextResponse(null, { status: 405 }) }