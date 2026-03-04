// app/middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo('/login')
  }

  const path = to.path
  const isSetup = path === '/setup'
  const isAdmin = path.startsWith('/admin')

  if (!isSetup && !isAdmin) return

  try {
    await $fetch('/api/admin/tenant')
    // User has a tenant
    if (isSetup) return navigateTo('/admin')
    return
  } catch {
    // 403: user has no tenant
    if (isAdmin) return navigateTo('/setup')
    return
  }
})
