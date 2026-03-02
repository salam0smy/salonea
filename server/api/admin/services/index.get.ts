// server/api/admin/services/index.get.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  return getServicesByTenant(event, tenantId, false)  // admin sees all, not just active
})
