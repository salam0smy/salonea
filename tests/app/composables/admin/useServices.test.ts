// tests/app/composables/admin/useServices.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mockCategories, mockServices } from '~/data/mock'
import { useServices } from '~/composables/admin/useServices'

const { useFetchMock, fetchMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  fetchMock: vi.fn(),
}))

mockNuxtImport('useFetch', () => useFetchMock)

describe('useServices', () => {
  beforeEach(() => {
    vi.stubGlobal('$fetch', fetchMock)
    const categoriesRef = ref([...mockCategories])
    const servicesRef = ref([...mockServices])
    useFetchMock.mockImplementation((url: string) => {
      if (url === '/api/admin/categories') {
        return {
          data: categoriesRef,
          pending: ref(false),
          error: ref(null),
          refresh: vi.fn(),
        }
      }
      if (url === '/api/admin/services') {
        return {
          data: servicesRef,
          pending: ref(false),
          error: ref(null),
          refresh: vi.fn(),
        }
      }
      return {
        data: ref([]),
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

  it('loads all mock services', () => {
    const { services } = useServices()
    expect(services.value.length).toBeGreaterThan(0)
  })

  it('loads all mock categories', () => {
    const { categories } = useServices()
    expect(categories.value.length).toBeGreaterThan(0)
  })

  it('groups services by category in sortOrder', () => {
    const { servicesByCategory } = useServices()
    const groups = servicesByCategory.value
    expect(groups.length).toBeGreaterThan(0)
    expect(groups[0].services.length).toBeGreaterThan(0)
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i].category.sortOrder).toBeGreaterThan(
        groups[i - 1].category.sortOrder,
      )
    }
  })

  it('omits categories that have no services', () => {
    const { servicesByCategory, services } = useServices()
    const firstCatId = servicesByCategory.value[0].category.id
    services.value = services.value.filter(s => s.categoryId !== firstCatId)
    const ids = servicesByCategory.value.map(g => g.category.id)
    expect(ids).not.toContain(firstCatId)
  })

  it('addService calls $fetch with POST and correct body', async () => {
    const { addService } = useServices()
    await addService({
      categoryId: 'cat-hair',
      name: 'تجربة',
      nameEn: null,
      description: null,
      price: 100,
      durationMinutes: 30,
      isActive: true,
    })
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/services', {
      method: 'POST',
      body: {
        categoryId: 'cat-hair',
        name: 'تجربة',
        nameEn: null,
        description: null,
        price: 100,
        durationMinutes: 30,
        sortOrder: 0,
      },
    })
  })

  it('updateService calls $fetch with PATCH and patch body', async () => {
    const { services, updateService } = useServices()
    const id = services.value[0].id
    await updateService(id, { price: 999 })
    expect(fetchMock).toHaveBeenCalledWith(`/api/admin/services/${id}`, {
      method: 'PATCH',
      body: { price: 999 },
    })
  })

  it('removeService calls $fetch with DELETE', async () => {
    const { services, removeService } = useServices()
    const id = services.value[0].id
    await removeService(id)
    expect(fetchMock).toHaveBeenCalledWith(`/api/admin/services/${id}`, {
      method: 'DELETE',
    })
  })
})
