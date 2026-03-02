// server/middleware/tenant.ts
export default defineEventHandler(async (event) => {
  const slug = resolveTenantSlugFromPath(event.path)
  if (!slug) return

  const tenant = await getTenantBySlug(event, slug)
  if (!tenant) return  // 404 handled by the route, not middleware

  event.context.tenantSlug = slug
  event.context.tenantId = tenant.id
})
