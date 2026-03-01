// tests/app/composables/admin/useBookings.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useBookings } from '~/composables/admin/useBookings'

describe('useBookings', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-01'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  // ── Loading ────────────────────────────────────────────────

  it('loads all 8 mock bookings', () => {
    const { bookings } = useBookings()
    expect(bookings.value.length).toBe(8)
  })

  // ── Filter ────────────────────────────────────────────────

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

  // ── Date grouping ─────────────────────────────────────────

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

  // ── Status transitions ────────────────────────────────────

  it('confirmBooking: transitions pending → confirmed', () => {
    const { bookings, confirmBooking } = useBookings()
    const pending = bookings.value.find(b => b.status === 'pending')!
    confirmBooking(pending.id)
    expect(bookings.value.find(b => b.id === pending.id)?.status).toBe('confirmed')
  })

  it('confirmBooking: no-op on a confirmed booking', () => {
    const { bookings, confirmBooking } = useBookings()
    const confirmed = bookings.value.find(b => b.status === 'confirmed')!
    confirmBooking(confirmed.id)
    expect(bookings.value.find(b => b.id === confirmed.id)?.status).toBe('confirmed')
  })

  it('cancelBooking: transitions pending → cancelled', () => {
    const { bookings, cancelBooking } = useBookings()
    const pending = bookings.value.find(b => b.status === 'pending')!
    cancelBooking(pending.id)
    expect(bookings.value.find(b => b.id === pending.id)?.status).toBe('cancelled')
  })

  it('cancelBooking: transitions confirmed → cancelled', () => {
    const { bookings, cancelBooking } = useBookings()
    const confirmed = bookings.value.find(b => b.status === 'confirmed')!
    cancelBooking(confirmed.id)
    expect(bookings.value.find(b => b.id === confirmed.id)?.status).toBe('cancelled')
  })

  it('cancelBooking: no-op on completed booking', () => {
    const { bookings, cancelBooking } = useBookings()
    const completed = bookings.value.find(b => b.status === 'completed')!
    cancelBooking(completed.id)
    expect(bookings.value.find(b => b.id === completed.id)?.status).toBe('completed')
  })

  it('cancelBooking: no-op on already-cancelled booking', () => {
    const { bookings, cancelBooking } = useBookings()
    const cancelled = bookings.value.find(b => b.status === 'cancelled')!
    cancelBooking(cancelled.id)
    expect(bookings.value.find(b => b.id === cancelled.id)?.status).toBe('cancelled')
  })

  it('completeBooking: transitions confirmed → completed', () => {
    const { bookings, completeBooking } = useBookings()
    const confirmed = bookings.value.find(b => b.status === 'confirmed')!
    completeBooking(confirmed.id)
    expect(bookings.value.find(b => b.id === confirmed.id)?.status).toBe('completed')
  })

  it('completeBooking: no-op on pending booking', () => {
    const { bookings, completeBooking } = useBookings()
    const pending = bookings.value.find(b => b.status === 'pending')!
    completeBooking(pending.id)
    expect(bookings.value.find(b => b.id === pending.id)?.status).toBe('pending')
  })

  // ── Isolation ─────────────────────────────────────────────

  it('each call to useBookings returns independent state', () => {
    const a = useBookings()
    const b = useBookings()
    const pending = a.bookings.value.find(bk => bk.status === 'pending')!
    a.confirmBooking(pending.id)
    // b is unaffected
    expect(b.bookings.value.find(bk => bk.id === pending.id)?.status).toBe('pending')
  })
})
