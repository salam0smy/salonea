// app/composables/admin/useCalendar.ts
import { ref, computed } from 'vue'
import type { Booking, StaffMember } from '~/types'

export interface StaffColorScheme {
  bg: string
  border: string
  text: string
  dot: string
}

const STAFF_COLORS: StaffColorScheme[] = [
  { bg: 'bg-teal-50 dark:bg-teal-950/50',     border: 'border-teal-300 dark:border-teal-800',     text: 'text-teal-700 dark:text-teal-300',     dot: 'bg-teal-400 dark:bg-teal-500' },
  { bg: 'bg-rose-50 dark:bg-rose-950/50',     border: 'border-rose-300 dark:border-rose-800',     text: 'text-rose-700 dark:text-rose-300',     dot: 'bg-rose-400 dark:bg-rose-500' },
  { bg: 'bg-violet-50 dark:bg-violet-950/50', border: 'border-violet-300 dark:border-violet-800', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-400 dark:bg-violet-500' },
]

const NO_STAFF_COLOR: StaffColorScheme = {
  bg: 'bg-gray-50 dark:bg-gray-900/50', border: 'border-gray-200 dark:border-gray-700', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-300 dark:bg-gray-600',
}

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
  const today: string = new Date().toISOString().split('T')[0] ?? ''
  const selectedDate = ref(today)
  const timeSlots = generateTimeSlots()

  const { data: bookings, pending, error, refresh } = useFetch<Booking[]>(
    () => `/api/admin/bookings?date=${selectedDate.value}`,
    { default: () => [] },
  )

  const { data: staffList } =
    useFetch<StaffMember[]>('/api/admin/staff', { default: () => [] })

  function getStaffColor(staffId: string | null): StaffColorScheme {
    if (!staffId) return NO_STAFF_COLOR
    const list = staffList.value ?? []
    const idx = list.findIndex(s => s.id === staffId)
    return (idx >= 0 ? STAFF_COLORS[idx % STAFF_COLORS.length] : undefined) ?? NO_STAFF_COLOR
  }

  const selectedDateVal = computed(() => selectedDate.value ?? today)

  const bookingsForSelectedDate = computed(() =>
    (bookings.value ?? [])
      .filter(b => b.date === selectedDateVal.value)
      .sort((a, b) => a.time.localeCompare(b.time)),
  )

  const bookingsBySlot = computed(() => {
    const map = new Map<string, Booking[]>()
    const list = bookings.value ?? []
    const date = selectedDateVal.value
    for (const slot of timeSlots) {
      map.set(
        slot,
        list.filter(b => b.date === date && b.time === slot),
      )
    }
    return map
  })

  const weekDays = computed(() => {
    const d = new Date(selectedDateVal.value)
    const dow = d.getDay()
    const sunday = new Date(d)
    sunday.setDate(d.getDate() - dow)
    const list = bookings.value ?? []

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(sunday)
      day.setDate(sunday.getDate() + i)
      const iso = day.toISOString().split('T')[0]
      const hasActiveBookings = list.some(
        b => b.date === iso && b.status !== 'cancelled',
      )
      return { date: iso, dayNumber: day.getDate(), hasActiveBookings }
    })
  })

  function goToToday(): void {
    selectedDate.value = today
  }

  function goPrevDay(): void {
    const d = new Date(selectedDateVal.value)
    d.setDate(d.getDate() - 1)
    selectedDate.value = d.toISOString().split('T')[0] ?? today
  }

  function goNextDay(): void {
    const d = new Date(selectedDateVal.value)
    d.setDate(d.getDate() + 1)
    selectedDate.value = d.toISOString().split('T')[0] ?? today
  }

  async function confirmBooking(id: string): Promise<void> {
    await $fetch(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status: 'confirmed' },
    })
    await refresh()
  }

  async function cancelBooking(id: string): Promise<void> {
    await $fetch(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status: 'cancelled' },
    })
    await refresh()
  }

  async function completeBooking(id: string): Promise<void> {
    await $fetch(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status: 'completed' },
    })
    await refresh()
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
    isLoading: pending,
    error,
    refresh,
  }
}
