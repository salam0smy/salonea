// server/utils/requireAdmin.ts
import { serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

export async function requireAdmin(event: H3Event): Promise<{ userId: string; tenantId: string }> {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const tenant = await getTenantByUserId(event, user.id)
  if (!tenant) throw createError({ statusCode: 403, statusMessage: 'Not a tenant admin' })

  return { userId: user.id, tenantId: tenant.id }
}
