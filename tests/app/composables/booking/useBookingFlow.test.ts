// tests/app/composables/booking/useBookingFlow.test.ts
import { describe, it, expect } from 'vitest'
import { useBookingFlow } from '~/composables/booking/useBookingFlow'

const minimalService = {
  id: 's1', tenantId: 't1', categoryId: 'cat-hair',
  name: 'قص', nameEn: null, description: null,
  price: 150, durationMinutes: 60, isActive: true,
}

describe('useBookingFlow', () => {
  it('starts on step 1', () => {
    const { step } = useBookingFlow()
    expect(step.value).toBe(1)
  })

  it('cannot advance from step 1 without a service selected', () => {
    const { step, advance } = useBookingFlow()
    advance()
    expect(step.value).toBe(1)
  })

  it('advances to step 2 when a service is selected', () => {
    const { step, selection, advance } = useBookingFlow()
    selection.value.service = minimalService
    advance()
    expect(step.value).toBe(2)
  })

  it('goes back from step 2 to step 1', () => {
    const { step, selection, advance, back } = useBookingFlow()
    selection.value.service = minimalService
    advance()
    back()
    expect(step.value).toBe(1)
  })

  it('cannot advance from step 2 without date and time', () => {
    const { step, selection, advance } = useBookingFlow()
    selection.value.service = minimalService
    advance() // → step 2
    advance() // should stay at 2
    expect(step.value).toBe(2)
  })

  it('advances to step 3 when date and time are selected', () => {
    const { step, selection, advance } = useBookingFlow()
    selection.value.service = minimalService
    advance()
    selection.value.date = '2026-03-15'
    selection.value.time = '10:00'
    advance()
    expect(step.value).toBe(3)
  })

  it('cannot advance from step 3 without contact info', () => {
    const { step, selection, advance } = useBookingFlow()
    selection.value.service = minimalService
    advance()
    selection.value.date = '2026-03-15'
    selection.value.time = '10:00'
    advance()
    advance() // should stay at 3
    expect(step.value).toBe(3)
  })
})
