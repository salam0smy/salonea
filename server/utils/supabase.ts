// server/utils/supabase.ts
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'

export { serverSupabaseClient as useSupabaseServerClient }

// User client — respects RLS (used from browser-facing public routes)
export async function getServerClient(event: H3Event) {
  return serverSupabaseClient(event)
}
