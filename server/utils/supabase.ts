// server/utils/supabase.ts
import { serverSupabaseClient } from '#supabase/server'
import type { H3Event } from 'h3'

export { serverSupabaseClient as useSupabaseServerClient }

// Convenience: typed wrapper used by all repositories
export async function getServerClient(event: H3Event) {
  return serverSupabaseClient(event)
}
