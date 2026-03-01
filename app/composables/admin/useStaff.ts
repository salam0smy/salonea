// app/composables/admin/useStaff.ts
import { ref } from 'vue'
import { mockStaff, mockServices } from '~/data/mock'
import type { StaffMember, Service } from '~/types'

export type NewStaffData = Omit<StaffMember, 'id' | 'tenantId'>

export function useStaff() {
  const staff = ref<StaffMember[]>([...mockStaff])
  const services = ref<Service[]>([...mockServices])

  function addStaff(data: NewStaffData): void {
    const id = `st-${Date.now()}`
    staff.value = [...staff.value, { ...data, id, tenantId: 't1' }]
  }

  function updateStaff(id: string, patch: Partial<StaffMember>): void {
    staff.value = staff.value.map(s =>
      s.id === id ? { ...s, ...patch } : s,
    )
  }

  function removeStaff(id: string): void {
    staff.value = staff.value.filter(s => s.id !== id)
  }

  return { staff, services, addStaff, updateStaff, removeStaff }
}
