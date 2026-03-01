// app/composables/admin/useSettings.ts
import { ref } from 'vue'
import { mockTenant, mockSettings } from '~/data/mock'
import type { Tenant, TenantSettings } from '~/types'

export function useSettings() {
  const tenant = ref<Tenant>({ ...mockTenant })
  const settings = ref<TenantSettings>({ ...mockSettings })

  function updateTenant(patch: Partial<Tenant>): void {
    tenant.value = { ...tenant.value, ...patch }
  }

  function updateSettings(patch: Partial<TenantSettings>): void {
    settings.value = { ...settings.value, ...patch }
  }

  return { tenant, settings, updateTenant, updateSettings }
}
