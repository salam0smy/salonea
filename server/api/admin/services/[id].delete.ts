// server/api/admin/services/[id].delete.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const serviceId = getRouterParam(event, 'id')!
  const ok = await deleteService(event, serviceId, tenantId)
  if (!ok) throw createError({ statusCode: 404 })
  return { success: true }
})
