// tests/server/utils/webhookSignature.test.ts
import { describe, it, expect } from 'vitest'
import crypto from 'node:crypto'
import { verifyWebhookSignature } from '../../../server/utils/webhookSignature'

describe('verifyWebhookSignature', () => {
  const SECRET = 'test-webhook-secret-abc123'

  it('returns true for a valid signature', () => {
    const paymentId = 'pay_abc123'
    const status = 'paid'
    const validSig = crypto.createHmac('sha256', SECRET).update(`${paymentId}${status}`).digest('hex')
    expect(verifyWebhookSignature(paymentId, status, validSig, SECRET)).toBe(true)
  })

  it('returns false for a tampered signature', () => {
    expect(verifyWebhookSignature('pay_abc123', 'paid', 'not-the-right-sig', SECRET)).toBe(false)
  })

  it('returns false when status is different', () => {
    const validSig = crypto.createHmac('sha256', SECRET).update('pay_abc123paid').digest('hex')
    expect(verifyWebhookSignature('pay_abc123', 'failed', validSig, SECRET)).toBe(false)
  })
})
