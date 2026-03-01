// tests/app/composables/admin/useStaff.test.ts
import { describe, it, expect } from 'vitest'
import { useStaff } from '~/composables/admin/useStaff'

describe('useStaff', () => {
  it('loads all mock staff', () => {
    const { staff } = useStaff()
    expect(staff.value.length).toBeGreaterThan(0)
  })

  it('loads all mock services', () => {
    const { services } = useStaff()
    expect(services.value.length).toBeGreaterThan(0)
  })

  it('addStaff appends a new staff member with a generated id', () => {
    const { staff, addStaff } = useStaff()
    const before = staff.value.length
    addStaff({
      name: 'هند',
      nameEn: null,
      photoUrl: null,
      serviceIds: ['s1', 's2'],
    })
    expect(staff.value.length).toBe(before + 1)
    const added = staff.value[staff.value.length - 1]
    expect(added.id).toBeTruthy()
    expect(added.name).toBe('هند')
    expect(added.serviceIds).toEqual(['s1', 's2'])
  })

  it('updateStaff patches an existing staff member by id', () => {
    const { staff, updateStaff } = useStaff()
    const id = staff.value[0].id
    updateStaff(id, { nameEn: 'Updated Name' })
    expect(staff.value.find(s => s.id === id)?.nameEn).toBe('Updated Name')
  })

  it('removeStaff deletes the staff member with the given id', () => {
    const { staff, removeStaff } = useStaff()
    const before = staff.value.length
    const id = staff.value[0].id
    removeStaff(id)
    expect(staff.value.length).toBe(before - 1)
    expect(staff.value.find(s => s.id === id)).toBeUndefined()
  })

  it('each call to useStaff returns independent state', () => {
    const a = useStaff()
    const b = useStaff()
    a.removeStaff(a.staff.value[0].id)
    expect(b.staff.value.length).toBe(a.staff.value.length + 1)
  })
})
