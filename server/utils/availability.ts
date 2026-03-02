// server/utils/availability.ts — pure function, no I/O

export interface WorkingWindow {
  startTime: string // '09:00'
  endTime: string   // '18:00'
}

export interface OccupiedRange {
  startTime: string // '09:30'
  durationMinutes: number
}

// Convert 'HH:MM' to minutes since midnight
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

// Convert minutes since midnight to 'HH:MM'
function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Pure function — no I/O. Returns available time slots for a given working window,
 * service duration, and list of already-occupied ranges.
 *
 * @param window  The staff's working hours for the day (null = not working)
 * @param serviceDurationMinutes  How long the requested service takes
 * @param occupied  List of already-booked ranges (bookings + time blocks)
 * @returns Array of 'HH:MM' start times that are available
 */
export function computeAvailableSlots(
  window: WorkingWindow | null,
  serviceDurationMinutes: number,
  occupied: OccupiedRange[],
): string[] {
  if (!window) return []

  const start = toMinutes(window.startTime)
  const end = toMinutes(window.endTime)
  const slotInterval = 30 // offer slots every 30 minutes

  const occupiedRanges = occupied.map(o => ({
    start: toMinutes(o.startTime),
    end: toMinutes(o.startTime) + o.durationMinutes,
  }))

  const slots: string[] = []
  for (let t = start; t + serviceDurationMinutes <= end; t += slotInterval) {
    const slotEnd = t + serviceDurationMinutes
    const hasOverlap = occupiedRanges.some(r => t < r.end && slotEnd > r.start)
    if (!hasOverlap) {
      slots.push(fromMinutes(t))
    }
  }
  return slots
}
