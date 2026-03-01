// app/composables/admin/useCalendar.ts
import { ref, computed } from 'vue'
import { mockBookings, mockStaff } from '~/data/mock'
import type { Booking } from '~/types'

export interface StaffColorScheme {
  bg: string
  border: string
  text: string
  dot: string
}

const STAFF_COLORS: StaffColorScheme[] = [
  { bg: 'bg-teal-50',   border: 'border-teal-300',   text: 'text-teal-700',   dot: 'bg-teal-400' },
  { bg: 'bg-rose-50',   border: 'border-rose-300',   text: 'text-rose-700',   dot: 'bg-rose-400' },
  { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', dot: 'bg-violet-400' },
]

const NO_STAFF_COLOR: StaffColorScheme = {
  bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500', dot: 'bg-gray-300',
}

// Stable staff → index mapping derived from mockStaff ordering
const STAFF_IDS = mockStaff.map(s => s.id)

// 09:00 → 18:30 in 30-min increments (20 slots total)
function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = 9; h <= 18; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 18) slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  slots.push('18:30')
  return slots
}

export function useCalendar() {
  const bookings = ref<Booking[]>([...mockBookings])
  const today = new Date().toISOString().split('T')[0]
  const selectedDate = ref(today)
  const timeSlots = generateTimeSlots()

  function getStaffColor(staffId: string | null): StaffColorScheme {
    if (!staffId) return NO_STAFF_COLOR
    const idx = STAFF_IDS.indexOf(staffId)
    return idx >= 0 ? STAFF_COLORS[idx % STAFF_COLORS.length] : NO_STAFF_COLOR
  }

  // Bookings for the selected date, sorted ascending by time
  const bookingsForSelectedDate = computed(() =>
    bookings.value
      .filter(b => b.date === selectedDate.value)
      .sort((a, b) => a.time.localeCompare(b.time)),
  )

  // Map: time slot → bookings that START at that slot (for the selected date)
  const bookingsBySlot = computed(() => {
    const map = new Map<string, Booking[]>()
    for (const slot of timeSlots) {
      map.set(
        slot,
        bookings.value.filter(b => b.date === selectedDate.value && b.time === slot),
      )
    }
    return map
  })

  // 7-day strip: Sunday of the week containing selectedDate → Saturday
  const weekDays = computed(() => {
    const d = new Date(selectedDate.value)
    const dow = d.getDay() // 0 = Sunday
    const sunday = new Date(d)
    sunday.setDate(d.getDate() - dow)

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(sunday)
      day.setDate(sunday.getDate() + i)
      const iso = day.toISOString().split('T')[0]
      const hasActiveBookings = bookings.value.some(
        b => b.date === iso && b.status !== 'cancelled',
      )
      return { date: iso, dayNumber: day.getDate(), hasActiveBookings }
    })
  })

  function goToToday(): void {
    selectedDate.value = today
  }

  function goPrevDay(): void {
    const d = new Date(selectedDate.value)
    d.setDate(d.getDate() - 1)
    selectedDate.value = d.toISOString().split('T')[0]
  }

  function goNextDay(): void {
    const d = new Date(selectedDate.value)
    d.setDate(d.getDate() + 1)
    selectedDate.value = d.toISOString().split('T')[0]
  }

  function confirmBooking(id: string): void {
    bookings.value = bookings.value.map(b =>
      b.id === id && b.status === 'pending' ? { ...b, status: 'confirmed' } : b,
    )
  }

  function cancelBooking(id: string): void {
    bookings.value = bookings.value.map(b =>
      b.id === id && b.status !== 'completed' && b.status !== 'cancelled'
        ? { ...b, status: 'cancelled' }
        : b,
    )
  }

  function completeBooking(id: string): void {
    bookings.value = bookings.value.map(b =>
      b.id === id && b.status === 'confirmed' ? { ...b, status: 'completed' } : b,
    )
  }

  return {
    bookings,
    selectedDate,
    today,
    timeSlots,
    bookingsForSelectedDate,
    bookingsBySlot,
    weekDays,
    getStaffColor,
    goToToday,
    goPrevDay,
    goNextDay,
    confirmBooking,
    cancelBooking,
    completeBooking,
  }
}
