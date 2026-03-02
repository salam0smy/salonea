// server/api/admin/services/[id].patch.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const serviceId = getRouterParam(event, 'id')!
  const body = await readBody(event)

  // Map camelCase request body to snake_case DB patch
  const patch: Record<string, unknown> = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.nameEn !== undefined) patch.name_en = body.nameEn
  if (body.description !== undefined) patch.description = body.description
  if (body.price !== undefined) patch.price = body.price
  if (body.durationMinutes !== undefined) patch.duration_minutes = body.durationMinutes
  if (body.isActive !== undefined) patch.is_active = body.isActive
  if (body.sortOrder !== undefined) patch.sort_order = body.sortOrder
  if (body.categoryId !== undefined) patch.category_id = body.categoryId

  const updated = await updateService(event, serviceId, tenantId, patch)
  if (!updated) throw createError({ statusCode: 404 })
  return updated
})
