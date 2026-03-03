// app/composables/booking/useBookingFlow.ts
import type { BookingSelection } from '~/types'

export type BookingStep = 1 | 2 | 3 | 4

export function useBookingFlow() {
  const step = ref<BookingStep>(1)

  const selection = ref<BookingSelection>({
    service: null,
    staff: null,
    date: null,
    time: null,
    contact: null,
    bookingId: null,
  })

  function canAdvance(): boolean {
    if (step.value === 1) return selection.value.service !== null
    if (step.value === 2) return selection.value.date !== null && selection.value.time !== null
    if (step.value === 3) return selection.value.contact !== null
    return false
  }

  function advance() {
    if (canAdvance() && step.value < 4) {
      step.value = (step.value + 1) as BookingStep
    }
  }

  function back() {
    if (step.value > 1) {
      step.value = (step.value - 1) as BookingStep
    }
  }

  async function submitBooking(slug: string): Promise<void> {
    const { service, staff, date, time, contact } = selection.value
    if (!service || !date || !time || !contact) return

    const booking = await $fetch<{ id: string }>(`/api/${slug}/bookings`, {
      method: 'POST',
      body: {
        serviceId: service.id,
        staffId: staff?.id ?? null,
        date,
        time,
        customerName: contact.name,
        customerPhone: contact.phone,
      },
    })
    selection.value.bookingId = booking.id
    advance()
  }

  return { step, selection, advance, back, canAdvance, submitBooking }
}
