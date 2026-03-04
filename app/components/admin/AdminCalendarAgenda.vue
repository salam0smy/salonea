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
const colorMode = useColorMode()

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
        <ClientOnly>
          <UBadge :color="statusColor(booking.status)" :variant="colorMode.value === 'light' ? 'solid' : 'soft'" size="xs">
            {{ $t(`admin.bookingStatus.${booking.status}`) }}
          </UBadge>
          <template #fallback>
            <UBadge :color="statusColor(booking.status)" variant="soft" size="xs">
              {{ $t(`admin.bookingStatus.${booking.status}`) }}
            </UBadge>
          </template>
        </ClientOnly>
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
