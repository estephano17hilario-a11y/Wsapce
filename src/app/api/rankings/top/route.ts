import { NextRequest, NextResponse } from 'next/server'
import { getTopRankings } from '@/lib/referralDB'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limitParam = url.searchParams.get('limit')
  const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam))) : 10
  const top = await getTopRankings(limit)
  const etag = '"' + 'limit:' + limit + ':' + top.map(x => ((x.user?.email || '') + ':' + x.count)).join('|') + '"'
  const inm = req.headers.get('if-none-match')
  if (inm && inm === etag) {
    return new NextResponse(null, { status: 304, headers: { 'ETag': etag, 'Cache-Control': 'private, no-store' } })
  }
  return new NextResponse(JSON.stringify({ ok: true, top }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store',
      'ETag': etag
    }
  })
}