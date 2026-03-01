// tests/app/composables/admin/useServices.test.ts
import { describe, it, expect } from 'vitest'
import { useServices } from '~/composables/admin/useServices'

describe('useServices', () => {
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
    // groups must be in ascending sortOrder
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i].category.sortOrder).toBeGreaterThan(
        groups[i - 1].category.sortOrder,
      )
    }
  })

  it('omits categories that have no services', () => {
    const { servicesByCategory, services } = useServices()
    // remove all services from first category
    const firstCatId = servicesByCategory.value[0].category.id
    services.value = services.value.filter(s => s.categoryId !== firstCatId)
    const ids = servicesByCategory.value.map(g => g.category.id)
    expect(ids).not.toContain(firstCatId)
  })

  it('addService appends a new service with a generated id', () => {
    const { services, addService } = useServices()
    const before = services.value.length
    addService({
      categoryId: 'cat-hair',
      name: 'تجربة',
      nameEn: null,
      description: null,
      price: 100,
      durationMinutes: 30,
      isActive: true,
    })
    expect(services.value.length).toBe(before + 1)
    const added = services.value[services.value.length - 1]
    expect(added.id).toBeTruthy()
    expect(added.name).toBe('تجربة')
  })

  it('updateService patches an existing service by id', () => {
    const { services, updateService } = useServices()
    const id = services.value[0].id
    updateService(id, { price: 999 })
    expect(services.value.find(s => s.id === id)?.price).toBe(999)
  })

  it('removeService deletes the service with the given id', () => {
    const { services, removeService } = useServices()
    const before = services.value.length
    const id = services.value[0].id
    removeService(id)
    expect(services.value.length).toBe(before - 1)
    expect(services.value.find(s => s.id === id)).toBeUndefined()
  })

  it('each call to useServices returns independent state', () => {
    const a = useServices()
    const b = useServices()
    a.removeService(a.services.value[0].id)
    // b is unaffected
    expect(b.services.value.length).toBe(a.services.value.length + 1)
  })
})
