// tests/app/composables/admin/useSettings.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mockTenant, mockSettings } from '~/data/mock'
import { useSettings } from '~/composables/admin/useSettings'

const { useFetchMock, fetchMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  fetchMock: vi.fn(),
}))

mockNuxtImport('useFetch', () => useFetchMock)

describe('useSettings', () => {
  beforeEach(() => {
    vi.stubGlobal('$fetch', fetchMock)
    const tenantRef = ref(mockTenant)
    const settingsRef = ref(mockSettings)
    useFetchMock.mockImplementation((url: string) => {
      if (url === '/api/admin/tenant') {
        return {
          data: tenantRef,
          pending: ref(false),
          error: ref(null),
          refresh: vi.fn(),
        }
      }
      if (url === '/api/admin/settings') {
        return {
          data: settingsRef,
          pending: ref(false),
          error: ref(null),
          refresh: vi.fn(),
        }
      }
      return {
        data: ref(null),
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn(),
      }
    })
    fetchMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads mock tenant with expected name and brandColor', () => {
    const { tenant } = useSettings()
    expect(tenant.value?.name).toBe('صالون نور للتجميل')
    expect(tenant.value?.brandColor).toBe('#C9A87C')
  })

  it('loads mock settings with expected paymentMode and maxAdvanceDays', () => {
    const { settings } = useSettings()
    expect(settings.value?.paymentMode).toBe('full')
    expect(settings.value?.maxAdvanceDays).toBe(30)
  })

  it('updateTenant calls $fetch with PATCH and correct body', async () => {
    const { updateTenant } = useSettings()
    await updateTenant({ name: 'صالون جديد' })
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/tenant', {
      method: 'PATCH',
      body: { name: 'صالون جديد' },
    })
  })

  it('updateTenant sends snake_case for nameEn and brand_color', async () => {
    const { updateTenant } = useSettings()
    await updateTenant({ nameEn: 'New Name', brandColor: '#000000' })
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/tenant', {
      method: 'PATCH',
      body: { name_en: 'New Name', brand_color: '#000000' },
    })
  })

  it('updateTenant patches phone to null', async () => {
    const { updateTenant } = useSettings()
    await updateTenant({ phone: null })
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/tenant', {
      method: 'PATCH',
      body: { phone: null },
    })
  })

  it('updateSettings calls $fetch with PATCH and patch body', async () => {
    const { updateSettings } = useSettings()
    await updateSettings({ paymentMode: 'deposit', depositPercent: 25 })
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/settings', {
      method: 'PATCH',
      body: { paymentMode: 'deposit', depositPercent: 25 },
    })
  })

  it('updateSettings can set paymentMode to at_salon', async () => {
    const { updateSettings } = useSettings()
    await updateSettings({ paymentMode: 'at_salon' })
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/settings', {
      method: 'PATCH',
      body: { paymentMode: 'at_salon' },
    })
  })
})
