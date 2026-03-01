<!-- app/pages/admin/bookings.vue -->
<script setup lang="ts">
import type { BookingStatus } from '~/types'

definePageMeta({ 
  layout: 'admin', 
  middleware: 'auth'
 })

const { t } = useI18n()

const { activeFilter, bookingsByDate, confirmBooking, cancelBooking, completeBooking } =
  useBookings()
const { services } = useServices()
const { staff } = useStaff()

// Status filter tab definitions
const filters: Array<{ value: BookingStatus | 'all'; label: string }> = [
  { value: 'all',       label: t('admin.filterAll') },
  { value: 'pending',   label: t('admin.bookingStatus.pending') },
  { value: 'confirmed', label: t('admin.bookingStatus.confirmed') },
  { value: 'completed', label: t('admin.bookingStatus.completed') },
  { value: 'cancelled', label: t('admin.bookingStatus.cancelled') },
]

// Resolve IDs to display names
function getServiceName(serviceId: string): string {
  return services.value.find(s => s.id === serviceId)?.name ?? serviceId
}

function getStaffName(staffId: string | null): string | null {
  if (!staffId) return null
  return staff.value.find(s => s.id === staffId)?.name ?? staffId
}

// Human-readable date heading
function formatDateHeading(date: string): string {
  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
  if (date === today)     return t('admin.today')
  if (date === yesterday) return t('admin.yesterday')
  return new Date(date).toLocaleDateString('ar-SA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-(--color-text)">
        {{ $t('admin.bookings') }}
      </h1>
    </div>

    <!-- Status filter tabs -->
    <div class="flex flex-wrap gap-2 mb-6">
      <UButton
        v-for="f in filters"
        :key="f.value"
        size="sm"
        :color="activeFilter === f.value ? 'primary' : 'neutral'"
        :variant="activeFilter === f.value ? 'solid' : 'ghost'"
        @click="activeFilter = f.value"
      >
        {{ f.label }}
      </UButton>
    </div>

    <!-- Date-grouped booking list -->
    <div v-if="bookingsByDate.length > 0" class="space-y-6">
      <section
        v-for="group in bookingsByDate"
        :key="group.date"
      >
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {{ formatDateHeading(group.date) }}
        </h2>
        <div class="space-y-2">
          <AdminBookingCard
            v-for="booking in group.bookings"
            :key="booking.id"
            :booking="booking"
            :service-name="getServiceName(booking.serviceId)"
            :staff-name="getStaffName(booking.staffId)"
            @confirm="confirmBooking"
            @cancel="cancelBooking"
            @complete="completeBooking"
          />
        </div>
      </section>
    </div>

    <!-- Empty state -->
    <p v-else class="text-center text-gray-400 py-16">
      {{ $t('admin.noBookings') }}
    </p>
  </div>
</template>
