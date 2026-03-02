// app/composables/admin/useSettings.ts
import { computed } from 'vue'
import type { Tenant, TenantSettings } from '~/types'

export function useSettings() {
  const { data: tenant, pending: tenantPending, error: tenantError, refresh: refreshTenant } =
    useFetch<Tenant | null>('/api/admin/tenant', { default: () => null })

  const { data: settings, pending: settingsPending, error: settingsError, refresh: refreshSettings } =
    useFetch<TenantSettings | null>('/api/admin/settings', { default: () => null })

  async function updateTenant(patch: Partial<Tenant>): Promise<void> {
    const body: Record<string, unknown> = {}
    if (patch.name !== undefined) body.name = patch.name
    if (patch.nameEn !== undefined) body.name_en = patch.nameEn
    if (patch.description !== undefined) body.description = patch.description
    if (patch.logoUrl !== undefined) body.logo_url = patch.logoUrl
    if (patch.brandColor !== undefined) body.brand_color = patch.brandColor
    if (patch.phone !== undefined) body.phone = patch.phone
    await $fetch('/api/admin/tenant', { method: 'PATCH', body })
    await refreshTenant()
  }

  async function updateSettings(patch: Partial<TenantSettings>): Promise<void> {
    await $fetch('/api/admin/settings', { method: 'PATCH', body: patch })
    await refreshSettings()
  }

  const isLoading = computed(() => tenantPending.value || settingsPending.value)
  const error = computed(() => tenantError.value || settingsError.value)

  return {
    tenant,
    settings,
    updateTenant,
    updateSettings,
    isLoading,
    error,
    refreshTenant,
    refreshSettings,
  }
}
