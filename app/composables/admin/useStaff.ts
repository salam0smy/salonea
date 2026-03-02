// app/composables/admin/useStaff.ts
import type { StaffMember, Service } from '~/types'

export type NewStaffData = Omit<StaffMember, 'id' | 'tenantId'>

export function useStaff() {
  const { data: staff, pending, error, refresh } =
    useFetch<StaffMember[]>('/api/admin/staff', { default: () => [] })

  const { data: services } =
    useFetch<Service[]>('/api/admin/services', { default: () => [] })

  async function addStaff(data: NewStaffData): Promise<void> {
    await $fetch('/api/admin/staff', {
      method: 'POST',
      body: {
        name: data.name,
        nameEn: data.nameEn ?? null,
        photoUrl: data.photoUrl ?? null,
        serviceIds: data.serviceIds ?? [],
      },
    })
    await refresh()
  }

  async function updateStaff(id: string, patch: Partial<StaffMember>): Promise<void> {
    await $fetch(`/api/admin/staff/${id}`, {
      method: 'PATCH',
      body: patch,
    })
    await refresh()
  }

  async function removeStaff(id: string): Promise<void> {
    await $fetch(`/api/admin/staff/${id}`, { method: 'DELETE' })
    await refresh()
  }

  return {
    staff,
    services,
    addStaff,
    updateStaff,
    removeStaff,
    isLoading: pending,
    error,
    refresh,
  }
}
