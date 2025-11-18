import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic'

export async function GET() {
  const enc = new TextEncoder()
  let running = true
  let lastSeq = 0
  try { lastSeq = (await kv.get<number>('wspace:gold:announce_seq')) || 0 } catch { 
    try { lastSeq = (globalThis as unknown as { __wspaceGold?: { seq: number } }).__wspaceGold?.seq || 0 } catch {}
  }
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const write = (s: string) => controller.enqueue(enc.encode(s))
      write('retry: 3000\n\n')
      write(`event: ping\n` + `data: ok\n\n`)
      const loop = async () => {
        while (running) {
          try {
            let seq = 0
            try { seq = (await kv.get<number>('wspace:gold:announce_seq')) || 0 } catch {}
            if (!seq) { try { seq = (globalThis as unknown as { __wspaceGold?: { seq: number } }).__wspaceGold?.seq || 0 } catch {} }
            if (seq && seq !== lastSeq) {
              lastSeq = seq
              let last: { email?: string; name?: string; ts?: number } | null = null
              try { last = await kv.get<{ email?: string; name?: string; ts?: number }>('wspace:gold:last_announce') } catch {}
              if (!last) { try { last = (globalThis as unknown as { __wspaceGold?: { last: { email?: string; name?: string; ts?: number } } }).__wspaceGold?.last || null } catch {} }
              if (last) write(`data: ${JSON.stringify(last)}\n\n`)
            }
          } catch {}
          await new Promise(r => setTimeout(r, 1000))
        }
      }
      loop()
    },
    cancel() { running = false }
  })
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  })
}