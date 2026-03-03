// server/utils/encryption.ts
import crypto from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12   // bytes — 96-bit IV recommended for GCM
const TAG_LENGTH = 16  // bytes — standard GCM auth tag

function getKey(): Buffer {
  const hexKey = process.env.ENCRYPTION_KEY
  if (!hexKey || hexKey.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be set as 64 hex characters (32 bytes)')
  }
  return Buffer.from(hexKey, 'hex')
}

/** Encrypts plaintext to "iv:tag:ciphertext" (all hex-encoded). */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')
}

/** Decrypts a "iv:tag:ciphertext" string produced by encrypt(). */
export function decrypt(ciphertext: string): string {
  const key = getKey()
  const parts = ciphertext.split(':')
  if (parts.length !== 3) throw new Error('Invalid ciphertext format')

  const [ivHex, tagHex, encryptedHex] = parts
  const iv = Buffer.from(ivHex!, 'hex')
  const tag = Buffer.from(tagHex!, 'hex')
  const encrypted = Buffer.from(encryptedHex!, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
