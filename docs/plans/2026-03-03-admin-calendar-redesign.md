# Admin Calendar Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the admin calendar with three views (Day, Staff Grid, Agenda), staff avatars with colored rings, a `USlideover` for booking details/actions, click-to-create on empty slots, and a date-picker popover for navigation.

**Architecture:** Extend `useCalendar` with `selectedView`, slide-over state, create-booking state, `agendaBookings`, and `bookingsBySlotAndStaff`. New components: `AdminCalendarViewSwitcher`, `AdminCalendarDatePicker`, `AdminCalendarStaffGrid`, `AdminCalendarAgenda`, `AdminBookingSlideOver`. Server gets date-range GET and a new POST route. `AdminCalendarEntry` drops inline action buttons in favour of click-to-open-slideover.

**Tech Stack:** Nuxt 4, Nuxt UI v3 (`USlideover`, `UCalendar`, `UPopover`, `UButtonGroup`, `UAvatar`, `USelect`, `UFormField`), `@internationalized/date` (already installed), TypeScript, `@nuxtjs/i18n`.

---

## Task 1: i18n keys

**Files:**
- Modify: `i18n/locales/ar.json`
- Modify: `i18n/locales/en.json`

No test needed.

**Step 1: Update `i18n/locales/ar.json`**

Inside `"admin"` → `"calendar"` object, add the new keys:

```json
"calendar": {
  "label": "التقويم",
  "noBookings": "لا توجد حجوزات لهذا اليوم",
  "viewDay": "يوم",
  "viewStaff": "موظفون",
  "viewAgenda": "قائمة",
  "selectService": "اختر الخدمة",
  "selectStaff": "اختر الموظف",
  "noPreference": "بدون تفضيل",
  "selectTime": "اختر الوقت",
  "addBooking": "إضافة حجز",
  "upcomingEmpty": "لا توجد حجوزات قادمة",
  "unassigned": "بدون موظف"
},
```

In the top-level `"admin"` object (same level as `"today"`), add:

```json
"tomorrow": "غداً",
```

**Step 2: Update `i18n/locales/en.json`**

Same locations:

```json
"calendar": {
  "label": "Calendar",
  "noBookings": "No bookings for this day",
  "viewDay": "Day",
  "viewStaff": "Staff",
  "viewAgenda": "Agenda",
  "selectService": "Select service",
  "selectStaff": "Select staff",
  "noPreference": "No preference",
  "selectTime": "Select time",
  "addBooking": "Add booking",
  "upcomingEmpty": "No upcoming bookings",
  "unassigned": "Unassigned"
},
```

```json
"tomorrow": "Tomorrow",
```

**Step 3: Commit**

```bash
git add i18n/locales/ar.json i18n/locales/en.json
git commit -m "feat: add calendar redesign i18n keys"
```

---

## Task 2: Server — date range + create booking

**Files:**
- Modify: `server/utils/repositories/bookings.ts`
- Modify: `server/api/admin/bookings/index.get.ts`
- Create: `server/api/admin/bookings/index.post.ts`

No unit test (no server test infrastructure exists). Verify via browser in Task 11.

**Step 1: Add `from`/`to` to the repository**

In `server/utils/repositories/bookings.ts`, replace the `Options` interface and the query construction inside `getBookingsByTenant`:

```typescript
// Replace the Options interface:
export interface BookingQueryOptions {
  date?: string
  from?: string
  to?: string
  status?: BookingStatus
}

// Replace the function signature:
export async function getBookingsByTenant(
  event: H3Event,
  tenantId: string,
  options?: BookingQueryOptions,
): Promise<Booking[]> {
  const client = await getServerClient(event)
  let query = client
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('tenant_id', tenantId)
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (options?.date)   query = query.eq('date', options.date)
  if (options?.from)   query = query.gte('date', options.from)
  if (options?.to)     query = query.lte('date', options.to)
  if (options?.status) query = query.eq('status', options.status)

  const { data, error } = await query
  if (error) return []
  return (data as BookingRow[]).map(mapBooking)
}
```

**Step 2: Update the GET route**

Replace `server/api/admin/bookings/index.get.ts`:

```typescript
// server/api/admin/bookings/index.get.ts
import type { BookingStatus } from '~/types'

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const query = getQuery(event)
  return getBookingsByTenant(event, tenantId, {
    date:   query.date   as string | undefined,
    from:   query.from   as string | undefined,
    to:     query.to     as string | undefined,
    status: query.status as BookingStatus | undefined,
  })
})
```

**Step 3: Create the POST route**

```typescript
// server/api/admin/bookings/index.post.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = await requireAdmin(event)
  const body = await readBody(event)
  const booking = await createBooking(event, {
    tenantId,
    serviceId:     body.serviceId,
    staffId:       body.staffId ?? null,
    date:          body.date,
    time:          body.time,
    customerName:  body.customerName,
    customerPhone: body.customerPhone,
  })
  if (!booking) throw createError({ statusCode: 500, message: 'Failed to create booking' })
  return booking
})
```

**Step 4: Commit**

```bash
git add server/utils/repositories/bookings.ts \
        server/api/admin/bookings/index.get.ts \
        server/api/admin/bookings/index.post.ts
git commit -m "feat: add date-range GET and create booking POST to admin bookings API"
```

---

## Task 3: Rewrite `useCalendar` composable

**Files:**
- Modify: `app/composables/admin/useCalendar.ts`

**Step 1: Replace the entire file**

```typescript
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
```

**Step 2: Commit**

```bash
git add app/composables/admin/useCalendar.ts
git commit -m "feat: expand useCalendar — views, slide-over state, agenda, staff grid, 6-color palette"
```

---

## Task 4: Update `AdminCalendarWeekStrip`

**Files:**
- Modify: `app/components/admin/AdminCalendarWeekStrip.vue`

Migrate raw `<button>` to `UButton`. No other behavioural change.

**Step 1: Replace the file**

```vue
<!-- app/components/admin/AdminCalendarWeekStrip.vue -->
<script setup lang="ts">
defineProps<{
  weekDays: Array<{ date: string; dayNumber: number; hasActiveBookings: boolean }>
  selectedDate: string
  today: string
}>()

defineEmits<{
  select: [date: string]
}>()
</script>

<template>
  <div class="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
    <UButton
      v-for="day in weekDays"
      :key="day.date"
      :variant="day.date === selectedDate ? 'solid' : (day.date === today ? 'soft' : 'ghost')"
      color="neutral"
      class="flex-col gap-0.5 min-w-12 h-auto py-2 px-2.5 shrink-0 transition-colors duration-100"
      @click="$emit('select', day.date)"
    >
      <span class="text-[10px] leading-none opacity-70">
        {{ new Date(day.date + 'T12:00:00').toLocaleDateString('ar-SA', { weekday: 'short' }) }}
      </span>
      <span class="text-sm font-semibold tabular-nums leading-tight" dir="ltr">
        {{ day.dayNumber }}
      </span>
      <div
        class="w-1.5 h-1.5 rounded-full mt-0.5 transition-opacity duration-100"
        :class="day.hasActiveBookings ? 'bg-current opacity-60' : 'opacity-0'"
      />
    </UButton>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add app/components/admin/AdminCalendarWeekStrip.vue
git commit -m "refactor: migrate AdminCalendarWeekStrip to UButton with transitions"
```

---

## Task 5: Update `AdminCalendarEntry`

**Files:**
- Modify: `app/components/admin/AdminCalendarEntry.vue`

Remove inline action buttons. Add `UAvatar`, hover lift, and a single `click` emit.

**Step 1: Replace the file**

```vue
<!-- app/components/admin/AdminCalendarEntry.vue -->
<script setup lang="ts">
import type { Booking } from '~/types'
import type { StaffColorScheme } from '~/composables/admin/useCalendar'

const props = defineProps<{
  booking: Booking
  serviceName: string
  staffName: string | null
  staffPhotoUrl?: string | null
  colorScheme: StaffColorScheme
  durationMinutes: number
}>()

const emit = defineEmits<{
  open: [booking: Booking]
}>()

const statusColor = computed((): 'warning' | 'primary' | 'success' | 'neutral' => {
  const map = { pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'neutral' } as const
  return map[props.booking.status]
})
</script>

<template>
  <div
    class="rounded-[14px] border border-s-4 px-4 py-3 flex items-center gap-3
           cursor-pointer select-none
           transition-all duration-150
           hover:shadow-sm hover:-translate-x-px
           active:scale-[0.99] active:shadow-none"
    :class="[colorScheme.bg, colorScheme.border]"
    @click="emit('open', booking)"
  >
    <!-- Staff avatar -->
    <UAvatar
      :src="staffPhotoUrl ?? undefined"
      :alt="staffName ?? ''"
      :text="staffName ? staffName.charAt(0) : '؟'"
      size="xs"
      class="shrink-0 ring-2"
      :class="colorScheme.ring"
    />

    <!-- Name + service -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-(--color-text) truncate leading-tight">
        {{ booking.contact.name }}
      </p>
      <p class="text-xs truncate mt-0.5 leading-tight" :class="colorScheme.text">
        {{ serviceName }}
        <span v-if="staffName"> · {{ staffName }}</span>
        <span class="text-(--color-text-muted)"> · {{ durationMinutes }}د</span>
      </p>
    </div>

    <!-- Status badge -->
    <UBadge :color="statusColor" variant="subtle" size="xs" class="shrink-0">
      {{ $t(`admin.bookingStatus.${booking.status}`) }}
    </UBadge>

    <!-- Chevron hint -->
    <UIcon
      name="i-heroicons-chevron-left"
      class="size-3.5 shrink-0 text-(--color-text-muted) opacity-40"
    />
  </div>
</template>
```

> **RTL note:** `hover:-translate-x-px` shifts the card one pixel toward the start (left in RTL = into the page margin), giving a subtle "press" feel consistent with the reading direction.

**Step 2: Commit**

```bash
git add app/components/admin/AdminCalendarEntry.vue
git commit -m "refactor: AdminCalendarEntry — avatar, hover lift, click-to-open (drop inline actions)"
```

---

## Task 6: Create `AdminCalendarViewSwitcher`

**Files:**
- Create: `app/components/admin/AdminCalendarViewSwitcher.vue`

**Step 1: Create the file**

```vue
<!-- app/components/admin/AdminCalendarViewSwitcher.vue -->
<script setup lang="ts">
import type { CalendarView } from '~/composables/admin/useCalendar'

defineProps<{ modelValue: CalendarView }>()
const emit = defineEmits<{ 'update:modelValue': [view: CalendarView] }>()

const views: Array<{ value: CalendarView; labelKey: string; icon: string }> = [
  { value: 'day',    labelKey: 'admin.calendar.viewDay',    icon: 'i-heroicons-calendar-days' },
  { value: 'staff',  labelKey: 'admin.calendar.viewStaff',  icon: 'i-heroicons-users' },
  { value: 'agenda', labelKey: 'admin.calendar.viewAgenda', icon: 'i-heroicons-list-bullet' },
]
</script>

<template>
  <UButtonGroup size="xs">
    <UButton
      v-for="v in views"
      :key="v.value"
      color="neutral"
      :variant="modelValue === v.value ? 'solid' : 'ghost'"
      :icon="v.icon"
      :label="$t(v.labelKey)"
      class="transition-colors duration-100"
      @click="emit('update:modelValue', v.value)"
    />
  </UButtonGroup>
</template>
```

**Step 2: Commit**

```bash
git add app/components/admin/AdminCalendarViewSwitcher.vue
git commit -m "feat: add AdminCalendarViewSwitcher component"
```

---

## Task 7: Create `AdminCalendarDatePicker`

**Files:**
- Create: `app/components/admin/AdminCalendarDatePicker.vue`

Clickable date heading that opens a `UPopover` / `UCalendar` for jumping to any date.

> **Dependency:** `@internationalized/date` is already in `node_modules` — no install needed. Import `parseDate` from it directly.

**Step 1: Create the file**

```vue
<!-- app/components/admin/AdminCalendarDatePicker.vue -->
<script setup lang="ts">
import { parseDate } from '@internationalized/date'
import type { CalendarDate } from '@internationalized/date'

const props = defineProps<{
  selectedDate: string
  today: string
}>()

const emit = defineEmits<{ select: [date: string] }>()

const { t, locale } = useI18n()
const isOpen = ref(false)

const calendarValue = computed(() => parseDate(props.selectedDate))

function onDateSelect(val: CalendarDate | CalendarDate[] | undefined) {
  if (!val || Array.isArray(val)) return
  emit('select', val.toString())
  isOpen.value = false
}

const dateLabel = computed(() => {
  const yesterday = new Date(props.today + 'T12:00:00')
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0] ?? ''
  const tomorrow = new Date(props.today + 'T12:00:00')
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0] ?? ''

  if (props.selectedDate === props.today)     return t('admin.today')
  if (props.selectedDate === yesterdayStr)    return t('admin.yesterday')
  if (props.selectedDate === tomorrowStr)     return t('admin.tomorrow')

  return new Date(props.selectedDate + 'T12:00:00').toLocaleDateString(
    locale.value === 'ar' ? 'ar-SA' : 'en-GB',
    { weekday: 'long', month: 'long', day: 'numeric' },
  )
})
</script>

<template>
  <UPopover v-model:open="isOpen">
    <button
      type="button"
      class="flex items-center gap-1.5 font-semibold text-(--color-text)
             hover:text-(--color-primary) transition-colors duration-150
             cursor-pointer group"
    >
      <span>{{ dateLabel }}</span>
      <UIcon
        name="i-heroicons-chevron-down"
        class="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150"
      />
    </button>

    <template #content>
      <UCalendar
        :model-value="calendarValue"
        class="p-2"
        @update:model-value="onDateSelect"
      />
    </template>
  </UPopover>
</template>
```

**Step 2: Commit**

```bash
git add app/components/admin/AdminCalendarDatePicker.vue
git commit -m "feat: add AdminCalendarDatePicker — clickable heading with UCalendar popover"
```

---

## Task 8: Create `AdminCalendarStaffGrid`

**Files:**
- Create: `app/components/admin/AdminCalendarStaffGrid.vue`

Staff-column × time-slot grid for the selected day. Time labels sticky at start (right in RTL). Clicking an empty cell opens create mode; clicking a booking opens view mode.

**Step 1: Create the file**

```vue
<!-- app/components/admin/AdminCalendarStaffGrid.vue -->
<script setup lang="ts">
import type { Booking, StaffMember } from '~/types'
import type { StaffColorScheme } from '~/composables/admin/useCalendar'

const props = defineProps<{
  timeSlots: string[]
  staffList: StaffMember[]
  selectedDate: string
  bookingsBySlotAndStaff: Map<string, Map<string, Booking[]>>
  getStaffColor: (staffId: string | null) => StaffColorScheme
  getServiceName: (serviceId: string) => string
  getServiceDuration: (serviceId: string) => number
  isLoading: boolean
}>()

const emit = defineEmits<{
  open:   [booking: Booking]
  create: [payload: { date: string; time: string; staffId: string | null }]
}>()

// Show "Unassigned" column only if any booking on this day has no staff
const hasUnassigned = computed(() => {
  for (const [, staffMap] of props.bookingsBySlotAndStaff) {
    if ((staffMap.get('unassigned')?.length ?? 0) > 0) return true
  }
  return false
})

interface Column {
  id: string
  member: StaffMember | null
}

const columns = computed((): Column[] => {
  const cols: Column[] = props.staffList.map(s => ({ id: s.id, member: s }))
  if (hasUnassigned.value) cols.push({ id: 'unassigned', member: null })
  return cols
})

function cellBookings(slot: string, colId: string): Booking[] {
  return props.bookingsBySlotAndStaff.get(slot)?.get(colId) ?? []
}

function onEmptyCellClick(slot: string, colId: string) {
  emit('create', {
    date:    props.selectedDate,
    time:    slot,
    staffId: colId === 'unassigned' ? null : colId,
  })
}
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-(--color-border)">
    <div class="min-w-max">

      <!-- ── Header row ──────────────────────────────────────── -->
      <div class="flex border-b border-(--color-border) bg-(--color-surface)">

        <!-- Time column header (sticky start = right in RTL) -->
        <div class="w-14 shrink-0 sticky start-0 z-20 bg-(--color-surface) border-e border-(--color-border)/50" />

        <!-- Staff avatar columns -->
        <div
          v-for="col in columns"
          :key="col.id"
          class="w-44 shrink-0 flex flex-col items-center gap-1.5 px-3 py-3
                 border-e border-(--color-border)/50 last:border-e-0"
        >
          <template v-if="col.member">
            <UAvatar
              :src="col.member.photoUrl ?? undefined"
              :alt="col.member.name"
              :text="col.member.name.charAt(0)"
              size="md"
              class="ring-2"
              :class="getStaffColor(col.id).ring"
            />
            <span class="text-xs font-medium text-(--color-text) text-center leading-snug">
              {{ col.member.name }}
            </span>
          </template>
          <template v-else>
            <div class="size-8 rounded-full bg-(--color-surface-muted) flex items-center justify-center">
              <UIcon name="i-heroicons-question-mark-circle" class="size-5 text-(--color-text-muted)" />
            </div>
            <span class="text-xs text-(--color-text-muted)">{{ $t('admin.calendar.unassigned') }}</span>
          </template>
        </div>
      </div>

      <!-- ── Time slot rows ──────────────────────────────────── -->
      <div
        v-for="slot in timeSlots"
        :key="slot"
        class="flex"
        :class="slot.endsWith(':00')
          ? 'border-t border-(--color-border)'
          : 'border-t border-(--color-border)/30'"
      >
        <!-- Time label (sticky start = right in RTL) -->
        <div
          class="w-14 shrink-0 sticky start-0 z-10 bg-(--color-bg)
                 flex items-start justify-end pt-2 pe-3"
          :class="slot.endsWith(':30') ? 'opacity-25' : 'opacity-60'"
        >
          <span class="text-xs font-mono text-(--color-text-muted)" dir="ltr">{{ slot }}</span>
        </div>

        <!-- Staff cells -->
        <div
          v-for="col in columns"
          :key="col.id"
          class="w-44 shrink-0 min-h-[3.5rem] p-1.5
                 border-e border-(--color-border)/30 last:border-e-0
                 relative group/cell"
        >
          <!-- Existing bookings in this cell -->
          <div
            v-for="booking in cellBookings(slot, col.id)"
            :key="booking.id"
            class="rounded-lg px-2 py-1.5 border border-s-2 mb-1 last:mb-0
                   cursor-pointer select-none
                   transition-all duration-150
                   hover:shadow-md active:scale-[0.98]"
            :class="[getStaffColor(booking.staffId).bg, getStaffColor(booking.staffId).border]"
            @click="emit('open', booking)"
          >
            <p class="text-xs font-medium text-(--color-text) truncate leading-tight">
              {{ booking.contact.name }}
            </p>
            <p
              class="text-[11px] truncate leading-tight mt-0.5"
              :class="getStaffColor(booking.staffId).text"
            >
              {{ getServiceName(booking.serviceId) }}
              <span class="text-(--color-text-muted)">· {{ getServiceDuration(booking.serviceId) }}د</span>
            </p>
          </div>

          <!-- Empty cell: "+" appears on hover -->
          <button
            v-if="cellBookings(slot, col.id).length === 0"
            type="button"
            class="absolute inset-1 rounded-lg flex items-center justify-center gap-1
                   opacity-0 group-hover/cell:opacity-100
                   transition-opacity duration-100
                   hover:bg-(--color-surface-muted)/60
                   cursor-pointer text-(--color-text-muted)"
            @click="onEmptyCellClick(slot, col.id)"
          >
            <UIcon name="i-heroicons-plus" class="size-3.5" />
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add app/components/admin/AdminCalendarStaffGrid.vue
git commit -m "feat: add AdminCalendarStaffGrid — staff column × time slot view with hover + create"
```

---

## Task 9: Create `AdminCalendarAgenda`

**Files:**
- Create: `app/components/admin/AdminCalendarAgenda.vue`

**Step 1: Create the file**

```vue
<!-- app/components/admin/AdminCalendarAgenda.vue -->
<script setup lang="ts">
import type { Booking, StaffMember } from '~/types'
import type { StaffColorScheme } from '~/composables/admin/useCalendar'

const props = defineProps<{
  agendaBookings: Array<{ date: string; bookings: Booking[] }>
  today: string
  getStaffColor: (staffId: string | null) => StaffColorScheme
  getStaffMember: (staffId: string | null) => StaffMember | undefined
  getServiceName: (serviceId: string) => string
}>()

const emit = defineEmits<{ open: [booking: Booking] }>()

const { t, locale } = useI18n()

function formatGroupDate(date: string): string {
  const d         = new Date(date + 'T12:00:00')
  const todayD    = new Date(props.today + 'T12:00:00')
  const tomorrow  = new Date(todayD)
  tomorrow.setDate(todayD.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0] ?? ''

  if (date === props.today) return t('admin.today')
  if (date === tomorrowStr) return t('admin.tomorrow')
  return d.toLocaleDateString(
    locale.value === 'ar' ? 'ar-SA' : 'en-GB',
    { weekday: 'long', month: 'long', day: 'numeric' },
  )
}

const statusColor = (s: string): 'warning' | 'primary' | 'success' | 'neutral' => {
  const map: Record<string, 'warning' | 'primary' | 'success' | 'neutral'> = {
    pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'neutral',
  }
  return map[s] ?? 'neutral'
}
</script>

<template>
  <div v-if="agendaBookings.length > 0">
    <section
      v-for="group in agendaBookings"
      :key="group.date"
      class="border-b border-(--color-border) last:border-b-0 pb-1"
    >
      <!-- Sticky date heading -->
      <h3
        class="text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide
               px-4 py-2.5 sticky top-0 z-10 bg-(--color-bg)"
      >
        {{ formatGroupDate(group.date) }}
      </h3>

      <!-- Booking rows -->
      <div
        v-for="booking in group.bookings"
        :key="booking.id"
        class="flex items-center gap-3 mx-2 px-3 py-3 rounded-xl
               cursor-pointer select-none
               transition-colors duration-150
               hover:bg-(--color-surface-muted)/50"
        @click="emit('open', booking)"
      >
        <!-- Color dot -->
        <div
          class="w-2 h-2 rounded-full shrink-0"
          :class="getStaffColor(booking.staffId).dot"
        />

        <!-- Time -->
        <span
          class="w-11 text-sm font-mono text-(--color-text-muted) shrink-0 tabular-nums"
          dir="ltr"
        >
          {{ booking.time }}
        </span>

        <!-- Name + service -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-(--color-text) truncate leading-tight">
            {{ booking.contact.name }}
          </p>
          <p class="text-xs text-(--color-text-muted) truncate leading-tight mt-0.5">
            {{ getServiceName(booking.serviceId) }}
          </p>
        </div>

        <!-- Staff avatar + status -->
        <div class="flex items-center gap-2 shrink-0">
          <UAvatar
            v-if="getStaffMember(booking.staffId)"
            :src="getStaffMember(booking.staffId)?.photoUrl ?? undefined"
            :alt="getStaffMember(booking.staffId)?.name ?? ''"
            :text="getStaffMember(booking.staffId)?.name.charAt(0) ?? ''"
            size="xs"
            class="ring-2"
            :class="getStaffColor(booking.staffId).ring"
          />
          <UBadge :color="statusColor(booking.status)" variant="subtle" size="xs">
            {{ $t(`admin.bookingStatus.${booking.status}`) }}
          </UBadge>
        </div>
      </div>
    </section>
  </div>

  <UEmpty
    v-else
    icon="i-heroicons-calendar-days"
    :description="$t('admin.calendar.upcomingEmpty')"
    class="py-20"
  />
</template>
```

**Step 2: Commit**

```bash
git add app/components/admin/AdminCalendarAgenda.vue
git commit -m "feat: add AdminCalendarAgenda — chronological upcoming bookings list"
```

---

## Task 10: Create `AdminBookingSlideOver`

**Files:**
- Create: `app/components/admin/AdminBookingSlideOver.vue`

> **USlideover API (Nuxt UI v3):** Default slot = trigger (omit when controlling programmatically). Use `#body` for content, `#footer` for actions. `title` prop sets the header title. Control with `v-model:open` or `:open` + `@update:open`.

**Step 1: Create the file**

```vue
<!-- app/components/admin/AdminBookingSlideOver.vue -->
<script setup lang="ts">
import { parseDate } from '@internationalized/date'
import type { CalendarDate } from '@internationalized/date'
import type { Booking, Service, StaffMember } from '~/types'
import type { CreateBookingDefaults } from '~/composables/admin/useCalendar'

const props = defineProps<{
  mode: 'view' | 'create'
  booking?: Booking | null
  createDefaults?: CreateBookingDefaults | null
  services: Service[]
  staffList: StaffMember[]
  timeSlots: string[]
  getServiceName: (serviceId: string) => string
  getServiceDuration: (serviceId: string) => number
}>()

const emit = defineEmits<{
  close:    []
  confirm:  [id: string]
  cancel:   [id: string]
  complete: [id: string]
  create:   [payload: {
    serviceId: string; staffId: string | null
    date: string; time: string; customerName: string; customerPhone: string
  }]
}>()

const { t, locale } = useI18n()
const confirmingCancel = ref(false)
const datePickerOpen   = ref(false)

// Create form
const form = reactive({
  serviceId:     '',
  staffId:       null as string | null,
  date:          '',
  time:          '',
  customerName:  '',
  customerPhone: '',
})

// Pre-fill create form when defaults change
watch(() => props.createDefaults, (d) => {
  if (!d) return
  form.serviceId     = ''
  form.staffId       = d.staffId
  form.date          = d.date
  form.time          = d.time
  form.customerName  = ''
  form.customerPhone = ''
  confirmingCancel.value = false
}, { immediate: true })

// Reset cancel confirmation when booking changes
watch(() => props.booking, () => { confirmingCancel.value = false })

const isOpen = computed(() =>
  props.mode === 'view' ? !!props.booking : !!props.createDefaults,
)

const slideTitle = computed(() =>
  props.mode === 'view'
    ? (props.booking?.contact.name ?? '')
    : t('admin.newBooking'),
)

// View mode helpers
const statusColor = computed((): 'warning' | 'primary' | 'success' | 'neutral' => {
  const map = { pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'neutral' } as const
  return props.booking ? map[props.booking.status] : 'neutral'
})
const canConfirm  = computed(() => props.booking?.status === 'pending')
const canComplete = computed(() => props.booking?.status === 'confirmed')
const canCancel   = computed(() =>
  props.booking?.status !== 'completed' && props.booking?.status !== 'cancelled',
)

// Create form helpers
const serviceOptions = computed(() =>
  props.services.map(s => ({ label: s.name, value: s.id })),
)
const staffOptions = computed(() => [
  { label: t('admin.calendar.noPreference'), value: '__none__' },
  ...props.staffList.map(s => ({ label: s.name, value: s.id })),
])
const staffSelectValue = computed({
  get: () => form.staffId ?? '__none__',
  set: (v: string) => { form.staffId = v === '__none__' ? null : v },
})
const timeOptions = computed(() =>
  props.timeSlots.map(slot => ({ label: slot, value: slot })),
)
const calendarValue = computed(() => form.date ? parseDate(form.date) : undefined)

function onDateSelect(val: CalendarDate | CalendarDate[] | undefined) {
  if (!val || Array.isArray(val)) return
  form.date = val.toString()
  datePickerOpen.value = false
}

const formattedDate = computed(() => {
  const date = props.mode === 'view' ? props.booking?.date : form.date
  if (!date) return t('common.selectDate')
  return new Date(date + 'T12:00:00').toLocaleDateString(
    locale.value === 'ar' ? 'ar-SA' : 'en-GB',
    { weekday: 'long', month: 'long', day: 'numeric' },
  )
})

const isFormValid = computed(() =>
  !!form.serviceId && !!form.date && !!form.time &&
  form.customerName.trim().length > 0 && form.customerPhone.trim().length > 0,
)

function submitCreate() {
  if (!isFormValid.value) return
  emit('create', {
    serviceId:     form.serviceId,
    staffId:       form.staffId,
    date:          form.date,
    time:          form.time,
    customerName:  form.customerName.trim(),
    customerPhone: form.customerPhone.trim(),
  })
}

function onClose() {
  confirmingCancel.value = false
  emit('close')
}
</script>

<template>
  <USlideover
    :open="isOpen"
    :title="slideTitle"
    @update:open="(v) => !v && onClose()"
  >
    <!-- ── BODY ────────────────────────────────────────────── -->
    <template #body>

      <!-- VIEW MODE -->
      <div v-if="mode === 'view' && booking" class="space-y-5 p-4">
        <!-- Status badge -->
        <UBadge :color="statusColor" variant="subtle">
          {{ $t(`admin.bookingStatus.${booking.status}`) }}
        </UBadge>

        <!-- Phone (tappable on mobile) -->
        <a
          :href="`tel:${booking.contact.phone}`"
          class="flex items-center gap-2 text-sm text-(--color-text-muted)
                 hover:text-(--color-primary) transition-colors duration-150"
          dir="ltr"
        >
          <UIcon name="i-heroicons-phone" class="size-4 shrink-0" />
          {{ booking.contact.phone }}
        </a>

        <USeparator />

        <!-- Service + duration -->
        <div>
          <p class="font-medium text-(--color-text)">
            {{ getServiceName(booking.serviceId) }}
          </p>
          <p class="text-sm text-(--color-text-muted) mt-0.5">
            {{ getServiceDuration(booking.serviceId) }}د
          </p>
        </div>

        <!-- Date + time -->
        <div class="flex items-center gap-2 text-sm text-(--color-text-muted)">
          <UIcon name="i-heroicons-calendar-days" class="size-4 shrink-0" />
          <span>{{ formattedDate }}</span>
          <span class="font-mono tabular-nums" dir="ltr">{{ booking.time }}</span>
        </div>
      </div>

      <!-- CREATE MODE -->
      <div v-else-if="mode === 'create'" class="space-y-4 p-4">
        <UFormField :label="$t('admin.calendar.selectService')" required>
          <USelect
            v-model="form.serviceId"
            :options="serviceOptions"
            :placeholder="$t('admin.calendar.selectService')"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('admin.calendar.selectStaff')">
          <USelect
            v-model="staffSelectValue"
            :options="staffOptions"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('common.date')" required>
          <UPopover v-model:open="datePickerOpen">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-heroicons-calendar-days"
              :label="formattedDate"
              class="w-full justify-start font-normal"
            />
            <template #content>
              <UCalendar
                :model-value="calendarValue"
                class="p-2"
                @update:model-value="onDateSelect"
              />
            </template>
          </UPopover>
        </UFormField>

        <UFormField :label="$t('admin.calendar.selectTime')" required>
          <USelect
            v-model="form.time"
            :options="timeOptions"
            :placeholder="$t('admin.calendar.selectTime')"
            class="w-full"
          />
        </UFormField>

        <USeparator />

        <UFormField :label="$t('booking.name')" required>
          <UInput
            v-model="form.customerName"
            :placeholder="$t('booking.namePlaceholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('booking.phone')" required>
          <UInput
            v-model="form.customerPhone"
            type="tel"
            dir="ltr"
            :placeholder="$t('booking.phonePlaceholder')"
            class="w-full"
          />
        </UFormField>
      </div>

    </template>

    <!-- ── FOOTER ──────────────────────────────────────────── -->
    <template #footer>

      <!-- VIEW MODE ACTIONS -->
      <div v-if="mode === 'view' && booking" class="flex flex-col gap-2 p-4 w-full">
        <template v-if="confirmingCancel">
          <div class="flex items-center gap-2">
            <p class="text-sm text-red-600 dark:text-red-400 flex-1">
              {{ $t('admin.confirmCancelBooking') }}
            </p>
            <UButton
              color="error" variant="solid" size="sm"
              @click="emit('cancel', booking.id)"
            >
              {{ $t('common.confirm') }}
            </UButton>
            <UButton
              color="neutral" variant="ghost" size="sm"
              @click="confirmingCancel = false"
            >
              {{ $t('common.back') }}
            </UButton>
          </div>
        </template>
        <template v-else>
          <UButton
            v-if="canConfirm"
            color="primary" variant="solid" block
            @click="emit('confirm', booking.id)"
          >
            {{ $t('common.confirm') }}
          </UButton>
          <UButton
            v-if="canComplete"
            color="success" variant="solid" block
            @click="emit('complete', booking.id)"
          >
            {{ $t('admin.completeBooking') }}
          </UButton>
          <UButton
            v-if="canCancel"
            color="neutral" variant="ghost" block
            class="hover:bg-red-50 hover:text-red-600
                   dark:hover:bg-red-950/30 dark:hover:text-red-400
                   transition-colors duration-150"
            @click="confirmingCancel = true"
          >
            {{ $t('common.cancel') }}
          </UButton>
        </template>
      </div>

      <!-- CREATE MODE ACTIONS -->
      <div v-else-if="mode === 'create'" class="p-4 w-full">
        <UButton
          color="primary" variant="solid" block
          :disabled="!isFormValid"
          @click="submitCreate"
        >
          {{ $t('admin.calendar.addBooking') }}
        </UButton>
      </div>

    </template>
  </USlideover>
</template>
```

**Step 2: Commit**

```bash
git add app/components/admin/AdminBookingSlideOver.vue
git commit -m "feat: add AdminBookingSlideOver — view + create modes with USlideover"
```

---

## Task 11: Rewrite `admin/index.vue`

**Files:**
- Modify: `app/pages/admin/index.vue`

Wire up all new components. Remove `useStaff()` (staff is already in `useCalendar().staffList`). Remove the old inline entry actions — slide-over handles them now.

**Step 1: Replace the file**

```vue
<!-- app/pages/admin/index.vue -->
<script setup lang="ts">
import type { Booking, Service, StaffMember } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const {
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
  isLoading,
} = useCalendar()

const { services } = useServices()

function getServiceName(serviceId: string): string {
  return services.value.find(s => s.id === serviceId)?.name ?? serviceId
}
function getServiceDuration(serviceId: string): number {
  return services.value.find(s => s.id === serviceId)?.durationMinutes ?? 0
}
function getStaffPhotoUrl(staffId: string | null): string | null {
  return getStaffMember(staffId)?.photoUrl ?? null
}
function getStaffNameStr(staffId: string | null): string | null {
  return getStaffMember(staffId)?.name ?? null
}

// Slide-over is open when a booking is selected OR create mode is active
const slideOverMode  = computed(() => selectedBooking.value ? 'view' : 'create')
const slideOverOpen  = computed(() => !!selectedBooking.value || !!createDefaults.value)

function handleSlideOverClose() {
  closeBooking()
  closeCreateBooking()
}
async function handleConfirm(id: string)  { await confirmBooking(id) }
async function handleCancel(id: string)   { await cancelBooking(id) }
async function handleComplete(id: string) { await completeBooking(id) }
async function handleCreate(payload: Parameters<typeof createBookingOnCalendar>[0]) {
  await createBookingOnCalendar(payload)
}
</script>

<template>
  <UDashboardPanel id="calendar">
    <template #header>
      <UDashboardNavbar :title="$t('admin.calendar.label')" />
    </template>

    <template #body>

      <!-- ── View switcher + week strip (hidden in agenda view) ── -->
      <div class="px-4 pt-4 pb-0 space-y-3">
        <AdminCalendarViewSwitcher v-model="selectedView" />
        <AdminCalendarWeekStrip
          v-if="selectedView !== 'agenda'"
          :week-days="weekDays"
          :selected-date="selectedDate"
          :today="today"
          @select="selectedDate = $event"
        />
      </div>

      <!-- ── Day header: nav controls + date picker (non-agenda) ─ -->
      <div
        v-if="selectedView !== 'agenda'"
        class="flex items-center justify-between px-4 py-3"
      >
        <!-- Prev / Today / Next -->
        <UButtonGroup size="sm">
          <UButton
            color="neutral" variant="ghost"
            icon="i-heroicons-chevron-right"
            :aria-label="$t('common.back')"
            @click="goPrevDay"
          />
          <UButton
            v-if="selectedDate !== today"
            color="neutral" variant="soft" size="sm"
            @click="goToToday"
          >
            {{ $t('admin.today') }}
          </UButton>
          <UButton
            color="neutral" variant="ghost"
            icon="i-heroicons-chevron-left"
            :aria-label="$t('common.next')"
            @click="goNextDay"
          />
        </UButtonGroup>

        <!-- Clickable date heading with calendar picker -->
        <AdminCalendarDatePicker
          :selected-date="selectedDate"
          :today="today"
          @select="selectedDate = $event"
        />
      </div>

      <!-- ── DAY VIEW ─────────────────────────────────────────── -->
      <div v-if="selectedView === 'day'" class="px-4 pb-4">
        <div v-if="bookingsForSelectedDate.length > 0">
          <div
            v-for="slot in timeSlots"
            :key="slot"
            class="flex items-start gap-4"
            :class="slot.endsWith(':00') ? 'border-t border-(--color-border)' : ''"
          >
            <!-- Time label -->
            <div
              class="w-14 shrink-0 pt-4 text-sm font-medium font-mono
                     text-end text-(--color-text-muted)"
              dir="ltr"
              :class="slot.endsWith(':30') ? 'opacity-40' : 'opacity-80'"
            >
              {{ slot }}
            </div>

            <!-- Bookings + empty-slot button -->
            <div class="flex-1 py-2 space-y-2 min-h-[4rem] relative group/slot">
              <AdminCalendarEntry
                v-for="booking in bookingsBySlot.get(slot)"
                :key="booking.id"
                :booking="booking"
                :service-name="getServiceName(booking.serviceId)"
                :staff-name="getStaffNameStr(booking.staffId)"
                :staff-photo-url="getStaffPhotoUrl(booking.staffId)"
                :color-scheme="getStaffColor(booking.staffId)"
                :duration-minutes="getServiceDuration(booking.serviceId)"
                @open="openBooking"
              />

              <!-- Empty slot hover button -->
              <button
                v-if="!bookingsBySlot.get(slot)?.length"
                type="button"
                class="absolute inset-x-0 inset-y-0 rounded-xl flex items-center justify-center gap-1.5
                       opacity-0 group-hover/slot:opacity-100 transition-opacity duration-150
                       hover:bg-(--color-surface-muted)/50 cursor-pointer
                       text-xs text-(--color-text-muted)"
                @click="openCreateBooking(selectedDate, slot, null)"
              >
                <UIcon name="i-heroicons-plus" class="size-3.5" />
                {{ $t('admin.newBooking') }}
              </button>
            </div>
          </div>
        </div>

        <UEmpty
          v-else
          icon="i-heroicons-calendar-days"
          :description="$t('admin.calendar.noBookings')"
          class="py-20"
        />
      </div>

      <!-- ── STAFF GRID VIEW ──────────────────────────────────── -->
      <div v-else-if="selectedView === 'staff'" class="px-4 pb-4">
        <AdminCalendarStaffGrid
          :time-slots="timeSlots"
          :staff-list="staffList ?? []"
          :selected-date="selectedDate"
          :bookings-by-slot-and-staff="bookingsBySlotAndStaff"
          :get-staff-color="getStaffColor"
          :get-service-name="getServiceName"
          :get-service-duration="getServiceDuration"
          :is-loading="isLoading"
          @open="openBooking"
          @create="({ date, time, staffId }) => openCreateBooking(date, time, staffId)"
        />
      </div>

      <!-- ── AGENDA VIEW ───────────────────────────────────────── -->
      <div v-else-if="selectedView === 'agenda'" class="pt-2">
        <AdminCalendarAgenda
          :agenda-bookings="agendaBookings"
          :today="today"
          :get-staff-color="getStaffColor"
          :get-staff-member="getStaffMember"
          :get-service-name="getServiceName"
          @open="openBooking"
        />
      </div>

    </template>
  </UDashboardPanel>

  <!-- ── Slide-over (rendered outside panel, teleported to body) ── -->
  <AdminBookingSlideOver
    :mode="slideOverMode"
    :booking="selectedBooking"
    :create-defaults="createDefaults"
    :services="services"
    :staff-list="staffList ?? []"
    :time-slots="timeSlots"
    :get-service-name="getServiceName"
    :get-service-duration="getServiceDuration"
    @close="handleSlideOverClose"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @complete="handleComplete"
    @create="handleCreate"
  />
</template>
```

**Step 2: Run dev server and verify**

```bash
npm run dev
```

Navigate to `http://localhost:3000/admin`.

**Day view checklist:**
- [ ] View switcher shows Day / Staff / Agenda buttons — active is solid, others ghost
- [ ] Week strip uses `UButton`, dots appear on days with bookings
- [ ] Day heading is clickable → `UPopover` opens with `UCalendar` → selecting a date navigates there
- [ ] Prev/Next/Today in a `UButtonGroup`, Today disappears when on today
- [ ] Booking cards show staff `UAvatar` with colored ring
- [ ] Hovering a card: subtle shadow lift + `-translate-x-px`
- [ ] Clicking a card → `USlideover` opens with booking details
- [ ] Sliding over shows phone (tappable), service, date/time, context actions
- [ ] Confirm/Complete/Cancel actions work; Cancel shows inline confirmation
- [ ] Hovering an empty slot → "+" button with `admin.newBooking` label appears
- [ ] Clicking empty slot → slide-over opens in create mode with pre-filled date/time
- [ ] Create form validates required fields before enabling submit
- [ ] Submitting creates booking and refreshes calendar

**Staff Grid checklist:**
- [ ] Columns show staff UAvatars with colored rings
- [ ] Time labels sticky on start (right in RTL), header sticky on top
- [ ] Bookings appear in the correct cell
- [ ] Hovering empty cell → "+" icon appears
- [ ] Clicking booking → slide-over view mode
- [ ] Clicking empty cell → slide-over create mode (staff pre-filled)

**Agenda checklist:**
- [ ] Shows upcoming 30 days of non-cancelled bookings
- [ ] Grouped by date: "اليوم" / "غداً" / full Arabic date
- [ ] Each row: color dot, time, name, service, staff avatar, status badge
- [ ] Hover → subtle background
- [ ] Clicking row → slide-over view mode
- [ ] Week strip and day header are hidden

**Dark mode + RTL:**
- [ ] All dark: classes work (teal-950, rose-950, etc.)
- [ ] Week strip RTL: Sunday on right
- [ ] Staff grid: time column sticks on right

**Step 3: Commit**

```bash
git add app/pages/admin/index.vue
git commit -m "feat: wire up calendar redesign — views, slide-over, date picker, create booking"
```

---

## What's Next

Calendar redesign is complete. Open items for future sessions:

1. **Toast notifications** — success toast after creating/confirming/completing a booking (`useToast()`)
2. **Edit booking** — extend the slide-over with an edit mode (change date/time/staff)
3. **Loading skeleton** — show `USkeleton` while `isLoading` is true in the staff grid
4. **Month view** — deferred; add as a 4th view option when needed
