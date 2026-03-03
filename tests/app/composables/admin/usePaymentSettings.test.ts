// tests/app/composables/admin/usePaymentSettings.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mockPaymentSettings } from '~/data/mock'
import { usePaymentSettings } from '~/composables/admin/usePaymentSettings'

const { useFetchMock, fetchMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  fetchMock: vi.fn(),
}))

mockNuxtImport('useFetch', () => useFetchMock)

describe('usePaymentSettings', () => {
  beforeEach(() => {
    vi.stubGlobal('$fetch', fetchMock)
    const settingsRef = ref({ ...mockPaymentSettings })
    useFetchMock.mockReturnValue({
      data: settingsRef,
      pending: ref(false),
      error: ref(null),
      refresh: vi.fn(),
    })
    fetchMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns isConnected: false from mock', () => {
    const { paymentSettings } = usePaymentSettings()
    expect(paymentSettings.value?.isConnected).toBe(false)
  })

  it('connect calls $fetch POST with publishableKey and secretKey', async () => {
    const { connect } = usePaymentSettings()
    await connect('pk_test_abc', 'sk_test_xyz')
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/settings/payment/moyasar', {
      method: 'POST',
      body: { publishableKey: 'pk_test_abc', secretKey: 'sk_test_xyz' },
    })
  })

  it('connecting is false after successful connect', async () => {
    const { connect, connecting } = usePaymentSettings()
    await connect('pk_test_abc', 'sk_test_xyz')
    expect(connecting.value).toBe(false)
  })

  it('sets connectError on failure and re-throws', async () => {
    fetchMock.mockRejectedValueOnce({ statusMessage: 'Invalid Moyasar keys — check publishable and secret keys' })
    const { connect, connectError } = usePaymentSettings()
    await expect(connect('bad', 'bad')).rejects.toBeDefined()
    expect(connectError.value).toBe('Invalid Moyasar keys — check publishable and secret keys')
  })

  it('connecting is false even after failed connect', async () => {
    fetchMock.mockRejectedValueOnce({ statusMessage: 'error' })
    const { connect, connecting } = usePaymentSettings()
    await connect('bad', 'bad').catch(() => {})
    expect(connecting.value).toBe(false)
  })

  it('disconnect calls $fetch DELETE', async () => {
    const { disconnect } = usePaymentSettings()
    await disconnect()
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/settings/payment/moyasar', { method: 'DELETE' })
  })
})
