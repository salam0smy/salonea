// server/api/admin/tenant.patch.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const body = await readBody(event)
  const updated = await updateTenant(event, tenantId, body)
  if (!updated) throw createError({ statusCode: 500 })
  return updated
})
