// app/composables/admin/useCalendar.ts
import { ref, computed } from 'vue'
import type { Booking, StaffMember } from '~/types'

export type CalendarView = 'day' | 'staff' | 'agenda'

export interface StaffColorScheme {
  bg: string
  border: string
  text: string
  dot: string
  ring: string
}

export interface CreateBookingDefaults {
  date: string
  time: string
  staffId: string | null
}

const STAFF_COLORS: StaffColorScheme[] = [
  { bg: 'bg-teal-50 dark:bg-teal-950/50',     border: 'border-teal-300 dark:border-teal-800',     text: 'text-teal-700 dark:text-teal-300',     dot: 'bg-teal-400 dark:bg-teal-500',     ring: 'ring-teal-400 dark:ring-teal-500' },
  { bg: 'bg-rose-50 dark:bg-rose-950/50',     border: 'border-rose-300 dark:border-rose-800',     text: 'text-rose-700 dark:text-rose-300',     dot: 'bg-rose-400 dark:bg-rose-500',     ring: 'ring-rose-400 dark:ring-rose-500' },
  { bg: 'bg-violet-50 dark:bg-violet-950/50', border: 'border-violet-300 dark:border-violet-800', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-400 dark:bg-violet-500', ring: 'ring-violet-400 dark:ring-violet-500' },
  { bg: 'bg-amber-50 dark:bg-amber-950/50',   border: 'border-amber-300 dark:border-amber-800',   text: 'text-amber-700 dark:text-amber-300',   dot: 'bg-amber-400 dark:bg-amber-500',   ring: 'ring-amber-400 dark:ring-amber-500' },
  { bg: 'bg-sky-50 dark:bg-sky-950/50',       border: 'border-sky-300 dark:border-sky-800',       text: 'text-sky-700 dark:text-sky-300',       dot: 'bg-sky-400 dark:bg-sky-500',       ring: 'ring-sky-400 dark:ring-sky-500' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/50', border: 'border-emerald-300 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-400 dark:bg-emerald-500', ring: 'ring-emerald-400 dark:ring-emerald-500' },
]

const NO_STAFF_COLOR: StaffColorScheme = {
  bg: 'bg-gray-50 dark:bg-gray-900/50',
  border: 'border-gray-200 dark:border-gray-700',
  text: 'text-gray-500 dark:text-gray-400',
  dot: 'bg-gray-300 dark:bg-gray-600',
  ring: 'ring-gray-300 dark:ring-gray-600',
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

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0] ?? dateStr
}

export function useCalendar() {
  const today: string = new Date().toISOString().split('T')[0] ?? ''
  const selectedDate  = ref(today)
  const selectedView  = ref<CalendarView>('day')
  const timeSlots     = generateTimeSlots()

  // Slide-over state
  const selectedBooking = ref<Booking | null>(null)
  const createDefaults  = ref<CreateBookingDefaults | null>(null)

  function openBooking(booking: Booking): void {
    createDefaults.value  = null
    selectedBooking.value = booking
  }
  function closeBooking(): void {
    selectedBooking.value = null
  }
  function openCreateBooking(date: string, time: string, staffId: string | null): void {
    selectedBooking.value = null
    createDefaults.value  = { date, time, staffId }
  }
  function closeCreateBooking(): void {
    createDefaults.value = null
  }

  // Adaptive fetch: agenda → 30-day range; day/staff → single date
  const { data: bookings, pending, error, refresh } = useFetch<Booking[]>(
    () => {
      if (selectedView.value === 'agenda') {
        return `/api/admin/bookings?from=${today}&to=${addDays(today, 30)}`
      }
      return `/api/admin/bookings?date=${selectedDate.value}`
    },
    { default: () => [] },
  )

  const { data: staffList } =
    useFetch<StaffMember[]>('/api/admin/staff', { default: () => [] })

  function getStaffColor(staffId: string | null): StaffColorScheme {
    if (!staffId) return NO_STAFF_COLOR
    const list = staffList.value ?? []
    const idx  = list.findIndex(s => s.id === staffId)
    return (idx >= 0 ? STAFF_COLORS[idx % STAFF_COLORS.length] : undefined) ?? NO_STAFF_COLOR
  }

  function getStaffMember(staffId: string | null): StaffMember | undefined {
    if (!staffId) return undefined
    return (staffList.value ?? []).find(s => s.id === staffId)
  }

  const selectedDateVal = computed(() => selectedDate.value ?? today)

  const bookingsForSelectedDate = computed(() =>
    (bookings.value ?? [])
      .filter(b => b.date === selectedDateVal.value)
      .sort((a, b) => a.time.localeCompare(b.time)),
  )

  // slot → bookings (day view)
  const bookingsBySlot = computed(() => {
    const map  = new Map<string, Booking[]>()
    const list = bookings.value ?? []
    const date = selectedDateVal.value
    for (const slot of timeSlots) {
      map.set(slot, list.filter(b => b.date === date && b.time === slot))
    }
    return map
  })

  // slot → staffId → bookings (staff grid view)
  const bookingsBySlotAndStaff = computed((): Map<string, Map<string, Booking[]>> => {
    const result = new Map<string, Map<string, Booking[]>>()
    const list   = bookings.value ?? []
    const date   = selectedDateVal.value
    for (const slot of timeSlots) {
      result.set(slot, new Map<string, Booking[]>())
    }
    for (const booking of list) {
      if (booking.date !== date) continue
      const slotMap = result.get(booking.time)
      if (!slotMap) continue
      const key      = booking.staffId ?? 'unassigned'
      const existing = slotMap.get(key) ?? []
      existing.push(booking)
      slotMap.set(key, existing)
    }
    return result
  })

  // Agenda: non-cancelled, next 30 days, grouped by date
  const agendaBookings = computed((): Array<{ date: string; bookings: Booking[] }> => {
    const list = (bookings.value ?? [])
      .filter(b => b.status !== 'cancelled')
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    const groups = new Map<string, Booking[]>()
    for (const booking of list) {
      const group = groups.get(booking.date) ?? []
      group.push(booking)
      groups.set(booking.date, group)
    }
    return Array.from(groups.entries()).map(([date, items]) => ({ date, bookings: items }))
  })

  const weekDays = computed(() => {
    const d   = new Date(selectedDateVal.value + 'T12:00:00')
    const dow = d.getDay()
    const sunday = new Date(d)
    sunday.setDate(d.getDate() - dow)
    const list = bookings.value ?? []
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(sunday)
      day.setDate(sunday.getDate() + i)
      const iso = day.toISOString().split('T')[0] ?? ''
      return {
        date: iso,
        dayNumber: day.getDate(),
        hasActiveBookings: list.some(b => b.date === iso && b.status !== 'cancelled'),
      }
    })
  })

  function goToToday(): void { selectedDate.value = today }
  function goPrevDay(): void { selectedDate.value = addDays(selectedDateVal.value, -1) }
  function goNextDay(): void { selectedDate.value = addDays(selectedDateVal.value, 1) }

  async function confirmBooking(id: string): Promise<void> {
    await $fetch(`/api/admin/bookings/${id}/status`, { method: 'PATCH', body: { status: 'confirmed' } })
    await refresh()
  }
  async function cancelBooking(id: string): Promise<void> {
    await $fetch(`/api/admin/bookings/${id}/status`, { method: 'PATCH', body: { status: 'cancelled' } })
    await refresh()
    closeBooking()
  }
  async function completeBooking(id: string): Promise<void> {
    await $fetch(`/api/admin/bookings/${id}/status`, { method: 'PATCH', body: { status: 'completed' } })
    await refresh()
    closeBooking()
  }
  async function createBookingOnCalendar(payload: {
    serviceId: string
    staffId: string | null
    date: string
    time: string
    customerName: string
    customerPhone: string
  }): Promise<void> {
    await $fetch('/api/admin/bookings', { method: 'POST', body: payload })
    await refresh()
    closeCreateBooking()
  }

  return {
    bookings,
    selectedDate,
    selectedView,
    today,
    timeSlots,
    staffList,
    bookingsForSelectedDate,
    bookingsBySlot,
    bookingsBySlotAndStaff,
    agendaBookings,
    weekDays,
    selectedBooking,
    createDefaults,
    getStaffColor,
    getStaffMember,
    openBooking,
    closeBooking,
    openCreateBooking,
    closeCreateBooking,
    goToToday,
    goPrevDay,
    goNextDay,
    confirmBooking,
    cancelBooking,
    completeBooking,
    createBookingOnCalendar,
    isLoading: pending,
    error,
    refresh,
  }
}
