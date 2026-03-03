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
  open: [booking: Booking]
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
    date: props.selectedDate,
    time: slot,
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
