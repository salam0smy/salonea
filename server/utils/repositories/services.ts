// server/utils/repositories/services.ts
import type { H3Event } from 'h3'
import type { Service, ServiceCategory } from '~/types'

// ── DB row shapes ─────────────────────────────────────────────────────────────
interface CategoryRow {
  id: string; tenant_id: string; name: string; name_en: string | null; sort_order: number
}

interface ServiceRow {
  id: string; tenant_id: string; category_id: string
  name: string; name_en: string | null; description: string | null
  price: number; duration_minutes: number; is_active: boolean; sort_order: number
}

// ── Mappers ───────────────────────────────────────────────────────────────────
function mapCategory(row: CategoryRow): ServiceCategory {
  return { id: row.id, tenantId: row.tenant_id, name: row.name, nameEn: row.name_en, sortOrder: row.sort_order }
}

function mapService(row: ServiceRow): Service {
  return {
    id: row.id, tenantId: row.tenant_id, categoryId: row.category_id,
    name: row.name, nameEn: row.name_en, description: row.description,
    price: row.price, durationMinutes: row.duration_minutes,
    isActive: row.is_active,
  }
}

// ── Categories ────────────────────────────────────────────────────────────────
export async function getCategoriesByTenant(event: H3Event, tenantId: string): Promise<ServiceCategory[]> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('service_categories')
    .select('id, tenant_id, name, name_en, sort_order')
    .eq('tenant_id', tenantId)
    .order('sort_order')

  if (error) return []
  return (data as CategoryRow[]).map(mapCategory)
}

export async function createCategory(event: H3Event, tenantId: string, payload: {
  name: string; name_en?: string | null; sort_order?: number
}): Promise<ServiceCategory | null> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('service_categories')
    .insert({ tenant_id: tenantId, name: payload.name, name_en: payload.name_en ?? null, sort_order: payload.sort_order ?? 0 })
    .select('id, tenant_id, name, name_en, sort_order')
    .single()

  if (error || !data) return null
  return mapCategory(data as CategoryRow)
}

export async function updateCategory(
  event: H3Event,
  categoryId: string,
  tenantId: string,
  patch: { name?: string; name_en?: string | null; sort_order?: number },
): Promise<ServiceCategory | null> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('service_categories')
    .update(patch)
    .eq('id', categoryId)
    .eq('tenant_id', tenantId)
    .select('id, tenant_id, name, name_en, sort_order')
    .single()

  if (error || !data) return null
  return mapCategory(data as CategoryRow)
}

export async function deleteCategory(
  event: H3Event,
  categoryId: string,
  tenantId: string,
): Promise<{ success: true } | { success: false; reason: 'has_services'; count: number }> {
  const client = await getServerClient(event)

  // Guard: count services in this category for this tenant
  const { count, error: countError } = await client
    .from('services')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .eq('tenant_id', tenantId)

  if (countError) return { success: false, reason: 'has_services', count: 0 }
  if ((count ?? 0) > 0) return { success: false, reason: 'has_services', count: count! }

  const { error } = await client
    .from('service_categories')
    .delete()
    .eq('id', categoryId)
    .eq('tenant_id', tenantId)

  if (error) return { success: false, reason: 'has_services', count: 0 }
  return { success: true }
}

// ── Services ──────────────────────────────────────────────────────────────────
export async function getServicesByTenant(event: H3Event, tenantId: string, activeOnly = true): Promise<Service[]> {
  const client = await getServerClient(event)
  let query = client
    .from('services')
    .select('id, tenant_id, category_id, name, name_en, description, price, duration_minutes, is_active, sort_order')
    .eq('tenant_id', tenantId)
    .order('sort_order')

  if (activeOnly) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) return []
  return (data as ServiceRow[]).map(mapService)
}

export async function createService(event: H3Event, tenantId: string, payload: {
  category_id: string; name: string; name_en?: string | null; description?: string | null
  price: number; duration_minutes: number; sort_order?: number
}): Promise<Service | null> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('services')
    .insert({ tenant_id: tenantId, ...payload })
    .select('id, tenant_id, category_id, name, name_en, description, price, duration_minutes, is_active, sort_order')
    .single()

  if (error || !data) return null
  return mapService(data as ServiceRow)
}

export async function updateService(event: H3Event, serviceId: string, tenantId: string, patch: Partial<{
  name: string; name_en: string | null; description: string | null
  price: number; duration_minutes: number; is_active: boolean; sort_order: number; category_id: string
}>): Promise<Service | null> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('services')
    .update(patch)
    .eq('id', serviceId)
    .eq('tenant_id', tenantId)    // ensures admins can only update their own
    .select('id, tenant_id, category_id, name, name_en, description, price, duration_minutes, is_active, sort_order')
    .single()

  if (error || !data) return null
  return mapService(data as ServiceRow)
}

export async function deleteService(event: H3Event, serviceId: string, tenantId: string): Promise<boolean> {
  const client = await getServerClient(event)
  const { error } = await client
    .from('services')
    .delete()
    .eq('id', serviceId)
    .eq('tenant_id', tenantId)

  return !error
}
