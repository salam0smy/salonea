// server/api/[slug]/services.get.ts
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const tenant = await getTenantBySlug(event, slug)
  if (!tenant) throw createError({ statusCode: 404, statusMessage: 'Salon not found' })

  const [categories, services] = await Promise.all([
    getCategoriesByTenant(event, tenant.id),
    getServicesByTenant(event, tenant.id, true),  // active only for customers
  ])

  return { categories, services }
})
