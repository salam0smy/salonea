// server/api/admin/settings.get.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const settings = await getTenantSettings(event, tenantId)
  if (!settings) throw createError({ statusCode: 404 })
  return settings
})
