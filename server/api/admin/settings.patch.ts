// server/api/admin/settings.patch.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const body = await readBody(event)
  // Map camelCase body to snake_case for DB
  const patch: Record<string, unknown> = {}
  if (body.paymentMode !== undefined) patch.payment_mode = body.paymentMode
  if (body.depositPercent !== undefined) patch.deposit_percent = body.depositPercent
  if (body.maxAdvanceDays !== undefined) patch.max_advance_days = body.maxAdvanceDays
  const updated = await updateTenantSettings(event, tenantId, patch)
  if (!updated) throw createError({ statusCode: 500 })
  return updated
})
