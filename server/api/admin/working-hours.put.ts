// server/api/admin/working-hours.put.ts
// PUT body: { days: WorkingHoursDay[], staffId?: string }. Upserts 7 rows for tenant + staff_id.

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const body = await readBody(event)
  const days = body?.days as Array<{ dayOfWeek: number; startTime: string; endTime: string; isWorking: boolean }> | undefined
  const staffId = body?.staffId as string | undefined ?? null

  if (!Array.isArray(days) || days.length !== 7) {
    throw createError({ statusCode: 400, statusMessage: 'days must be an array of 7 items' })
  }

  const client = await getServerClient(event)

  // Delete existing rows for this tenant + staff so we can insert clean set
  let deleteQ = client.from('working_hours').delete().eq('tenant_id', tenantId)
  deleteQ = staffId === null ? deleteQ.is('staff_id', null) : deleteQ.eq('staff_id', staffId)
  await deleteQ

  const rows = days.map((d) => ({
    tenant_id: tenantId,
    staff_id: staffId,
    day_of_week: d.dayOfWeek,
    start_time: d.startTime,
    end_time: d.endTime,
    is_working: d.isWorking,
  }))

  const { error } = await client.from('working_hours').insert(rows)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { ok: true }
})
