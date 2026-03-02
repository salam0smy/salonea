// server/utils/repositories/tenants.ts
import type { H3Event } from 'h3'
import type { Tenant, TenantSettings } from '~/types'

// ── Internal DB row shapes ────────────────────────────────────────────────────
interface TenantRow {
  id: string
  slug: string
  name: string
  name_en: string | null
  description: string | null
  logo_url: string | null
  brand_color: string
  phone: string | null
}

interface TenantSettingsRow {
  payment_mode: string
  deposit_percent: number | null
  max_advance_days: number
}

// ── Mappers ───────────────────────────────────────────────────────────────────
function mapTenant(row: TenantRow): Tenant {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameEn: row.name_en,
    description: row.description,
    logoUrl: row.logo_url,
    brandColor: row.brand_color,
    phone: row.phone,
  }
}

function mapSettings(row: TenantSettingsRow): TenantSettings {
  return {
    paymentMode: row.payment_mode as TenantSettings['paymentMode'],
    depositPercent: row.deposit_percent,
    maxAdvanceDays: row.max_advance_days,
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function getTenantBySlug(event: H3Event, slug: string): Promise<Tenant | null> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('tenants')
    .select('id, slug, name, name_en, description, logo_url, brand_color, phone')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return mapTenant(data as TenantRow)
}

export async function getTenantByUserId(event: H3Event, userId: string): Promise<Tenant | null> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('tenant_users')
    .select('tenants(id, slug, name, name_en, description, logo_url, brand_color, phone)')
    .eq('user_id', userId)
    .single()

  const row = data as any
  if (error || !row?.tenants) return null
  return mapTenant(row.tenants as TenantRow)
}

export async function updateTenant(event: H3Event, tenantId: string, patch: Partial<{
  name: string; name_en: string | null; description: string | null
  logo_url: string | null; brand_color: string; phone: string | null
}>): Promise<Tenant | null> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('tenants')
    .update(patch)
    .eq('id', tenantId)
    .select('id, slug, name, name_en, description, logo_url, brand_color, phone')
    .single()

  if (error || !data) return null
  return mapTenant(data as TenantRow)
}

export async function getTenantSettings(event: H3Event, tenantId: string): Promise<TenantSettings | null> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('tenant_settings')
    .select('payment_mode, deposit_percent, max_advance_days')
    .eq('tenant_id', tenantId)
    .single()

  if (error || !data) return null
  return mapSettings(data as TenantSettingsRow)
}

export async function updateTenantSettings(
  event: H3Event,
  tenantId: string,
  patch: Partial<{ payment_mode: string; deposit_percent: number | null; max_advance_days: number }>,
): Promise<TenantSettings | null> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('tenant_settings')
    .update(patch)
    .eq('tenant_id', tenantId)
    .select('payment_mode, deposit_percent, max_advance_days')
    .single()

  if (error || !data) return null
  return mapSettings(data as TenantSettingsRow)
}
