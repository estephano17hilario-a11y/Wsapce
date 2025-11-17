import { NextResponse } from 'next/server'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'disabled_in_production' }, { status: 403 })
  }
  return NextResponse.json({ error: 'endpoint_removed' }, { status: 410 })
}

export async function GET() { return new NextResponse(null, { status: 405 }) }