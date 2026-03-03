// server/api/admin/settings/payment/moyasar.delete.ts

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)

  // Best-effort: delete the webhook from Moyasar before clearing local data
  const settings = await getPaymentSettings(event, tenantId)
  if (settings.isConnected && settings.encryptedSecretKey) {
    try {
      const secretKey = decrypt(settings.encryptedSecretKey)
      const credentials = Buffer.from(`${secretKey}:`).toString('base64')

      const webhooks = await $fetch<Array<{ id: string }>>('https://api.moyasar.com/v1/webhooks', {
        headers: { Authorization: `Basic ${credentials}` },
      })

      for (const webhook of webhooks) {
        await $fetch(`https://api.moyasar.com/v1/webhooks/${webhook.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Basic ${credentials}` },
        }).catch(() => {
          // best-effort — don't fail the disconnect if webhook removal fails
        })
      }
    }
    catch {
      // best-effort — still clear local data even if Moyasar cleanup fails
    }
  }

  await clearPaymentSettings(event, tenantId)
  return { success: true }
})
