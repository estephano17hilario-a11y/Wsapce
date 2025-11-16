import { NextRequest, NextResponse } from 'next/server'
import { normalizeRefLink, getCodeStatus } from '@/lib/referralDB'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const raw = url.searchParams.get('code') || url.searchParams.get('ref') || ''
  const code = normalizeRefLink(raw)
  if (!code) {
    return new NextResponse(JSON.stringify({ ok: false, status: 'not_found' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' }
    })
  }
  const status = await getCodeStatus(code)
  const payload = { ok: true, status: status.status, expiresAt: status.link?.expiresAt ?? null }
  const etag = '"' + code + ':' + status.status + ':' + (status.link?.expiresAt ?? 0) + '"'
  const inm = req.headers.get('if-none-match')
  if (inm && inm === etag) {
    return new NextResponse(null, { status: 304 })
  }
  return new NextResponse(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
      'ETag': etag
    }
  })
}