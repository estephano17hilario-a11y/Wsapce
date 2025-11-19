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
  if (useRedis) {
    const redis = await getRedis()
    if (redis) {
      const key = 'wspace:users:byEmail:' + k
      try {
        const id = await redis.get(key)
        if (!id) return null
        const raw = await redis.get('wspace:user:' + id)
        const u = raw ? JSON.parse(raw) as User : null
        return u
      } catch { return null }
    }
  }
  const db = await readDB()
  return db.users.find(u => u.email.toLowerCase() === k) || null
}

export async function getUserById(id: string) {
  if (useRedis) {
    const redis = await getRedis()
    if (redis) {
      try { const raw = await redis.get('wspace:user:' + id); return raw ? JSON.parse(raw) as User : null } catch { return null }
    }
  }
  const db = await readDB()
  return db.users.find(u => u.id === id) || null
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
        return u
      }
      const user: User = { id: genId(), email, plan: 'bronce', createdAt: now() }
      await redis.set('wspace:user:' + user.id, JSON.stringify(user))
      await redis.set(idxKey, user.id)
      return user
    }
  }
  const db = await readDB()
  const exists = db.users.find(u => u.email.toLowerCase() === k)
  if (exists) return exists
  const user: User = { id: genId(), email, plan: 'bronce', createdAt: now() }
  db.users.push(user)
  await writeDB(db)
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
      return u
    }
  }
  const db = await readDB()
  const u = db.users.find(x => x.id === userId)
  if (!u) return null
  if (u.plan === 'bronce') { u.plan = 'plata'; await writeDB(db) }
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
      return u
    }
  }
  const db = await readDB()
  const u = db.users.find(x => x.id === userId)
  if (!u) return null
  if (u.plan !== 'oro') { u.plan = 'oro'; await writeDB(db) }
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
}



 

 

 

 

 

 

export async function getRecentGoldEvents(limit = 10, since?: number) {
  if (useRedis) {
    const redis = await getRedis()
    if (redis) {
      try {
        const raw = await redis.lRange('wspace:gold:events', 0, Math.max(0, limit - 1))
        const arr = raw.map(x => { try { return JSON.parse(x) as GoldEvent } catch { return null } }).filter(Boolean) as GoldEvent[]
        return typeof since === 'number' ? arr.filter(e => e.createdAt > since) : arr
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
  return filtered.slice(0, Math.max(1, limit))
}

export async function getGoldEventsTotal(): Promise<number> {
  if (useRedis) {
    const redis = await getRedis()
    if (redis) { try { return await redis.lLen('wspace:gold:events') } catch { return 0 } }
  }
  const db = await readDB()
  return Array.isArray(db.goldEvents) ? db.goldEvents.length : 0
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
  return u
}