// server/api/admin/staff/[id].delete.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const staffId = getRouterParam(event, 'id')!
  const ok = await deleteStaff(event, staffId, tenantId)
  if (!ok) throw createError({ statusCode: 404 })
  return { success: true }
})
