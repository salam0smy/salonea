// tests/server/utils/availability.test.ts
import { describe, it, expect } from 'vitest'
import { computeAvailableSlots, type WorkingWindow, type OccupiedRange } from '../../../server/utils/availability'

describe('computeAvailableSlots', () => {
  // Working 09:00 - 12:00, 30-min slots, no bookings
  const window: WorkingWindow = { startTime: '09:00', endTime: '12:00' }
  const noBookings: OccupiedRange[] = []

  it('returns all 30-min slots when there are no bookings', () => {
    const slots = computeAvailableSlots(window, 30, noBookings)
    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'])
  })

  it('removes slots that would overlap with an existing booking', () => {
    // 60-min service booked at 09:30 → 09:30 and 09:00 are both blocked
    // (09:00 would overlap because 09:00 + 60 min > 09:30)
    const bookings: OccupiedRange[] = [{ startTime: '09:30', durationMinutes: 60 }]
    const slots = computeAvailableSlots(window, 60, bookings)
    // 09:00: would end at 10:00 → overlaps with 09:30 booking → ✗
    // 09:30: blocked (is a booking start) → ✗
    // 10:30: 10:30 + 60 = 11:30 ≤ 12:00, no overlap → ✓
    // 11:30: 11:30 + 60 = 12:30 > 12:00 → ✗ (past closing)
    expect(slots).toContain('10:30')
    expect(slots).not.toContain('09:00')
    expect(slots).not.toContain('09:30')
    expect(slots).not.toContain('11:30')
  })

  it('returns empty when service duration exceeds window', () => {
    const smallWindow: WorkingWindow = { startTime: '09:00', endTime: '09:20' }
    const slots = computeAvailableSlots(smallWindow, 30, noBookings)
    expect(slots).toEqual([])
  })

  it('returns empty when is_working is false', () => {
    const slots = computeAvailableSlots(null, 60, noBookings)
    expect(slots).toEqual([])
  })
})
