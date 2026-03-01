// server/utils/resolveTenant.ts

const SYSTEM_PATHS = ['/admin', '/api', '/login', '/confirm', '/_nuxt']

export function resolveTenantSlugFromPath(path: string): string | null {
  const segment = path.split('/')[1]

  if (!segment) return null
  if (SYSTEM_PATHS.some(p => path.startsWith(p))) return null

  return segment
}
