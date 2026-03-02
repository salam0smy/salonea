// server/api/admin/categories/index.get.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  return getCategoriesByTenant(event, tenantId)
})
