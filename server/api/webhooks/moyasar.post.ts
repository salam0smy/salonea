// server/api/webhooks/moyasar.post.ts

interface MoyasarWebhookPayload {
  type: string
  created_at: string
  data: {
    id: string
    status: string
    metadata: {
      booking_id?: string
      tenant_id?: string
    }
    message?: string | null
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<MoyasarWebhookPayload>(event)

  const tenantId = body?.data?.metadata?.tenant_id
  const bookingId = body?.data?.metadata?.booking_id

  if (!tenantId || !bookingId) return { received: true }

  const paymentSettings = await getPaymentSettingsByTenantId(event, tenantId)

  if (!paymentSettings.isConnected || !paymentSettings.encryptedWebhookSecret) {
    return { received: true }
  }

  const webhookSecret = decrypt(paymentSettings.encryptedWebhookSecret)

  const signature = getHeader(event, 'signature') ?? ''
  if (!verifyWebhookSignature(body.data.id, body.data.status, signature, webhookSecret)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook signature' })
  }

  const client = await getServiceRoleClient(event)

  if (body.data.status === 'paid') {
    await client
      .from('bookings')
      .update({ status: 'confirmed', payment_status: 'paid' })
      .eq('id', bookingId)
      .eq('tenant_id', tenantId)
  }
  else if (body.data.status === 'failed') {
    await client
      .from('bookings')
      .update({ status: 'cancelled', payment_status: 'unpaid' })
      .eq('id', bookingId)
      .eq('tenant_id', tenantId)
  }

  return { received: true }
})
