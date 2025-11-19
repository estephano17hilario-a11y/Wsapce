import { promises as fs } from 'fs'
import path from 'path'
import { kv } from '@vercel/kv'

type Plan = 'bronce' | 'plata' | 'oro'

export type User = { id: string; email: string; plan: Plan; createdAt: number; name?: string }

type GoldEvent = { userId: string; email: string; name?: string; createdAt: number; paymentId?: string }

type DB = { users: User[]; goldEvents: GoldEvent[]; config: { ttlDays: number; inviteLimit: number; plataThreshold: number } }

const dataDirEnv = process.env.WS_DATA_DIR || process.env.WSPACE_DATA_DIR || ''
const dataDir = dataDirEnv && dataDirEnv.trim() ? path.resolve(dataDirEnv.trim()) : (process.env.NODE_ENV === 'production' ? path.join('/tmp', 'wspace_data') : path.join(process.cwd(), 'data'))
const dataFile = path.join(dataDir, 'referrals.json')
const useKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
const redisUrlEnv = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || process.env.UPSTASH_REDIS_REST_URL || ''
const useRedis = !!redisUrlEnv

type RedisClient = {
  get: (k: string) => Promise<string | null>
  set: (k: string, v: string) => Promise<void>
  incr: (k: string) => Promise<number>
  lPush: (k: string, v: string) => Promise<number>
  lRange: (k: string, start: number, stop: number) => Promise<string[]>
  lLen: (k: string) => Promise<number>
  lTrim: (k: string, start: number, stop: number) => Promise<void>
}
let redisClientPromise: Promise<RedisClient | null> | null = null
async function getRedis(): Promise<RedisClient | null> {
  if (!useRedis) return null
  try { const g = (globalThis as unknown as { __wspaceRedis?: RedisClient }); if (g.__wspaceRedis) return g.__wspaceRedis } catch {}
  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      try {
        const mod = await import('redis') as unknown as { createClient: (opts: { url: string }) => { connect: () => Promise<void>; on: (ev: string, fn: (...args: unknown[]) => void) => void; get: (k: string) => Promise<string | null>; set: (k: string, v: string) => Promise<void>; incr: (k: string) => Promise<number>; lPush: (k: string, v: string) => Promise<number>; lRange: (k: string, start: number, stop: number) => Promise<string[]>; lLen: (k: string) => Promise<number>; lTrim: (k: string, start: number, stop: number) => Promise<void> } }
        const client = mod.createClient({ url: redisUrlEnv })
        try { client.on('error', () => {}) } catch {}
        await client.connect()
        try { (globalThis as unknown as { __wspaceRedis?: RedisClient }).__wspaceRedis = client as unknown as RedisClient } catch {}
        return client as unknown as RedisClient
      } catch { return null }
    })()
  }
  try { return await redisClientPromise } catch { return null }
}

type CacheEntry<T> = { v: T; ts: number }
type MemCache = { byEmail: Map<string, CacheEntry<User>>; byId: Map<string, CacheEntry<User>>; referrals: CacheEntry<DB> | null; recentGold: Map<string, CacheEntry<GoldEvent[]>>; goldTotal: CacheEntry<number> | null }
function getMem(): MemCache {
  const g = globalThis as unknown as { __wspaceMem?: MemCache }
  if (!g.__wspaceMem) g.__wspaceMem = { byEmail: new Map(), byId: new Map(), referrals: null, recentGold: new Map(), goldTotal: null }
  return g.__wspaceMem
}
const mem = getMem()
const nowMs = () => Date.now()
function fresh<T>(e: CacheEntry<T> | null | undefined, ttl: number): T | null { return e && (nowMs() - e.ts) < ttl ? e.v : null }

async function ensureFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
    await fs.access(dataFile)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
    try {
      const seedPath = path.join(process.cwd(), 'data', 'referrals.json')
      const rawSeed = await fs.readFile(seedPath, 'utf8')
      const seedObj = JSON.parse(rawSeed) as { users?: User[]; goldEvents?: GoldEvent[]; config?: { ttlDays: number; inviteLimit: number; plataThreshold: number } }
      const parsed: DB = {
        users: Array.isArray(seedObj.users) ? seedObj.users : [],
        goldEvents: Array.isArray(seedObj.goldEvents) ? seedObj.goldEvents : [],
        config: seedObj.config && typeof seedObj.config === 'object' ? seedObj.config : { ttlDays: 90, inviteLimit: 500, plataThreshold: 5 }
      }
      if (typeof parsed.config.plataThreshold !== 'number') parsed.config.plataThreshold = 5
      await fs.writeFile(dataFile, JSON.stringify(parsed, null, 2), 'utf8')
      return
    } catch {}
    const initial: DB = { users: [], goldEvents: [], config: { ttlDays: 90, inviteLimit: 500, plataThreshold: 5 } }
    await fs.writeFile(dataFile, JSON.stringify(initial, null, 2), 'utf8')
  }
}

export async function readDB(): Promise<DB> {
  const cached = fresh(mem.referrals, 15000)
  if (cached) return cached
  if (useKV) {
    try {
      const r = await kv.get<DB>('wspace:referrals')
      if (r) {
        if (!Array.isArray(r.goldEvents)) (r as unknown as DB).goldEvents = []
        return r
      }
      let seed: DB | null = null
      try {
        const seedPath = path.join(process.cwd(), 'data', 'referrals.json')
        const rawSeed = await fs.readFile(seedPath, 'utf8')
        const seedObj = JSON.parse(rawSeed) as { users?: User[]; goldEvents?: GoldEvent[]; config?: { ttlDays: number; inviteLimit: number; plataThreshold: number } }
        const parsed: DB = {
          users: Array.isArray(seedObj.users) ? seedObj.users : [],
          goldEvents: Array.isArray(seedObj.goldEvents) ? seedObj.goldEvents : [],
          config: seedObj.config && typeof seedObj.config === 'object' ? seedObj.config : { ttlDays: 90, inviteLimit: 500, plataThreshold: 5 }
        }
        if (typeof parsed.config.plataThreshold !== 'number') parsed.config.plataThreshold = 5
        seed = parsed
      } catch {}
      if (!seed) {
        try {
          const rawTmp = await fs.readFile(dataFile, 'utf8')
          const tmpObj = JSON.parse(rawTmp) as { users?: User[]; goldEvents?: GoldEvent[]; config?: { ttlDays: number; inviteLimit: number; plataThreshold: number } }
          const parsed: DB = {
            users: Array.isArray(tmpObj.users) ? tmpObj.users : [],
            goldEvents: Array.isArray(tmpObj.goldEvents) ? tmpObj.goldEvents : [],
            config: tmpObj.config && typeof tmpObj.config === 'object' ? tmpObj.config : { ttlDays: 90, inviteLimit: 500, plataThreshold: 5 }
          }
          if (typeof parsed.config.plataThreshold !== 'number') parsed.config.plataThreshold = 5
          seed = parsed
        } catch {}
      }
      const initial: DB = seed || { users: [], goldEvents: [], config: { ttlDays: 90, inviteLimit: 500, plataThreshold: 5 } }
      await kv.set('wspace:referrals', initial)
      mem.referrals = { v: initial, ts: nowMs() }
      return initial
    } catch {}
  }
  const redis = await getRedis()
  if (redis) {
    try {
      const raw = await redis.get('wspace:referrals')
      if (raw) {
        const r = JSON.parse(raw) as DB
        if (!Array.isArray(r.goldEvents)) (r as unknown as DB).goldEvents = []
        mem.referrals = { v: r, ts: nowMs() }
        return r
      }
    } catch {}
  }
  await ensureFile()
  let parsed: DB
  try {
    const raw = await fs.readFile(dataFile, 'utf8')
    const rawObj = JSON.parse(raw) as { users?: User[]; goldEvents?: GoldEvent[]; config?: { ttlDays: number; inviteLimit: number; plataThreshold: number } }
    parsed = {
      users: Array.isArray(rawObj.users) ? rawObj.users : [],
      goldEvents: Array.isArray(rawObj.goldEvents) ? rawObj.goldEvents : [],
      config: rawObj.config && typeof rawObj.config === 'object' ? rawObj.config : { ttlDays: 90, inviteLimit: 500, plataThreshold: 5 }
    }
  } catch {
    // Último intento: sembrar desde repo y reintentar
    try {
      const seedPath = path.join(process.cwd(), 'data', 'referrals.json')
      const rawSeed = await fs.readFile(seedPath, 'utf8')
      const seedObj = JSON.parse(rawSeed) as { users?: User[]; goldEvents?: GoldEvent[]; config?: { ttlDays: number; inviteLimit: number; plataThreshold: number } }
      parsed = {
        users: Array.isArray(seedObj.users) ? seedObj.users : [],
        goldEvents: Array.isArray(seedObj.goldEvents) ? seedObj.goldEvents : [],
        config: seedObj.config && typeof seedObj.config === 'object' ? seedObj.config : { ttlDays: 90, inviteLimit: 500, plataThreshold: 5 }
      }
      await fs.writeFile(dataFile, JSON.stringify(parsed, null, 2), 'utf8')
    } catch {
      parsed = { users: [], goldEvents: [], config: { ttlDays: 90, inviteLimit: 500, plataThreshold: 5 } }
    }
  }
  if (!Array.isArray(parsed.goldEvents)) parsed.goldEvents = []
  if (!parsed.config) parsed.config = { ttlDays: 90, inviteLimit: 500, plataThreshold: 5 }
  if (typeof parsed.config.plataThreshold !== 'number') parsed.config.plataThreshold = 5
  mem.referrals = { v: parsed, ts: nowMs() }
  return parsed
}

export async function writeDB(db: DB) {
  let kvOk = false
  if (useKV) {
    try { await kv.set('wspace:referrals', db); kvOk = true } catch {}
  }
  let redisOk = false
  const redis = await getRedis()
  if (redis) {
    try { await redis.set('wspace:referrals', JSON.stringify(db)); redisOk = true } catch {}
  }
  try {
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(dataFile, JSON.stringify(db, null, 2), 'utf8')
  } catch {}
  mem.referrals = { v: db, ts: nowMs() }
  if (!kvOk && !redisOk && !useKV) {
    try {
      const fallbackDir = path.join(process.cwd(), 'data')
      await fs.mkdir(fallbackDir, { recursive: true })
      await fs.writeFile(path.join(fallbackDir, 'referrals.json'), JSON.stringify(db, null, 2), 'utf8')
    } catch {}
  }
}

export function genId() {
  const a = Math.random().toString(36).slice(2, 8)
  const b = Math.random().toString(36).slice(2, 8)
  return `${a}${b}`
}

export function now() { return Date.now() }

 

export function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}


export async function getUserByEmail(email: string) {
  const k = email.toLowerCase()
  {
    const c = fresh(mem.byEmail.get(k), 8000)
    if (c) return c
  }
  if (useRedis) {
    const redis = await getRedis()
    if (redis) {
      const key = 'wspace:users:byEmail:' + k
      try {
        const id = await redis.get(key)
        if (!id) return null
        const raw = await redis.get('wspace:user:' + id)
        const u = raw ? JSON.parse(raw) as User : null
        if (u) { mem.byEmail.set(k, { v: u, ts: nowMs() }); mem.byId.set(u.id, { v: u, ts: nowMs() }) }
        return u
      } catch { return null }
    }
  }
  const db = await readDB()
  const u = db.users.find(u => u.email.toLowerCase() === k) || null
  if (u) { mem.byEmail.set(k, { v: u, ts: nowMs() }); mem.byId.set(u.id, { v: u, ts: nowMs() }) }
  return u
}

export async function getUserById(id: string) {
  {
    const c = fresh(mem.byId.get(id), 8000)
    if (c) return c
  }
  if (useRedis) {
    const redis = await getRedis()
    if (redis) {
      try {
        const raw = await redis.get('wspace:user:' + id)
        const u = raw ? JSON.parse(raw) as User : null
        if (u) { mem.byId.set(id, { v: u, ts: nowMs() }); mem.byEmail.set(u.email.toLowerCase(), { v: u, ts: nowMs() }) }
        return u
      } catch { return null }
    }
  }
  const db = await readDB()
  const u = db.users.find(u => u.id === id) || null
  if (u) { mem.byId.set(id, { v: u, ts: nowMs() }); mem.byEmail.set(u.email.toLowerCase(), { v: u, ts: nowMs() }) }
  return u
}

export async function createUser(email: string): Promise<User> {
  const k = email.toLowerCase()
  if (useRedis) {
    const redis = await getRedis()
    if (redis) {
      const idxKey = 'wspace:users:byEmail:' + k
      const existsId = await redis.get(idxKey)
      if (existsId) {
        const raw = await redis.get('wspace:user:' + existsId)
        const fallback: User = { id: existsId, email, plan: 'bronce', createdAt: now() }
        const u: User = raw ? (JSON.parse(raw) as User) : fallback
        mem.byEmail.set(k, { v: u, ts: nowMs() }); mem.byId.set(u.id, { v: u, ts: nowMs() })
        return u
      }
      const user: User = { id: genId(), email, plan: 'bronce', createdAt: now() }
      await redis.set('wspace:user:' + user.id, JSON.stringify(user))
      await redis.set(idxKey, user.id)
      mem.byEmail.set(k, { v: user, ts: nowMs() }); mem.byId.set(user.id, { v: user, ts: nowMs() })
      return user
    }
  }
  const db = await readDB()
  const exists = db.users.find(u => u.email.toLowerCase() === k)
  if (exists) return exists
  const user: User = { id: genId(), email, plan: 'bronce', createdAt: now() }
  db.users.push(user)
  await writeDB(db)
  mem.byEmail.set(k, { v: user, ts: nowMs() }); mem.byId.set(user.id, { v: user, ts: nowMs() })
  return user
}

export async function upgradeUserToPlata(userId: string): Promise<User | null> {
  if (useRedis) {
    const redis = await getRedis()
    if (redis) {
      const raw = await redis.get('wspace:user:' + userId)
      if (!raw) return null
      const u = JSON.parse(raw) as User
      if (u.plan === 'bronce') { u.plan = 'plata'; await redis.set('wspace:user:' + userId, JSON.stringify(u)) }
      mem.byId.set(userId, { v: u, ts: nowMs() }); mem.byEmail.set(u.email.toLowerCase(), { v: u, ts: nowMs() })
      return u
    }
  }
  const db = await readDB()
  const u = db.users.find(x => x.id === userId)
  if (!u) return null
  if (u.plan === 'bronce') { u.plan = 'plata'; await writeDB(db) }
  mem.byId.set(userId, { v: u, ts: nowMs() }); mem.byEmail.set(u.email.toLowerCase(), { v: u, ts: nowMs() })
  return u
}

export async function upgradeUserToOro(userId: string): Promise<User | null> {
  if (useRedis) {
    const redis = await getRedis()
    if (redis) {
      const raw = await redis.get('wspace:user:' + userId)
      if (!raw) return null
      const u = JSON.parse(raw) as User
      if (u.plan !== 'oro') { u.plan = 'oro'; await redis.set('wspace:user:' + userId, JSON.stringify(u)) }
      mem.byId.set(userId, { v: u, ts: nowMs() }); mem.byEmail.set(u.email.toLowerCase(), { v: u, ts: nowMs() })
      return u
    }
  }
  const db = await readDB()
  const u = db.users.find(x => x.id === userId)
  if (!u) return null
  if (u.plan !== 'oro') { u.plan = 'oro'; await writeDB(db) }
  mem.byId.set(userId, { v: u, ts: nowMs() }); mem.byEmail.set(u.email.toLowerCase(), { v: u, ts: nowMs() })
  return u
}

export async function appendGoldEventForPayment(userId: string, paymentId?: string): Promise<void> {
  if (useRedis) {
    const redis = await getRedis()
    if (redis) {
      const raw = await redis.get('wspace:user:' + userId)
      if (!raw) return
      const u = JSON.parse(raw) as User
      if (paymentId) {
        const seen = await redis.get('wspace:gold:seen:' + paymentId)
        if (seen) return
        await redis.set('wspace:gold:seen:' + paymentId, '1')
      } else {
        const last = parseInt((await redis.get('wspace:gold:last:' + userId)) || '0', 10)
        if (last && (now() - last) < 30000) return
        await redis.set('wspace:gold:last:' + userId, String(now()))
      }
      const ev: GoldEvent = { userId: u.id, email: u.email, name: u.name, createdAt: now(), paymentId }
      await redis.lPush('wspace:gold:events', JSON.stringify(ev))
      await redis.lTrim('wspace:gold:events', 0, 999)
      try { await redis.set('wspace:gold:last_announce', JSON.stringify({ email: u.email, name: u.name, ts: ev.createdAt })) } catch {}
      try { await redis.incr('wspace:gold:announce_seq') } catch {}
      try { const g = (globalThis as unknown as { __wspaceGold?: { seq: number; last: unknown } }); const cur = g.__wspaceGold?.seq || 0; g.__wspaceGold = { seq: cur + 1, last: { email: u.email, name: u.name, ts: ev.createdAt } } } catch {}
      mem.recentGold.clear(); mem.goldTotal = null
      return
    }
  }
  const db = await readDB()
  const u = db.users.find(x => x.id === userId)
  if (!u) return
  if (paymentId) {
    const exists = db.goldEvents.some(e => e.paymentId === paymentId)
    if (exists) return
  } else {
    const lastForUser = db.goldEvents.slice().reverse().find(e => e.userId === userId)
    if (lastForUser && (now() - lastForUser.createdAt) < 30000) return
  }
  const ev: GoldEvent = { userId: u.id, email: u.email, name: u.name, createdAt: now(), paymentId }
  db.goldEvents.push(ev)
  await writeDB(db)
  mem.recentGold.clear(); mem.goldTotal = null
}



 

 

 

 

 

 

export async function getRecentGoldEvents(limit = 10, since?: number) {
  const cacheKey = `${Math.max(1, limit)}|${typeof since === 'number' ? since : ''}`
  {
    const c = fresh(mem.recentGold.get(cacheKey), 5000)
    if (c) return c
  }
  if (useRedis) {
    const redis = await getRedis()
    if (redis) {
      try {
        const raw = await redis.lRange('wspace:gold:events', 0, Math.max(0, limit - 1))
        const arr = raw.map(x => { try { return JSON.parse(x) as GoldEvent } catch { return null } }).filter(Boolean) as GoldEvent[]
        const out = typeof since === 'number' ? arr.filter(e => e.createdAt > since) : arr
        mem.recentGold.set(cacheKey, { v: out, ts: nowMs() })
        return out
      } catch { return [] }
    }
  }
  const db = await readDB()
  const events = db.goldEvents.slice().sort((a, b) => b.createdAt - a.createdAt)
  const dedup: GoldEvent[] = []
  const seen = new Set<string>()
  for (const e of events) {
    const key = e.paymentId ? `pid:${e.paymentId}` : `u:${e.userId}:${e.createdAt}`
    if (seen.has(key)) continue
    seen.add(key)
    dedup.push(e)
  }
  const filtered = typeof since === 'number' ? dedup.filter(e => e.createdAt > since) : dedup
  const out = filtered.slice(0, Math.max(1, limit))
  mem.recentGold.set(cacheKey, { v: out, ts: nowMs() })
  return out
}

export async function getGoldEventsTotal(): Promise<number> {
  {
    const c = fresh(mem.goldTotal, 5000)
    if (c !== null) return c
  }
  if (useRedis) {
    const redis = await getRedis()
    if (redis) { try { const n = await redis.lLen('wspace:gold:events'); mem.goldTotal = { v: n, ts: nowMs() }; return n } catch { return 0 } }
  }
  const db = await readDB()
  const n = Array.isArray(db.goldEvents) ? db.goldEvents.length : 0
  mem.goldTotal = { v: n, ts: nowMs() }
  return n
}

export async function updateUserName(userId: string, name: string): Promise<User | null> {
  const db = await readDB()
  const u = db.users.find(x => x.id === userId)
  if (!u) return null
  const clean = (name || '').trim().slice(0, 80)
  if (clean && clean !== (u.name || '')) {
    u.name = clean
    await writeDB(db)
  }
  mem.byId.set(userId, { v: u, ts: nowMs() }); mem.byEmail.set(u.email.toLowerCase(), { v: u, ts: nowMs() })
  return u
}