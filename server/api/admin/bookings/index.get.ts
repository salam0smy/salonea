// server/api/admin/bookings/index.get.ts
import type { BookingStatus } from '~/types'

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const query = getQuery(event)
  const page = query.page ? Number(query.page) : undefined
  const limit = query.limit ? Number(query.limit) : undefined
  return getBookingsByTenant(event, tenantId, {
    date: query.date as string | undefined,
    from: query.from as string | undefined,
    to: query.to as string | undefined,
    status: query.status as BookingStatus | undefined,
    search: typeof query.search === 'string' ? query.search : undefined,
    page: Number.isFinite(page) && page >= 1 ? page : undefined,
    limit: Number.isFinite(limit) && limit >= 1 ? limit : undefined,
  })
})
