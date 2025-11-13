import crypto from 'crypto'

export function encodeSession(uid: string) {
  const secret = process.env.COOKIE_SECRET || 'wspace_default_cookie_secret'
  const sig = crypto.createHmac('sha256', secret).update(uid).digest('hex')
  return `${uid}.${sig}`
}

export function decodeSession(raw: string | undefined) {
  if (!raw) return null
  const i = raw.lastIndexOf('.')
  if (i <= 0) return null
  const uid = raw.slice(0, i)
  const sig = raw.slice(i + 1)
  const secret = process.env.COOKIE_SECRET || 'wspace_default_cookie_secret'
  const expected = crypto.createHmac('sha256', secret).update(uid).digest('hex')
  return sig === expected ? uid : null
}