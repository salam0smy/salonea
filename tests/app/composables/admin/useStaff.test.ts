// tests/app/composables/admin/useStaff.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mockStaff, mockServices } from '~/data/mock'
import { useStaff } from '~/composables/admin/useStaff'

const { useFetchMock, fetchMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  fetchMock: vi.fn(),
}))

mockNuxtImport('useFetch', () => useFetchMock)

describe('useStaff', () => {
  beforeEach(() => {
    vi.stubGlobal('$fetch', fetchMock)
    const staffRef = ref([...mockStaff])
    const servicesRef = ref([...mockServices])
    useFetchMock.mockImplementation((url: string) => {
      if (url === '/api/admin/staff') {
        return {
          data: staffRef,
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

  it('loads all mock staff', () => {
    const { staff } = useStaff()
    expect(staff.value.length).toBeGreaterThan(0)
  })

  it('loads all mock services', () => {
    const { services } = useStaff()
    expect(services.value.length).toBeGreaterThan(0)
  })

  it('addStaff calls $fetch with POST and correct body', async () => {
    const { addStaff } = useStaff()
    await addStaff({
      name: 'هند',
      nameEn: null,
      photoUrl: null,
      serviceIds: ['s1', 's2'],
    })
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/staff', {
      method: 'POST',
      body: {
        name: 'هند',
        nameEn: null,
        photoUrl: null,
        serviceIds: ['s1', 's2'],
      },
    })
  })

  it('updateStaff calls $fetch with PATCH and patch body', async () => {
    const { staff, updateStaff } = useStaff()
    const id = staff.value[0].id
    await updateStaff(id, { nameEn: 'Updated Name' })
    expect(fetchMock).toHaveBeenCalledWith(`/api/admin/staff/${id}`, {
      method: 'PATCH',
      body: { nameEn: 'Updated Name' },
    })
  })

  it('removeStaff calls $fetch with DELETE', async () => {
    const { staff, removeStaff } = useStaff()
    const id = staff.value[0].id
    await removeStaff(id)
    expect(fetchMock).toHaveBeenCalledWith(`/api/admin/staff/${id}`, {
      method: 'DELETE',
    })
  })
})
