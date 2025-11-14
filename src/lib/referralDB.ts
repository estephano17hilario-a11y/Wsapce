import { promises as fs } from 'fs'
import path from 'path'

type Plan = 'bronce' | 'plata' | 'oro'

export type User = { id: string; email: string; plan: Plan; createdAt: number; referredByCode?: string }
export type ReferralLink = { code: string; userId: string; createdAt: number; expiresAt: number; active: boolean }
export type ReferralRelation = { referrerId: string; refereeId: string; code: string; createdAt: number }

type DB = { users: User[]; links: ReferralLink[]; relations: ReferralRelation[]; config: { ttlDays: number; inviteLimit: number } }

const dataDir = process.env.NODE_ENV === 'production' ? path.join('/tmp', 'wspace_data') : path.join(process.cwd(), 'data')
const dataFile = path.join(dataDir, 'referrals.json')

async function ensureFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
    await fs.access(dataFile)
  } catch {
    const initial: DB = { users: [], links: [], relations: [], config: { ttlDays: 90, inviteLimit: 500 } }
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(dataFile, JSON.stringify(initial, null, 2), 'utf8')
  }
}

export async function readDB(): Promise<DB> {
  await ensureFile()
  const raw = await fs.readFile(dataFile, 'utf8')
  return JSON.parse(raw) as DB
}

export async function writeDB(db: DB) {
  await fs.mkdir(dataDir, { recursive: true })
  await fs.writeFile(dataFile, JSON.stringify(db, null, 2), 'utf8')
}

export function genId() {
  const a = Math.random().toString(36).slice(2, 8)
  const b = Math.random().toString(36).slice(2, 8)
  return `${a}${b}`
}

export function genCode() {
  const a = Math.random().toString(36).slice(2, 5)
  const b = Math.random().toString(36).slice(2, 5)
  const c = Math.random().toString(36).slice(2, 5)
  return `${a}${b}${c}`.toUpperCase()
}

export function now() { return Date.now() }

export function addDays(ms: number, days: number) { return ms + days * 24 * 60 * 60 * 1000 }

export function normalizeRefLink(input: string | undefined | null): string | null {
  if (!input) return null
  const trimmed = input.trim()
  const urlMatch = trimmed.match(/[?&]ref=([A-Za-z0-9_-]{8,})/i)
  if (urlMatch) return urlMatch[1]
  const codeOnly = trimmed.match(/^[A-Za-z0-9_-]{8,}$/)
  if (codeOnly) return trimmed.toUpperCase()
  return null
}

export async function getUserByEmail(email: string) {
  const db = await readDB()
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function getUserById(id: string) {
  const db = await readDB()
  return db.users.find(u => u.id === id) || null
}

export async function createUser(email: string, referredByCode?: string): Promise<User> {
  const db = await readDB()
  const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (exists) return exists
  const user: User = { id: genId(), email, plan: 'bronce', createdAt: now(), referredByCode }
  db.users.push(user)
  await writeDB(db)
  return user
}

export async function upgradeUserToPlata(userId: string): Promise<User | null> {
  const db = await readDB()
  const u = db.users.find(x => x.id === userId)
  if (!u) return null
  if (u.plan === 'bronce') {
    u.plan = 'plata'
    await writeDB(db)
  }
  return u
}

export async function upgradeUserToOro(userId: string): Promise<User | null> {
  const db = await readDB()
  const u = db.users.find(x => x.id === userId)
  if (!u) return null
  if (u.plan !== 'oro') {
    u.plan = 'oro'
    await writeDB(db)
  }
  return u
}

export async function getActiveLinkByUser(userId: string): Promise<ReferralLink | null> {
  const db = await readDB()
  const nowMs = now()
  const link = db.links.find(l => l.userId === userId && l.active && l.expiresAt > nowMs)
  return link || null
}

export async function generateLinkForUser(userId: string): Promise<ReferralLink> {
  const db = await readDB()
  const nowMs = now()
  const existing = db.links.find(l => l.userId === userId && l.active && l.expiresAt > nowMs)
  if (existing) return existing
  const code = genCode()
  const expiresAt = addDays(nowMs, Math.max(90, db.config.ttlDays))
  const link: ReferralLink = { code, userId, createdAt: nowMs, expiresAt, active: true }
  db.links.push(link)
  await writeDB(db)
  return link
}

export async function validateCode(code: string): Promise<ReferralLink | null> {
  const db = await readDB()
  const nowMs = now()
  const l = db.links.find(x => x.code.toUpperCase() === code.toUpperCase() && x.active && x.expiresAt > nowMs)
  return l || null
}

export async function recordRelation(code: string, refereeEmail: string): Promise<ReferralRelation | null> {
  const db = await readDB()
  const link = await validateCode(code)
  if (!link) return null
  const referrer = db.users.find(u => u.id === link.userId)
  if (!referrer) return null
  const referee = db.users.find(u => u.email.toLowerCase() === refereeEmail.toLowerCase())
  if (!referee) return null
  const already = db.relations.find(r => r.refereeId === referee.id)
  if (already) return already
  const relation: ReferralRelation = { referrerId: referrer.id, refereeId: referee.id, code: link.code, createdAt: now() }
  db.relations.push(relation)
  await writeDB(db)
  return relation
}

export async function getStatsForUser(userId: string) {
  const db = await readDB()
  const relations = db.relations.filter(r => r.referrerId === userId)
  const referees = relations.map(r => db.users.find(u => u.id === r.refereeId)).filter(Boolean) as User[]
  const byPlan = referees.reduce<Record<string, number>>((acc, u) => { acc[u.plan] = (acc[u.plan] || 0) + 1; return acc }, {})
  return { totalInvites: relations.length, byPlan, referees }
}

export async function getTopRankings(limit = 10) {
  const db = await readDB()
  const counts = new Map<string, number>()
  for (const u of db.users) counts.set(u.id, 0)
  for (const r of db.relations) counts.set(r.referrerId, (counts.get(r.referrerId) || 0) + 1)
  const pairs = Array.from(counts.entries()).sort((a, b) => {
    const diff = b[1] - a[1]
    return diff !== 0 ? diff : a[0].localeCompare(b[0])
  }).slice(0, limit)
  return pairs.map(([userId, count]) => ({ user: db.users.find(u => u.id === userId) || null, count }))
}

export async function seedDemoData(usersCount: number, minZeros: number) {
  const db = await readDB()
  const names = [
    'nova','strix','zephyr','lyra','orion','vega','kael','astra','nox','raven',
    'ember','onyx','echo','quake','blaze','flare','vertex','delta','sigma','omega',
    'lumen','cipher','atlas','phoenix','zen','neon','hyper','cyra','jax','mira',
    'sol','luna','drake','kira','ryu','sora','nero','aria','skye','vex',
    'quinn','pax','ivy','zane','nara','kane','azul','iris','zara','kyo'
  ]
  const makeEmail = (i: number) => `${names[i % names.length]}${i}@demo.local`
  const startIdx = db.users.length
  const total = Math.max(1, usersCount)
  const ids: string[] = []
  for (let i = 0; i < total; i++) {
    const email = makeEmail(startIdx + i)
    const exists = db.users.find(u => u.email === email)
    if (exists) { ids.push(exists.id); continue }
    const u: User = { id: genId(), email, plan: i % 3 === 0 ? 'plata' : 'bronce', createdAt: now() }
    db.users.push(u)
    ids.push(u.id)
  }
  const zeros = Math.max(0, Math.min(minZeros, ids.length))
  const zeroSet = new Set<string>()
  while (zeroSet.size < zeros) zeroSet.add(ids[zeroSet.size])
  const pickReferee = (ref: string) => {
    let attempts = 0
    while (attempts++ < 10) {
      const idx = Math.floor(Math.random() * ids.length)
      const cand = ids[idx]
      if (cand !== ref) return cand
    }
    return ids.find(x => x !== ref) || ids[0]
  }
  const relationFor = (ref: string): ReferralRelation => ({ referrerId: ref, refereeId: pickReferee(ref), code: genCode(), createdAt: now() })
  for (const id of ids) {
    const count = zeroSet.has(id) ? 0 : Math.floor(Math.random() * 6)
    for (let k = 0; k < count; k++) db.relations.push(relationFor(id))
  }
  await writeDB(db)
  return { usersCreated: total, zeros: zeros }
}