// app/composables/admin/useServices.ts
import { ref, computed } from 'vue'
import { mockCategories, mockServices } from '~/data/mock'
import type { Service, ServiceCategory } from '~/types'

export type NewServiceData = Omit<Service, 'id' | 'tenantId'>

export function useServices() {
  const categories = ref<ServiceCategory[]>([...mockCategories])
  const services = ref<Service[]>([...mockServices])

  const servicesByCategory = computed(() =>
    [...categories.value]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(category => ({
        category,
        services: services.value.filter(s => s.categoryId === category.id),
      }))
      .filter(group => group.services.length > 0),
  )

  function addService(data: NewServiceData): void {
    const id = `s-${Date.now()}`
    services.value = [...services.value, { ...data, id, tenantId: 't1' }]
  }

  function updateService(id: string, patch: Partial<Service>): void {
    services.value = services.value.map(s =>
      s.id === id ? { ...s, ...patch } : s,
    )
  }

  function removeService(id: string): void {
    services.value = services.value.filter(s => s.id !== id)
  }

  return { categories, services, servicesByCategory, addService, updateService, removeService }
}
