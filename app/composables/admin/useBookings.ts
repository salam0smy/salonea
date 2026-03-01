// app/composables/admin/useBookings.ts
import { ref, computed } from 'vue'
import { mockBookings } from '~/data/mock'
import type { Booking, BookingStatus } from '~/types'

export function useBookings() {
  const bookings = ref<Booking[]>([...mockBookings])
  const activeFilter = ref<BookingStatus | 'all'>('all')

  const filteredBookings = computed(() =>
    activeFilter.value === 'all'
      ? bookings.value
      : bookings.value.filter(b => b.status === activeFilter.value),
  )

  const bookingsByDate = computed(() => {
    const today = new Date().toISOString().split('T')[0]

    // Group bookings by date
    const map = new Map<string, Booking[]>()
    for (const booking of filteredBookings.value) {
      const list = map.get(booking.date) ?? []
      map.set(booking.date, [...list, booking])
    }

    // Sort: today (0) → future ascending (1) → past descending (2)
    const classify = (d: string): number =>
      d === today ? 0 : d > today ? 1 : 2

    return [...map.entries()]
      .map(([date, items]) => ({ date, bookings: items }))
      .sort((a, b) => {
        const ca = classify(a.date)
        const cb = classify(b.date)
        if (ca !== cb) return ca - cb
        if (ca === 1) return a.date < b.date ? -1 : 1  // future: ascending
        if (ca === 2) return a.date > b.date ? -1 : 1  // past: descending
        return 0
      })
  })

  function confirmBooking(id: string): void {
    bookings.value = bookings.value.map(b =>
      b.id === id && b.status === 'pending' ? { ...b, status: 'confirmed' } : b,
    )
  }

  function cancelBooking(id: string): void {
    bookings.value = bookings.value.map(b =>
      b.id === id && b.status !== 'completed' && b.status !== 'cancelled'
        ? { ...b, status: 'cancelled' }
        : b,
    )
  }

  function completeBooking(id: string): void {
    bookings.value = bookings.value.map(b =>
      b.id === id && b.status === 'confirmed' ? { ...b, status: 'completed' } : b,
    )
  }

  return {
    bookings,
    activeFilter,
    filteredBookings,
    bookingsByDate,
    confirmBooking,
    cancelBooking,
    completeBooking,
  }
}
