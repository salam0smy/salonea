// server/api/admin/bookings/index.get.ts
import type { BookingStatus } from '~/types'

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const query = getQuery(event)
  return getBookingsByTenant(event, tenantId, {
    date: query.date as string | undefined,
    status: query.status as BookingStatus | undefined,
  })
})
