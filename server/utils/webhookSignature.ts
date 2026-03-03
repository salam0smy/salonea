// server/utils/webhookSignature.ts
import crypto from 'node:crypto'

/**
 * Verifies Moyasar webhook signature (HMAC-SHA256 over payment_id + status).
 * See https://docs.moyasar.com/api/webhooks
 */
export function verifyWebhookSignature(
  paymentId: string,
  paymentStatus: string,
  signature: string,
  secret: string,
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${paymentId}${paymentStatus}`)
    .digest('hex')
  return signature === expected
}
