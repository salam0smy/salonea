// server/api/admin/services/index.post.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const body = await readBody(event)
  const service = await createService(event, tenantId, {
    category_id: body.categoryId,
    name: body.name,
    name_en: body.nameEn ?? null,
    description: body.description ?? null,
    price: body.price,
    duration_minutes: body.durationMinutes,
    sort_order: body.sortOrder ?? 0,
  })
  if (!service) throw createError({ statusCode: 500 })
  return service
})
