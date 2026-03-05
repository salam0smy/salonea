// app/composables/admin/useWorkingHours.ts
import type { Ref } from 'vue'
import type { WorkingHoursDay } from '~/types'

/**
 * Fetches and saves working hours for the current tenant.
 * @param staffId - Optional. Omit for salon default; pass ref or id for staff-specific hours.
 */
export function useWorkingHours(staffId?: Ref<string | null> | string | null) {
  const id = computed(() => {
    if (staffId === undefined || staffId === null) return null
    if (typeof staffId === 'object' && 'value' in staffId) return staffId.value ?? null
    return staffId as string
  })

  const url = computed(() => {
    const sid = id.value
    return sid ? `/api/admin/working-hours?staffId=${sid}` : '/api/admin/working-hours'
  })

  const { data: workingHours, pending, refresh } = useFetch<WorkingHoursDay[]>(url, {
    default: () => [],
  })

  async function save(days: WorkingHoursDay[]): Promise<void> {
    const body = { days, staffId: id.value ?? undefined }
    await $fetch('/api/admin/working-hours', { method: 'PUT', body } as Record<string, unknown>)
    await refresh()
  }

  return {
    workingHours,
    save,
    isLoading: pending,
    refresh,
  }
}
