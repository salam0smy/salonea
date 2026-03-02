// server/api/admin/bookings/[id]/status.patch.ts
import type { BookingStatus } from '~/types'

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const bookingId = getRouterParam(event, 'id')!
  const { status } = await readBody(event)

  const validStatuses: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']
  if (!validStatuses.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const updated = await updateBookingStatus(event, bookingId, tenantId, status)
  if (!updated) throw createError({ statusCode: 404 })
  return updated
})
