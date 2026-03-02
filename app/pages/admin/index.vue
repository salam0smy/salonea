<!-- app/pages/admin/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })

const { t } = useI18n()
const {
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
} = useCalendar()

const { services } = useServices()
const { staff }    = useStaff()

function getServiceName(serviceId: string): string {
  return services.value.find(s => s.id === serviceId)?.name ?? serviceId
}

function getServiceDuration(serviceId: string): number {
  return services.value.find(s => s.id === serviceId)?.durationMinutes ?? 0
}

function getStaffName(staffId: string | null): string | null {
  if (!staffId) return null
  return staff.value.find(s => s.id === staffId)?.name ?? staffId
}

// Human-readable heading for the selected date
const dateHeading = computed(() => {
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
  if (selectedDate.value === today)     return t('admin.today')
  if (selectedDate.value === yesterday) return t('admin.yesterday')
  return new Date(selectedDate.value + 'T12:00:00').toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
</script>

<template>
  <div>

    <!-- ── Week strip ─────────────────────────────────────── -->
    <div class="mb-5">
      <AdminCalendarWeekStrip
        :week-days="weekDays"
        :selected-date="selectedDate"
        :today="today"
        @select="selectedDate = $event"
      />
    </div>

    <!-- ── Day header ─────────────────────────────────────── -->
    <!--
      RTL note: chevron-right (→) is the LEADING direction in RTL = going to an earlier/previous date.
      chevron-left (←) = going to a later/next date. This matches Apple Calendar behaviour in Arabic.
    -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-lg font-semibold text-(--color-text) flex-1 text-end">
        {{ dateHeading }}
      </h1>
      <div class="flex items-center gap-1 ms-4">
        <UButton
          v-if="selectedDate !== today"
          size="sm"
          color="neutral"
          variant="soft"
          @click="goToToday"
        >
          {{ $t('admin.today') }}
        </UButton>
        <!-- RTL: chevron-right points toward start (right) = earlier day -->
        <UButton
          size="sm" color="neutral" variant="ghost"
          icon="i-heroicons-chevron-right"
          :aria-label="$t('common.back')"
          @click="goPrevDay"
        />
        <!-- RTL: chevron-left points toward end (left) = later day -->
        <UButton
          size="sm" color="neutral" variant="ghost"
          icon="i-heroicons-chevron-left"
          :aria-label="$t('common.next')"
          @click="goNextDay"
        />
      </div>
    </div>

    <!-- ── Timeline ───────────────────────────────────────── -->
    <div v-if="bookingsForSelectedDate.length > 0">
      <div
        v-for="slot in timeSlots"
        :key="slot"
        class="flex items-start gap-4"
        :class="slot.endsWith(':00') ? 'border-t border-(--color-border)' : ''"
      >
        <!-- Time label (dir=ltr keeps digits in numeric order even in RTL layout) -->
        <div
          class="w-14 shrink-0 pt-4 text-sm font-medium font-mono text-end text-(--color-text-muted)"
          dir="ltr"
          :class="slot.endsWith(':30') ? 'opacity-40' : 'opacity-80'"
        >
          {{ slot }}
        </div>

        <!-- Booking entries for this slot (flex-1 fills the rest of the row) -->
        <div class="flex-1 py-3 space-y-2 min-h-[4rem]">
          <AdminCalendarEntry
            v-for="booking in bookingsBySlot.get(slot)"
            :key="booking.id"
            :booking="booking"
            :service-name="getServiceName(booking.serviceId)"
            :staff-name="getStaffName(booking.staffId)"
            :color-scheme="getStaffColor(booking.staffId)"
            :duration-minutes="getServiceDuration(booking.serviceId)"
            @confirm="confirmBooking"
            @cancel="cancelBooking"
            @complete="completeBooking"
          />
        </div>
      </div>
    </div>

    <!-- ── Empty state ────────────────────────────────────── -->
    <UEmpty
      v-else
      icon="i-heroicons-calendar-days"
      :description="$t('admin.calendar.noBookings')"
      class="py-20"
    />

  </div>
</template>
