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
    const bookingsRef = ref([...mockBookings])
    useFetchMock.mockImplementation((url: string) => {
      if (url === '/api/admin/bookings') {
        return {
          data: bookingsRef,
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
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('loads all 8 mock bookings', () => {
    const { bookings } = useBookings()
    expect(bookings.value.length).toBe(8)
  })

  it('activeFilter defaults to "all"', () => {
    const { activeFilter } = useBookings()
    expect(activeFilter.value).toBe('all')
  })

  it('filteredBookings returns all when filter is "all"', () => {
    const { bookings, filteredBookings } = useBookings()
    expect(filteredBookings.value.length).toBe(bookings.value.length)
  })

  it('filteredBookings returns only pending when filter is "pending"', () => {
    const { activeFilter, filteredBookings } = useBookings()
    activeFilter.value = 'pending'
    expect(filteredBookings.value.length).toBeGreaterThan(0)
    expect(filteredBookings.value.every(b => b.status === 'pending')).toBe(true)
  })

  it('filteredBookings returns only confirmed when filter is "confirmed"', () => {
    const { activeFilter, filteredBookings } = useBookings()
    activeFilter.value = 'confirmed'
    expect(filteredBookings.value.every(b => b.status === 'confirmed')).toBe(true)
  })

  it('bookingsByDate: first group is today (2026-03-01)', () => {
    const { bookingsByDate } = useBookings()
    expect(bookingsByDate.value[0].date).toBe('2026-03-01')
  })

  it('bookingsByDate: future groups appear before past groups', () => {
    const { bookingsByDate } = useBookings()
    const groups = bookingsByDate.value
    const futureIdx = groups.findIndex(g => g.date > '2026-03-01')
    const pastIdx = groups.findIndex(g => g.date < '2026-03-01')
    expect(futureIdx).toBeGreaterThan(-1)
    expect(pastIdx).toBeGreaterThan(-1)
    expect(futureIdx).toBeLessThan(pastIdx)
  })

  it('bookingsByDate: future dates are sorted ascending', () => {
    const { bookingsByDate } = useBookings()
    const futureDates = bookingsByDate.value
      .filter(g => g.date > '2026-03-01')
      .map(g => g.date)
    for (let i = 1; i < futureDates.length; i++) {
      expect(futureDates[i] >= futureDates[i - 1]).toBe(true)
    }
  })

  it('bookingsByDate: each group contains only bookings for that date', () => {
    const { bookingsByDate } = useBookings()
    for (const group of bookingsByDate.value) {
      expect(group.bookings.every(b => b.date === group.date)).toBe(true)
    }
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
