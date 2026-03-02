// server/api/[slug]/bookings.post.ts
// Public endpoint — customers create bookings without authentication
export default defineEventHandler(async (event) => {
  const tenantId = event.context.tenantId as string | undefined
  if (!tenantId) throw createError({ statusCode: 404 })

  const body = await readBody(event)
  if (!body.serviceId || !body.date || !body.time || !body.customerName || !body.customerPhone) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const booking = await createBooking(event, {
    tenantId,
    serviceId: body.serviceId,
    staffId: body.staffId ?? null,
    date: body.date,
    time: body.time,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
  })

  if (!booking) throw createError({ statusCode: 500, statusMessage: 'Failed to create booking' })
  return booking
})
