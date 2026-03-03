// app/composables/admin/usePaymentSettings.ts
import type { TenantPaymentSettings } from '~/types'

export function usePaymentSettings() {
  const { data: paymentSettings, pending, error, refresh } =
    useFetch<TenantPaymentSettings>('/api/admin/settings/payment/moyasar', {
      default: () => ({ isConnected: false, publishableKey: null }),
    })

  const connecting = ref(false)
  const connectError = ref<string | null>(null)

  async function connect(publishableKey: string, secretKey: string): Promise<void> {
    connecting.value = true
    connectError.value = null
    try {
      await $fetch('/api/admin/settings/payment/moyasar', {
        method: 'POST',
        body: { publishableKey, secretKey },
      })
      await refresh()
    }
    catch (err: unknown) {
      const h3Err = err as { statusMessage?: string }
      connectError.value = h3Err?.statusMessage ?? 'Connection failed'
      throw err
    }
    finally {
      connecting.value = false
    }
  }

  async function disconnect(): Promise<void> {
    await $fetch('/api/admin/settings/payment/moyasar', { method: 'DELETE' })
    await refresh()
  }

  return { paymentSettings, pending, error, connecting, connectError, connect, disconnect, refresh }
}
