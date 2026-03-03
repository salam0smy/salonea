// server/api/admin/settings/payment/moyasar.post.ts
import type { TenantPaymentSettings } from '~/types'
import { randomBytes } from 'node:crypto'

interface ConnectBody {
  publishableKey: string
  secretKey: string
}

export default defineEventHandler(async (event): Promise<TenantPaymentSettings> => {
  const { tenantId } = await requireAdmin(event)
  const body = await readBody<ConnectBody>(event)

  if (!body?.publishableKey?.trim() || !body?.secretKey?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'publishableKey and secretKey are required' })
  }

  // 1. Validate keys by making a test request to Moyasar
  const credentials = Buffer.from(`${body.secretKey}:`).toString('base64')
  try {
    await $fetch('https://api.moyasar.com/v1/payments?per_page=1', {
      headers: { Authorization: `Basic ${credentials}` },
    })
  }
  catch {
    throw createError({ statusCode: 422, statusMessage: 'Invalid Moyasar keys — check publishable and secret keys' })
  }

  // 2. Generate a webhook shared secret that Moyasar will use to sign webhook payloads
  const webhookSharedSecret = randomBytes(32).toString('hex')

  // 3. Register webhook on Moyasar (only when running on HTTPS — Moyasar rejects http:// URLs)
  const runtimeConfig = useRuntimeConfig()
  const webhookUrl = `${runtimeConfig.public.siteUrl}/api/webhooks/moyasar`
  if (webhookUrl.startsWith('https://')) {
    try {
      await $fetch('https://api.moyasar.com/v1/webhooks', {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}` },
        body: {
          http_method: 'post',
          url: webhookUrl,
          shared_secret: webhookSharedSecret,
          events: ['payment_paid', 'payment_failed'],
        },
      })
    }
    catch (e: any) {
      console.error('[moyasar] webhook registration failed:', JSON.stringify(e?.data ?? e?.message ?? e))
      throw createError({ statusCode: 422, statusMessage: 'Could not register Moyasar webhook — check key permissions' })
    }
  }

  // 4. Encrypt secrets and save
  await upsertPaymentSettings(event, tenantId, {
    publishableKey: body.publishableKey,
    encryptedSecretKey: encrypt(body.secretKey),
    encryptedWebhookSecret: encrypt(webhookSharedSecret),
  })

  return { isConnected: true, publishableKey: body.publishableKey }
})
