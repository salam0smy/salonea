// server/api/admin/categories/index.post.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const body = await readBody(event)
  const category = await createCategory(event, tenantId, {
    name: body.name,
    name_en: body.nameEn ?? null,
    sort_order: body.sortOrder ?? 0,
  })
  if (!category) throw createError({ statusCode: 500 })
  return category
})
