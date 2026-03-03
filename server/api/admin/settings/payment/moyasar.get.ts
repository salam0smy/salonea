// server/api/admin/settings/payment/moyasar.get.ts
import type { TenantPaymentSettings } from '~/types'

export default defineEventHandler(async (event): Promise<TenantPaymentSettings> => {
  const { tenantId } = await requireAdmin(event)
  const settings = await getPaymentSettings(event, tenantId)
  return {
    isConnected: settings.isConnected,
    publishableKey: settings.publishableKey,
  }
})
