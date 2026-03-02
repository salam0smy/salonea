// server/api/admin/tenant.get.ts
export default defineEventHandler(async (event) => {
  const { userId } = await requireAdmin(event)
  const tenant = await getTenantByUserId(event, userId)
  if (!tenant) throw createError({ statusCode: 404 })
  return tenant
})
