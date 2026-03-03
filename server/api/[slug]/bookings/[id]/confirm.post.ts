// server/api/[slug]/bookings/[id]/confirm.post.ts

export default defineEventHandler(async (event) => {
  const bookingId = getRouterParam(event, 'id')
  const tenantId = event.context.tenantId as string | undefined

  if (!bookingId || !tenantId) throw createError({ statusCode: 404 })

  const updated = await updateBookingStatus(event, bookingId, tenantId, 'confirmed')
  if (!updated) throw createError({ statusCode: 422, statusMessage: 'Could not confirm booking' })

  return { success: true }
})
