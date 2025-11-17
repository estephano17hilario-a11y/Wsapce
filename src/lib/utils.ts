import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type FetchETagOptions = RequestInit & { cacheKey?: string; maxAgeSeconds?: number }
type FetchETagResult<T> = { ok: boolean; status: number; json: T | null; fromCache: boolean; etag: string | null }

export async function fetchETagJSON<T = unknown>(url: string, options: FetchETagOptions = {}): Promise<FetchETagResult<T>> {
  const key = options.cacheKey || url
  const now = Date.now()
  let cached: { etag: string; ts: number; json: T } | null = null
  try {
    const raw = sessionStorage.getItem('etag_cache:' + key)
    if (raw) cached = JSON.parse(raw)
  } catch {}
  const ttl = typeof options.maxAgeSeconds === 'number' ? Math.max(0, options.maxAgeSeconds) * 1000 : 8000
  if (cached && now - cached.ts < ttl) {
    return { ok: true, status: 200, json: cached.json, fromCache: true, etag: cached.etag }
  }
  const hdrs = new Headers(options.headers || {})
  if (cached?.etag) hdrs.set('If-None-Match', cached.etag)
  const res = await fetch(url, { ...options, headers: hdrs })
  if (res.status === 304 && cached) {
    return { ok: true, status: 304, json: cached.json, fromCache: true, etag: cached.etag }
  }
  let json: T | null = null
  try { json = await res.json() as T } catch { json = null }
  const etag = res.headers.get('ETag')
  if (etag && json !== null) {
    try { sessionStorage.setItem('etag_cache:' + key, JSON.stringify({ etag, ts: now, json })) } catch {}
  }
  return { ok: res.ok, status: res.status, json, fromCache: false, etag }
}
