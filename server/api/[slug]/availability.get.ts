// server/api/[slug]/availability.get.ts

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const tenant = await getTenantBySlug(event, slug)
  if (!tenant) throw createError({ statusCode: 404, statusMessage: 'Salon not found' })

  const query = getQuery(event)
  const date = query.date as string
  const serviceId = query.serviceId as string
  const staffId = (query.staffId as string) || null

  if (!date || !serviceId) {
    throw createError({ statusCode: 400, statusMessage: 'date and serviceId are required' })
  }

  // Get the service's duration
  const client = await getServerClient(event)
  const { data: service } = await client
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .eq('tenant_id', tenant.id)
    .single()

  if (!service) throw createError({ statusCode: 404, statusMessage: 'Service not found' })

  const [window, occupied] = await Promise.all([
    getWorkingWindow(event, tenant.id, staffId, date),
    getOccupiedRanges(event, tenant.id, staffId, date),
  ])

  const slotStrings = computeAvailableSlots(window, service.duration_minutes, occupied)
  const slots = slotStrings.map((time: string) => ({ time, available: true }))

  return { date, slots }
})
