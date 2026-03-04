// server/api/setup.post.ts
import { serverSupabaseUser } from '#supabase/server'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const existing = await getTenantByUserId(event, user.id)
  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Already has a tenant',
      message: 'already_has_tenant',
    })
  }

  const body = await readBody(event).catch(() => ({}))
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const nameEn = typeof body.nameEn === 'string' ? body.nameEn.trim() || null : null
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const slug = typeof body.slug === 'string'
    ? body.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    : ''

  if (!name || !phone || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'name, phone and slug are required',
    })
  }
  if (!SLUG_REGEX.test(slug)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'slug must be lowercase letters, numbers and hyphens only',
    })
  }

  const client = await getServiceRoleClient(event)

  const { data: existingSlug } = await client
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (existingSlug) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Conflict',
      message: 'slug_taken',
    })
  }

  const { data: tenant, error: tenantError } = await client
    .from('tenants')
    .insert({
      slug,
      name,
      name_en: nameEn,
      phone: phone || null,
      brand_color: '#C9A87C',
    })
    .select('id')
    .single()

  if (tenantError || !tenant) {
    console.error('setup: tenant insert error', tenantError)
    throw createError({ statusCode: 500, statusMessage: 'Failed to create tenant' })
  }

  const { error: linkError } = await client
    .from('tenant_users')
    .insert({ user_id: user.id, tenant_id: tenant.id })

  if (linkError) {
    console.error('setup: tenant_users insert error', linkError)
    await client.from('tenants').delete().eq('id', tenant.id)
    throw createError({ statusCode: 500, statusMessage: 'Failed to link user to tenant' })
  }

  const { error: settingsError } = await client
    .from('tenant_settings')
    .insert({
      tenant_id: tenant.id,
      payment_mode: 'at_salon',
      max_advance_days: 30,
    })

  if (settingsError) {
    console.error('setup: tenant_settings insert error', settingsError)
    await client.from('tenant_users').delete().eq('tenant_id', tenant.id)
    await client.from('tenants').delete().eq('id', tenant.id)
    throw createError({ statusCode: 500, statusMessage: 'Failed to create tenant settings' })
  }

  return { ok: true, tenantId: tenant.id, slug }
})
