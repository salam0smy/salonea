// server/utils/repositories/tenants.ts
import type { H3Event } from 'h3'

export interface Tenant {
  id: string
  slug: string
  name: string
  logo_url: string | null
}

export async function getTenantBySlug(event: H3Event, slug: string): Promise<Tenant | null> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('tenants')
    .select('id, slug, name, logo_url')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data
}
