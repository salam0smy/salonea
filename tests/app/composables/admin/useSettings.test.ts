// tests/app/composables/admin/useSettings.test.ts
import { describe, it, expect } from 'vitest'
import { useSettings } from '~/composables/admin/useSettings'

describe('useSettings', () => {
  // ── Initial state ─────────────────────────────────────────

  it('loads mock tenant with expected name and brandColor', () => {
    const { tenant } = useSettings()
    expect(tenant.value.name).toBe('صالون نور للتجميل')
    expect(tenant.value.brandColor).toBe('#C9A87C')
  })

  it('loads mock settings with expected paymentMode and maxAdvanceDays', () => {
    const { settings } = useSettings()
    expect(settings.value.paymentMode).toBe('full')
    expect(settings.value.maxAdvanceDays).toBe(30)
  })

  // ── updateTenant ──────────────────────────────────────────

  it('updateTenant patches a single tenant field', () => {
    const { tenant, updateTenant } = useSettings()
    updateTenant({ name: 'صالون جديد' })
    expect(tenant.value.name).toBe('صالون جديد')
  })

  it('updateTenant does not overwrite unpatched fields', () => {
    const { tenant, updateTenant } = useSettings()
    const originalColor = tenant.value.brandColor
    updateTenant({ name: 'صالون جديد' })
    expect(tenant.value.brandColor).toBe(originalColor)
  })

  it('updateTenant patches phone to null', () => {
    const { tenant, updateTenant } = useSettings()
    updateTenant({ phone: null })
    expect(tenant.value.phone).toBeNull()
  })

  // ── updateSettings ────────────────────────────────────────

  it('updateSettings patches paymentMode and depositPercent', () => {
    const { settings, updateSettings } = useSettings()
    updateSettings({ paymentMode: 'deposit', depositPercent: 25 })
    expect(settings.value.paymentMode).toBe('deposit')
    expect(settings.value.depositPercent).toBe(25)
  })

  it('updateSettings does not overwrite unpatched fields', () => {
    const { settings, updateSettings } = useSettings()
    const originalMax = settings.value.maxAdvanceDays
    updateSettings({ paymentMode: 'at_salon' })
    expect(settings.value.maxAdvanceDays).toBe(originalMax)
  })

  it('updateSettings can set paymentMode to at_salon', () => {
    const { settings, updateSettings } = useSettings()
    updateSettings({ paymentMode: 'at_salon' })
    expect(settings.value.paymentMode).toBe('at_salon')
  })

  // ── Isolation ─────────────────────────────────────────────

  it('each call to useSettings returns independent tenant state', () => {
    const a = useSettings()
    const b = useSettings()
    a.updateTenant({ name: 'صالون مختلف' })
    expect(b.tenant.value.name).toBe('صالون نور للتجميل')
  })

  it('each call to useSettings returns independent settings state', () => {
    const a = useSettings()
    const b = useSettings()
    a.updateSettings({ maxAdvanceDays: 60 })
    expect(b.settings.value.maxAdvanceDays).toBe(30)
  })
})
