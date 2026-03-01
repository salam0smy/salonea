// tests/server/utils/resolveTenant.test.ts
import { describe, it, expect } from 'vitest'
import { resolveTenantSlugFromPath } from '../../../server/utils/resolveTenant'

describe('resolveTenantSlugFromPath', () => {
  it('extracts slug from a booking page path', () => {
    expect(resolveTenantSlugFromPath('/my-salon')).toBe('my-salon')
  })

  it('extracts slug from a nested booking path', () => {
    expect(resolveTenantSlugFromPath('/my-salon/confirm')).toBe('my-salon')
  })

  it('returns null for admin paths', () => {
    expect(resolveTenantSlugFromPath('/admin')).toBeNull()
  })

  it('returns null for api paths', () => {
    expect(resolveTenantSlugFromPath('/api/bookings')).toBeNull()
  })

  it('returns null for root path', () => {
    expect(resolveTenantSlugFromPath('/')).toBeNull()
  })
})
