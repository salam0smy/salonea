// server/middleware/tenant.ts
export default defineEventHandler(async (event) => {
  const slug = resolveTenantSlugFromPath(event.path)

  if (!slug) return

  // TODO: look up tenantId from slug in the database
  // For now, attach the slug so API routes can use it during development
  event.context.tenantSlug = slug
})
