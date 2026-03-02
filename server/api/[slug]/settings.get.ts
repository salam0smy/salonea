export default defineEventHandler(async (event) => {
  const tenantId = event.context.tenantId as string | undefined
  if (!tenantId) throw createError({ statusCode: 404, statusMessage: 'Salon not found' })

  const settings = await getTenantSettings(event, tenantId)
  if (!settings) throw createError({ statusCode: 404, statusMessage: 'Settings not found' })

  return settings
})
