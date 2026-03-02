export default defineEventHandler(async (event) => {
  const tenantSlug = event.context.tenantSlug as string | undefined
  if (!tenantSlug) throw createError({ statusCode: 404, statusMessage: 'Salon not found' })

  const tenant = await getTenantBySlug(event, tenantSlug)
  if (!tenant) throw createError({ statusCode: 404, statusMessage: 'Salon not found' })

  return tenant
})
