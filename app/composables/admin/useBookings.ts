// app/composables/admin/useBookings.ts
import { ref, computed } from 'vue'
import type { Booking, BookingStatus } from '~/types'

export function useBookings() {
  const { data: bookings, pending, error, refresh } =
    useFetch<Booking[]>('/api/admin/bookings', { default: () => [] })

  const activeFilter = ref<BookingStatus | 'all'>('all')

  const filteredBookings = computed(() => {
    const list = bookings.value ?? []
    return activeFilter.value === 'all'
      ? list
      : list.filter(b => b.status === activeFilter.value)
  })

  const bookingsByDate = computed(() => {
    const today = new Date().toISOString().split('T')[0] ?? ''

    const map = new Map<string, Booking[]>()
    for (const booking of filteredBookings.value) {
      const list = map.get(booking.date) ?? []
      map.set(booking.date, [...list, booking])
    }

    const classify = (d: string): number =>
      d === today ? 0 : d > today ? 1 : 2

    return [...map.entries()]
      .map(([date, items]) => ({ date, bookings: items }))
      .sort((a, b) => {
        const ca = classify(a.date)
        const cb = classify(b.date)
        if (ca !== cb) return ca - cb
        if (ca === 1) return a.date < b.date ? -1 : 1
        if (ca === 2) return a.date > b.date ? -1 : 1
        return 0
      })
  })

  async function confirmBooking(id: string): Promise<void> {
    await $fetch(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status: 'confirmed' },
    })
    await refresh()
  }

  async function cancelBooking(id: string): Promise<void> {
    await $fetch(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status: 'cancelled' },
    })
    await refresh()
  }

  async function completeBooking(id: string): Promise<void> {
    await $fetch(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status: 'completed' },
    })
    await refresh()
  }

  return {
    bookings,
    activeFilter,
    filteredBookings,
    bookingsByDate,
    confirmBooking,
    cancelBooking,
    completeBooking,
    isLoading: pending,
    error,
    refresh,
  }
}
