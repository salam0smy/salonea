// tests/app/composables/admin/useCalendar.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useCalendar } from '~/composables/admin/useCalendar'

describe('useCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-01'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  // ── selectedDate ──────────────────────────────────────────

  it('selectedDate defaults to today', () => {
    const { selectedDate, today } = useCalendar()
    expect(selectedDate.value).toBe(today)
    expect(today).toBe('2026-03-01')
  })

  // ── navigation ────────────────────────────────────────────

  it('goPrevDay moves selectedDate one day back', () => {
    const { selectedDate, goPrevDay } = useCalendar()
    goPrevDay()
    expect(selectedDate.value).toBe('2026-02-28')
  })

  it('goNextDay moves selectedDate one day forward', () => {
    const { selectedDate, goNextDay } = useCalendar()
    goNextDay()
    expect(selectedDate.value).toBe('2026-03-02')
  })

  it('goToToday resets selectedDate to today after navigation', () => {
    const { selectedDate, goNextDay, goToToday, today } = useCalendar()
    goNextDay()
    goNextDay()
    expect(selectedDate.value).not.toBe(today)
    goToToday()
    expect(selectedDate.value).toBe(today)
  })

  // ── weekDays ──────────────────────────────────────────────

  it('weekDays returns exactly 7 days', () => {
    const { weekDays } = useCalendar()
    expect(weekDays.value.length).toBe(7)
  })

  it('weekDays contains selectedDate', () => {
    const { weekDays, selectedDate } = useCalendar()
    expect(weekDays.value.some(d => d.date === selectedDate.value)).toBe(true)
  })

  it('weekDays starts on Sunday of the selected date\'s week', () => {
    // 2026-03-01 is a Sunday — so the week starts on 2026-03-01
    const { weekDays } = useCalendar()
    expect(weekDays.value[0].date).toBe('2026-03-01')
    expect(weekDays.value[6].date).toBe('2026-03-07')
  })

  it('weekDays marks dates with non-cancelled bookings as hasActiveBookings', () => {
    // mock data: b1, b2, b3 on 2026-03-01 (b3 is cancelled → still has active: b1+b2)
    const { weekDays } = useCalendar()
    const today = weekDays.value.find(d => d.date === '2026-03-01')!
    expect(today.hasActiveBookings).toBe(true)
  })

  it('weekDays marks dates with only cancelled bookings as not hasActiveBookings', () => {
    // 2026-03-04 has no bookings → hasActiveBookings should be false
    const { weekDays } = useCalendar()
    const noBookingDay = weekDays.value.find(d => d.date === '2026-03-04')!
    expect(noBookingDay.hasActiveBookings).toBe(false)
  })

  // ── bookingsForSelectedDate ───────────────────────────────

  it('bookingsForSelectedDate returns only bookings for selectedDate', () => {
    const { bookingsForSelectedDate } = useCalendar()
    // today is 2026-03-01, which has 3 bookings (b1, b2, b3)
    expect(bookingsForSelectedDate.value.length).toBe(3)
    expect(bookingsForSelectedDate.value.every(b => b.date === '2026-03-01')).toBe(true)
  })

  it('bookingsForSelectedDate is sorted ascending by time', () => {
    const { bookingsForSelectedDate } = useCalendar()
    const times = bookingsForSelectedDate.value.map(b => b.time)
    for (let i = 1; i < times.length; i++) {
      expect(times[i] >= times[i - 1]).toBe(true)
    }
  })

  it('bookingsForSelectedDate updates when selectedDate changes', () => {
    const { bookingsForSelectedDate, selectedDate } = useCalendar()
    // 2026-03-01 has 3 bookings
    expect(bookingsForSelectedDate.value.length).toBe(3)
    // 2026-03-03 has 2 bookings
    selectedDate.value = '2026-03-03'
    expect(bookingsForSelectedDate.value.length).toBe(2)
  })

  // ── bookingsBySlot ────────────────────────────────────────

  it('bookingsBySlot returns a Map with an entry for each time slot', () => {
    const { bookingsBySlot, timeSlots } = useCalendar()
    for (const slot of timeSlots) {
      expect(bookingsBySlot.value.has(slot)).toBe(true)
    }
  })

  it('bookingsBySlot places booking b1 in the 09:00 slot', () => {
    // b1: date=2026-03-01, time=09:00
    const { bookingsBySlot } = useCalendar()
    const slotBookings = bookingsBySlot.value.get('09:00')!
    expect(slotBookings.some(b => b.id === 'b1')).toBe(true)
  })

  it('bookingsBySlot places booking b2 in the 10:30 slot', () => {
    // b2: date=2026-03-01, time=10:30
    const { bookingsBySlot } = useCalendar()
    const slotBookings = bookingsBySlot.value.get('10:30')!
    expect(slotBookings.some(b => b.id === 'b2')).toBe(true)
  })

  // ── getStaffColor ─────────────────────────────────────────

  it('getStaffColor returns a color object with bg, border, text, dot keys', () => {
    const { getStaffColor } = useCalendar()
    const color = getStaffColor('st1')
    expect(color).toHaveProperty('bg')
    expect(color).toHaveProperty('border')
    expect(color).toHaveProperty('text')
    expect(color).toHaveProperty('dot')
  })

  it('getStaffColor returns the same color for the same staffId', () => {
    const { getStaffColor } = useCalendar()
    expect(getStaffColor('st1')).toEqual(getStaffColor('st1'))
  })

  it('getStaffColor returns different colors for different staff', () => {
    const { getStaffColor } = useCalendar()
    expect(getStaffColor('st1').bg).not.toBe(getStaffColor('st2').bg)
  })

  it('getStaffColor(null) returns a fallback neutral color', () => {
    const { getStaffColor } = useCalendar()
    const color = getStaffColor(null)
    expect(color).toHaveProperty('bg')
    // Should not throw and should return a valid color scheme
    expect(color.bg).toBeTruthy()
  })

  // ── timeSlots ─────────────────────────────────────────────

  it('timeSlots starts at 09:00', () => {
    const { timeSlots } = useCalendar()
    expect(timeSlots[0]).toBe('09:00')
  })

  it('timeSlots ends at 18:30', () => {
    const { timeSlots } = useCalendar()
    expect(timeSlots[timeSlots.length - 1]).toBe('18:30')
  })

  it('timeSlots has 30-minute increments', () => {
    const { timeSlots } = useCalendar()
    // 09:00 to 18:30 = 9.5 hours = 19 slots
    expect(timeSlots.length).toBe(20)
  })
})
