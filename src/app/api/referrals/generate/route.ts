import { NextResponse } from 'next/server'

export async function GET() { return new NextResponse(null, { status: 405 }) }
export async function POST() { return new NextResponse(JSON.stringify({ error: 'endpoint_removed' }), { status: 410, headers: { 'Content-Type': 'application/json' } }) }