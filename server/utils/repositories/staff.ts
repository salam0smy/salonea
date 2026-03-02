// server/utils/repositories/staff.ts
import type { H3Event } from 'h3'
import type { StaffMember } from '~/types'

// ── DB row shapes ─────────────────────────────────────────────────────────────
interface StaffRow {
  id: string
  tenant_id: string
  name: string
  name_en: string | null
  photo_url: string | null
  is_active: boolean
  staff_services: { service_id: string }[]
}

// ── Mappers ───────────────────────────────────────────────────────────────────
function mapStaff(row: StaffRow): StaffMember {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    nameEn: row.name_en,
    photoUrl: row.photo_url,
    serviceIds: (row.staff_services ?? []).map(ss => ss.service_id),
  }
}

const STAFF_SELECT = 'id, tenant_id, name, name_en, photo_url, is_active, staff_services(service_id)'

// ── Public API ────────────────────────────────────────────────────────────────
export async function getStaffByTenant(event: H3Event, tenantId: string, activeOnly = true): Promise<StaffMember[]> {
  const client = await getServerClient(event)
  let query = client
    .from('staff')
    .select(STAFF_SELECT)
    .eq('tenant_id', tenantId)
    .order('created_at')

  if (activeOnly) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) return []
  return (data as StaffRow[]).map(mapStaff)
}

export async function createStaff(event: H3Event, tenantId: string, payload: {
  name: string
  name_en?: string | null
  photo_url?: string | null
  serviceIds?: string[]
}): Promise<StaffMember | null> {
  const client = await getServerClient(event)

  const { data: staffData, error: staffError } = await client
    .from('staff')
    .insert({ tenant_id: tenantId, name: payload.name, name_en: payload.name_en ?? null, photo_url: payload.photo_url ?? null })
    .select('id')
    .single()

  if (staffError || !staffData) return null

  if (payload.serviceIds?.length) {
    await client.from('staff_services').insert(
      payload.serviceIds.map(sid => ({ staff_id: staffData.id, service_id: sid })),
    )
  }

  const { data, error } = await client.from('staff').select(STAFF_SELECT).eq('id', staffData.id).single()
  if (error || !data) return null
  return mapStaff(data as StaffRow)
}

export async function updateStaff(event: H3Event, staffId: string, tenantId: string, payload: {
  name?: string
  name_en?: string | null
  photo_url?: string | null
  is_active?: boolean
  serviceIds?: string[]
}): Promise<StaffMember | null> {
  const client = await getServerClient(event)

  const patch: Record<string, unknown> = {}
  if (payload.name !== undefined) patch.name = payload.name
  if (payload.name_en !== undefined) patch.name_en = payload.name_en
  if (payload.photo_url !== undefined) patch.photo_url = payload.photo_url
  if (payload.is_active !== undefined) patch.is_active = payload.is_active

  if (Object.keys(patch).length > 0) {
    await client.from('staff').update(patch).eq('id', staffId).eq('tenant_id', tenantId)
  }

  if (payload.serviceIds !== undefined) {
    await client.from('staff_services').delete().eq('staff_id', staffId)
    if (payload.serviceIds.length > 0) {
      await client.from('staff_services').insert(
        payload.serviceIds.map(sid => ({ staff_id: staffId, service_id: sid })),
      )
    }
  }

  const { data, error } = await client.from('staff').select(STAFF_SELECT).eq('id', staffId).single()
  if (error || !data) return null
  return mapStaff(data as StaffRow)
}

export async function deleteStaff(event: H3Event, staffId: string, tenantId: string): Promise<boolean> {
  const client = await getServerClient(event)
  const { error } = await client.from('staff').delete().eq('id', staffId).eq('tenant_id', tenantId)
  return !error
}
