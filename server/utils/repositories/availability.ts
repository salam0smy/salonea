// server/utils/repositories/availability.ts
import type { H3Event } from 'h3'
import type { WorkingWindow, OccupiedRange } from '../availability'

interface WorkingHourRow {
  day_of_week: number
  start_time: string
  end_time: string
  is_working: boolean
  staff_id: string | null
}

// Returns the effective working window for a staff member on a given date.
// Staff-specific rows take precedence over salon-level defaults (null staff_id).
export async function getWorkingWindow(
  event: H3Event,
  tenantId: string,
  staffId: string | null,
  date: string,
): Promise<WorkingWindow | null> {
  const client = await getServerClient(event)
  const dayOfWeek = new Date(date).getDay()

  // Fetch both salon-default (staff_id is null) and staff-specific rows
  const { data } = await client
    .from('working_hours')
    .select('day_of_week, start_time, end_time, is_working, staff_id')
    .eq('tenant_id', tenantId)
    .eq('day_of_week', dayOfWeek)
    .or(staffId ? `staff_id.is.null,staff_id.eq.${staffId}` : 'staff_id.is.null')

  if (!data?.length) return null

  // Staff-specific row wins; fall back to salon default
  const staffRow = staffId ? (data as WorkingHourRow[]).find(r => r.staff_id === staffId) : undefined
  const row = (staffRow ?? (data as WorkingHourRow[]).find(r => !r.staff_id)) as WorkingHourRow | undefined

  if (!row || !row.is_working) return null
  return { startTime: row.start_time.slice(0, 5), endTime: row.end_time.slice(0, 5) }
}

interface BookingRow {
  time: string
  services: { duration_minutes: number } | null
}

interface TimeBlockRow {
  start_time: string | null
  end_time: string | null
  is_full_day: boolean
}

// Returns all occupied ranges for a staff member on a date (from bookings + time_blocks)
export async function getOccupiedRanges(
  event: H3Event,
  tenantId: string,
  staffId: string | null,
  date: string,
  excludeBookingId?: string,
): Promise<OccupiedRange[]> {
  const client = await getServerClient(event)

  // Bookings occupying time
  let bookingsQuery = client
    .from('bookings')
    .select('time, services(duration_minutes)')
    .eq('tenant_id', tenantId)
    .eq('date', date)
    .not('status', 'in', '("cancelled")')

  if (staffId) bookingsQuery = bookingsQuery.eq('staff_id', staffId)
  if (excludeBookingId) bookingsQuery = bookingsQuery.neq('id', excludeBookingId)

  // Time blocks
  let blocksQuery = client
    .from('time_blocks')
    .select('start_time, end_time, is_full_day')
    .eq('tenant_id', tenantId)
    .eq('date', date)

  if (staffId) {
    blocksQuery = blocksQuery.or(`staff_id.is.null,staff_id.eq.${staffId}`)
  } else {
    blocksQuery = blocksQuery.is('staff_id', null)
  }

  const [{ data: bookings }, { data: blocks }] = await Promise.all([bookingsQuery, blocksQuery])

  const ranges: OccupiedRange[] = []

  for (const b of (bookings ?? []) as BookingRow[]) {
    const duration = b.services?.duration_minutes ?? 60
    ranges.push({ startTime: b.time.slice(0, 5), durationMinutes: duration })
  }

  for (const block of (blocks ?? []) as TimeBlockRow[]) {
    if (block.is_full_day) {
      ranges.push({ startTime: '00:00', durationMinutes: 24 * 60 })
    } else if (block.start_time && block.end_time) {
      const start = block.start_time.slice(0, 5)
      const end = block.end_time.slice(0, 5)
      const [sh, sm] = start.split(':').map(Number)
      const [eh, em] = end.split(':').map(Number)
      const startMins = (sh ?? 0) * 60 + (sm ?? 0)
      const endMins = (eh ?? 0) * 60 + (em ?? 0)
      ranges.push({ startTime: start, durationMinutes: endMins - startMins })
    }
  }

  return ranges
}
