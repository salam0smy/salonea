// server/api/admin/working-hours.get.ts
// GET ?staffId=uuid optional. Omit for salon default (staff_id IS NULL).
// Returns 7 WorkingHoursDay (0=Sun .. 6=Sat). Missing days get default 09:00–21:00, isWorking: true.

const DEFAULT_START = '09:00'
const DEFAULT_END = '21:00'

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const query = getQuery(event)
  const staffId = (query.staffId as string) || null

  const client = await getServerClient(event)
  let q = client
    .from('working_hours')
    .select('day_of_week, start_time, end_time, is_working')
    .eq('tenant_id', tenantId)
  q = staffId === null ? q.is('staff_id', null) : q.eq('staff_id', staffId)
  const { data: rows } = await q

  const byDay: Record<number, { start_time: string; end_time: string; is_working: boolean }> = {}
  for (const r of rows ?? []) {
    const row = r as { day_of_week: number; start_time: string; end_time: string; is_working: boolean }
    byDay[row.day_of_week] = {
      start_time: row.start_time.slice(0, 5),
      end_time: row.end_time.slice(0, 5),
      is_working: row.is_working,
    }
  }

  const result = []
  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
    const d = byDay[dayOfWeek]
    result.push({
      dayOfWeek,
      startTime: d?.start_time ?? DEFAULT_START,
      endTime: d?.end_time ?? DEFAULT_END,
      isWorking: d?.is_working ?? true,
    })
  }
  return result
})
