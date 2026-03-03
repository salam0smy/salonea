// server/api/admin/bookings/index.post.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const body = await readBody(event)
  const booking = await createBooking(event, {
    tenantId,
    serviceId: body.serviceId,
    staffId: body.staffId ?? null,
    date: body.date,
    time: body.time,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    paymentStatus: 'at_salon',
  })
  if (!booking) throw createError({ statusCode: 500, message: 'Failed to create booking' })
  return booking
})
