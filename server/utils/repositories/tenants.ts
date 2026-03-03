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

  if (error) {
    console.error('getTenantByUserId error:', error)
  }

  const row = data as { tenants: unknown }
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

// ── Payment settings row shape ─────────────────────────────────────────────

interface PaymentSettingsRow {
  moyasar_publishable_key: string | null
  moyasar_secret_key: string | null
  moyasar_webhook_secret: string | null
  is_connected: boolean
}

export interface PaymentSettingsInternal {
  isConnected: boolean
  publishableKey: string | null
  encryptedSecretKey: string | null
  encryptedWebhookSecret: string | null
}

// ── Public repository functions ────────────────────────────────────────────

/**
 * Returns payment settings for a tenant, including encrypted secrets.
 * Returns a disconnected default when no row exists.
 */
export async function getPaymentSettings(
  event: H3Event,
  tenantId: string,
): Promise<PaymentSettingsInternal> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('tenant_payment_settings')
    .select('moyasar_publishable_key, moyasar_secret_key, moyasar_webhook_secret, is_connected')
    .eq('tenant_id', tenantId)
    .eq('provider', 'moyasar')
    .maybeSingle()

  if (error || !data) {
    return { isConnected: false, publishableKey: null, encryptedSecretKey: null, encryptedWebhookSecret: null }
  }
  const row = data as PaymentSettingsRow
  return {
    isConnected: row.is_connected,
    publishableKey: row.moyasar_publishable_key,
    encryptedSecretKey: row.moyasar_secret_key,
    encryptedWebhookSecret: row.moyasar_webhook_secret,
  }
}

/**
 * Same as getPaymentSettings but queries by tenantId directly using the service role.
 * Used by the webhook handler which has no user session.
 */
export async function getPaymentSettingsByTenantId(
  event: H3Event,
  tenantId: string,
): Promise<PaymentSettingsInternal> {
  const client = await getServiceRoleClient(event)
  const { data, error } = await client
    .from('tenant_payment_settings')
    .select('moyasar_publishable_key, moyasar_secret_key, moyasar_webhook_secret, is_connected')
    .eq('tenant_id', tenantId)
    .eq('provider', 'moyasar')
    .maybeSingle()

  if (error || !data) {
    return { isConnected: false, publishableKey: null, encryptedSecretKey: null, encryptedWebhookSecret: null }
  }
  const row = data as PaymentSettingsRow
  return {
    isConnected: row.is_connected,
    publishableKey: row.moyasar_publishable_key,
    encryptedSecretKey: row.moyasar_secret_key,
    encryptedWebhookSecret: row.moyasar_webhook_secret,
  }
}

/** Upserts (insert or update) payment settings for a tenant. Sets is_connected = true. */
export async function upsertPaymentSettings(
  event: H3Event,
  tenantId: string,
  values: {
    publishableKey: string
    encryptedSecretKey: string
    encryptedWebhookSecret: string
  },
): Promise<void> {
  const client = await getServerClient(event)
  const { error } = await client
    .from('tenant_payment_settings')
    .upsert(
      {
        tenant_id: tenantId,
        provider: 'moyasar',
        moyasar_publishable_key: values.publishableKey,
        moyasar_secret_key: values.encryptedSecretKey,
        moyasar_webhook_secret: values.encryptedWebhookSecret,
        is_connected: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id,provider' },
    )
  if (error) throw new Error(`upsertPaymentSettings failed: ${error.message}`)
}

/** Deletes the payment settings row for a tenant (full disconnect). */
export async function clearPaymentSettings(event: H3Event, tenantId: string): Promise<void> {
  const client = await getServerClient(event)
  await client
    .from('tenant_payment_settings')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('provider', 'moyasar')
}
