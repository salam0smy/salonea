// server/utils/supabase.ts
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'

export { serverSupabaseClient as useSupabaseServerClient }

// User client — respects RLS (used from browser-facing public routes)
export async function getServerClient(event: H3Event) {
  return serverSupabaseClient(event)
}

/** Service role client — bypasses RLS. Use only on trusted server paths (webhooks, background jobs). */
export async function getServiceRoleClient(event: H3Event) {
  return serverSupabaseServiceRole(event)
}
