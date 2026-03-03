// server/api/admin/categories/[id].delete.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const categoryId = getRouterParam(event, 'id')!

  const result = await deleteCategory(event, categoryId, tenantId)

  if (!result.success) {
    throw createError({
      statusCode: 409,
      message: `Category has ${result.count} service(s) — remove them first`,
    })
  }

  return { ok: true }
})
