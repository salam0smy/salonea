// server/api/[slug]/staff.get.ts
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const tenant = await getTenantBySlug(event, slug)
  if (!tenant) throw createError({ statusCode: 404, statusMessage: 'Salon not found' })
  return getStaffByTenant(event, tenant.id, true)
})
