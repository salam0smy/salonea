// server/api/admin/staff/index.post.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const body = await readBody(event)
  const member = await createStaff(event, tenantId, {
    name: body.name,
    name_en: body.nameEn ?? null,
    photo_url: body.photoUrl ?? null,
    serviceIds: body.serviceIds ?? [],
  })
  if (!member) throw createError({ statusCode: 500 })
  return member
})
