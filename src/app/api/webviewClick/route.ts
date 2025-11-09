import type { NextRequest } from 'next/server'

// Endpoint de utilidad para el webview del IDE: evita timeouts en /api/webviewClick
// Responde rápido sin procesar nada sensible.

export async function GET() {
  return Response.json({ ok: true, message: 'webview click acknowledged (GET)' })
}

export async function POST(req: NextRequest) {
  // Intentamos leer JSON si viene, pero no es obligatorio
  let payload: unknown = null
  try {
    payload = await req.json().catch(() => null)
  } catch {
    payload = null
  }
  return Response.json({ ok: true, message: 'webview click acknowledged (POST)', payload })
}

export async function HEAD() {
  return new Response(null, { status: 204 })
}