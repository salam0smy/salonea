// tests/server/utils/encryption.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { encrypt, decrypt } from '../../../server/utils/encryption'

const TEST_KEY = 'a'.repeat(64) // valid 64 hex chars = 32 bytes

describe('encrypt / decrypt', () => {
  beforeEach(() => {
    vi.stubEnv('ENCRYPTION_KEY', TEST_KEY)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('decrypt(encrypt(x)) returns the original plaintext', () => {
    expect(decrypt(encrypt('sk_test_hello_world'))).toBe('sk_test_hello_world')
  })

  it('produces different ciphertext for the same input each call (random IV)', () => {
    const a = encrypt('same-text')
    const b = encrypt('same-text')
    expect(a).not.toBe(b)
  })

  it('throws on invalid ciphertext format (missing colons)', () => {
    expect(() => decrypt('notvalid')).toThrow('Invalid ciphertext format')
  })

  it('throws if ENCRYPTION_KEY is empty', () => {
    vi.stubEnv('ENCRYPTION_KEY', '')
    expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY must be set')
  })
})
