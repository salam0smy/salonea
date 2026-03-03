// server/api/[slug]/payment-config.get.ts
import type { TenantPaymentSettings } from '~/types'

export default defineEventHandler(async (event): Promise<TenantPaymentSettings> => {
  const tenantId = event.context.tenantId as string | undefined
  if (!tenantId) throw createError({ statusCode: 404 })

  const settings = await getPaymentSettings(event, tenantId)
  return {
    isConnected: settings.isConnected,
    publishableKey: settings.publishableKey,
  }
})
