// tests/app/composables/admin/useBookings.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mockBookings } from '~/data/mock'
import { useBookings } from '~/composables/admin/useBookings'

const { useFetchMock, fetchMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  fetchMock: vi.fn(),
}))

mockNuxtImport('useFetch', () => useFetchMock)

describe('useBookings', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-01'))
    vi.stubGlobal('$fetch', fetchMock)
    const responseRef = ref({
      data: [...mockBookings],
      total: mockBookings.length,
    })
    useFetchMock.mockImplementation((url: string | { value: string }) => {
      const resolved = typeof url === 'object' && url && 'value' in url ? url.value : String(url)
      if (resolved.startsWith('/api/admin/bookings')) {
        return {
          data: responseRef,
          pending: ref(false),
          error: ref(null),
          refresh: vi.fn(),
        }
      }
      return {
        data: ref({ data: [], total: 0 }),
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn(),
      }
    })
    fetchMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('loads bookings from response data', () => {
    const { bookings } = useBookings()
    expect(bookings.value.length).toBe(mockBookings.length)
  })

  it('exposes total from response', () => {
    const { total } = useBookings()
    expect(total.value).toBe(mockBookings.length)
  })

  it('statusFilter defaults to "all"', () => {
    const { statusFilter } = useBookings()
    expect(statusFilter.value).toBe('all')
  })

  it('page defaults to 1, limit defaults to 10', () => {
    const { page, limit } = useBookings()
    expect(page.value).toBe(1)
    expect(limit.value).toBe(10)
  })

  it('confirmBooking calls $fetch with status confirmed', async () => {
    const { bookings, confirmBooking } = useBookings()
    const pending = bookings.value.find(b => b.status === 'pending')!
    await confirmBooking(pending.id)
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/admin/bookings/${pending.id}/status`,
      { method: 'PATCH', body: { status: 'confirmed' } },
    )
  })

  it('cancelBooking calls $fetch with status cancelled', async () => {
    const { bookings, cancelBooking } = useBookings()
    const pending = bookings.value.find(b => b.status === 'pending')!
    await cancelBooking(pending.id)
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/admin/bookings/${pending.id}/status`,
      { method: 'PATCH', body: { status: 'cancelled' } },
    )
  })

  it('completeBooking calls $fetch with status completed', async () => {
    const { bookings, completeBooking } = useBookings()
    const confirmed = bookings.value.find(b => b.status === 'confirmed')!
    await completeBooking(confirmed.id)
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/admin/bookings/${confirmed.id}/status`,
      { method: 'PATCH', body: { status: 'completed' } },
    )
  })
})
