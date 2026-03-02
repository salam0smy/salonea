// server/api/admin/staff/index.get.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  return getStaffByTenant(event, tenantId, false)
})
