<!-- app/pages/admin/index.vue -->
<script setup lang="ts">
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

// Panel is open when a booking is selected OR create mode is active (same pattern as services add/edit)
const panelMode = computed(() => selectedBooking.value ? 'view' : 'create')

function handlePanelClose() {
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

  <!-- ── Booking panel (same pattern as AdminServiceFormPanel: sibling panel for view/create) ── -->
  <AdminBookingPanel
    v-if="selectedBooking || createDefaults"
    :mode="panelMode"
    :booking="selectedBooking"
    :create-defaults="createDefaults"
    :services="services"
    :staff-list="staffList ?? []"
    :time-slots="timeSlots"
    :get-service-name="getServiceName"
    :get-service-duration="getServiceDuration"
    @close="handlePanelClose"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @complete="handleComplete"
    @create="handleCreate"
  />
</template>
