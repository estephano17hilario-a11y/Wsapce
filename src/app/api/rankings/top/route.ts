import { NextRequest, NextResponse } from 'next/server'
import { getTopRankings } from '@/lib/referralDB'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limitParam = url.searchParams.get('limit')
  const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam))) : 10
  const top = await getTopRankings(limit)
  return new NextResponse(JSON.stringify({ ok: true, top }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
    }
  })
}