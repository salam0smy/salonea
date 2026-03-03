// server/api/admin/categories/[id].patch.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const categoryId = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const patch: { name?: string; name_en?: string | null; sort_order?: number } = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.nameEn !== undefined) patch.name_en = body.nameEn
  if (body.sortOrder !== undefined) patch.sort_order = body.sortOrder

  const updated = await updateCategory(event, categoryId, tenantId, patch)
  if (!updated) throw createError({ statusCode: 404 })
  return updated
})
