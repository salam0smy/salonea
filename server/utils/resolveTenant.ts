// server/utils/resolveTenant.ts

const SYSTEM_PATHS = ['/admin', '/login', '/confirm', '/_nuxt']

export function resolveTenantSlugFromPath(path: string): string | null {
  const parts = path.split('/').filter(Boolean)

  // /api/<slug>/... — slug is the segment after "api"
  if (path.startsWith('/api/')) {
    if (parts.length < 2) return null
    const slug = parts[1]
    if (slug === 'admin') return null
    return slug ?? null
  }

  if (!parts.length) return null
  if (SYSTEM_PATHS.some(p => path.startsWith(p))) return null

  return parts[0] ?? null
}
