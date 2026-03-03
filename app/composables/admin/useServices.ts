// app/composables/admin/useServices.ts
import { computed } from 'vue'
import type { Service, ServiceCategory } from '~/types'

export type NewServiceData = Omit<Service, 'id' | 'tenantId'>

export type NewCategoryData = {
  name: string
  nameEn: string | null
  sortOrder: number
}

export function useServices() {
  const { data: categories, pending: categoriesPending, error: categoriesError, refresh: refreshCategories } =
    useFetch<ServiceCategory[]>('/api/admin/categories', { default: () => [] })

  const { data: services, pending: servicesPending, error: servicesError, refresh: refreshServices } =
    useFetch<Service[]>('/api/admin/services', { default: () => [] })

  const servicesByCategory = computed(() =>
    [...(categories.value ?? [])]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(category => ({
        category,
        services: (services.value ?? []).filter(s => s.categoryId === category.id),
      }))
      .filter(group => group.services.length > 0),
  )

  async function addService(data: NewServiceData): Promise<void> {
    await $fetch('/api/admin/services', {
      method: 'POST',
      body: {
        categoryId: data.categoryId,
        name: data.name,
        nameEn: data.nameEn ?? null,
        description: data.description ?? null,
        price: data.price,
        durationMinutes: data.durationMinutes,
        sortOrder: 0,
      },
    })
    await refreshServices()
  }

  async function updateService(id: string, patch: Partial<Service>): Promise<void> {
    await $fetch(`/api/admin/services/${id}`, {
      method: 'PATCH',
      body: patch,
    })
    await refreshServices()
  }

  async function removeService(id: string): Promise<void> {
    await $fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
    await refreshServices()
  }

  async function addCategory(data: NewCategoryData): Promise<void> {
    await $fetch('/api/admin/categories', {
      method: 'POST',
      body: {
        name: data.name,
        nameEn: data.nameEn ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
    })
    await refreshCategories()
  }

  async function updateCategory(id: string, patch: Partial<NewCategoryData>): Promise<void> {
    await $fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      body: patch,
    })
    await refreshCategories()
  }

  async function removeCategory(id: string): Promise<void> {
    await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    await refreshCategories()
  }

  const isLoading = computed(() => categoriesPending.value || servicesPending.value)
  const error = computed(() => categoriesError.value || servicesError.value)

  return {
    categories,
    services,
    servicesByCategory,
    addService,
    updateService,
    removeService,
    addCategory,
    updateCategory,
    removeCategory,
    isLoading,
    error,
    refreshCategories,
    refreshServices,
  }
}
