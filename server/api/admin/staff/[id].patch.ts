// server/api/admin/staff/[id].patch.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const staffId = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const updated = await updateStaff(event, staffId, tenantId, {
    name: body.name,
    name_en: body.nameEn,
    photo_url: body.photoUrl,
    is_active: body.isActive,
    serviceIds: body.serviceIds,
  })
  if (!updated) throw createError({ statusCode: 404 })
  return updated
})
