<!-- app/components/admin/AdminCalendarEntry.vue -->
<script setup lang="ts">
import type { Booking } from '~/types'
import type { StaffColorScheme } from '~/composables/admin/useCalendar'

const props = defineProps<{
  booking: Booking
  serviceName: string
  staffName: string | null
  colorScheme: StaffColorScheme
  durationMinutes: number
}>()

const emit = defineEmits<{
  confirm: [id: string]
  cancel: [id: string]
  complete: [id: string]
}>()

const confirmingCancel = ref(false)

const canConfirm  = computed(() => props.booking.status === 'pending')
const canCancel   = computed(() =>
  props.booking.status !== 'completed' && props.booking.status !== 'cancelled',
)
const canComplete = computed(() => props.booking.status === 'confirmed')

const statusColor = computed((): 'warning' | 'primary' | 'success' | 'neutral' => {
  const map = {
    pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'neutral',
  } as const
  return map[props.booking.status]
})
</script>

<template>
  <div
    class="rounded-xl border border-s-2 px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 transition-colors"
    :class="[colorScheme.bg, colorScheme.border]"
  >
    <!-- Dot + name + service line -->
    <div class="flex items-center gap-2 flex-1 min-w-0">
      <div class="w-2 h-2 rounded-full shrink-0" :class="colorScheme.dot" />
      <div class="min-w-0">
        <p class="text-sm font-medium text-gray-900 truncate">
          {{ booking.contact.name }}
        </p>
        <p class="text-xs truncate" :class="colorScheme.text">
          {{ serviceName }}
          <span v-if="staffName"> · {{ staffName }}</span>
          <span class="text-gray-400"> · {{ durationMinutes }}د</span>
        </p>
      </div>
    </div>

    <!-- Status badge -->
    <UBadge :color="statusColor" variant="subtle" size="xs" class="shrink-0">
      {{ $t(`admin.bookingStatus.${booking.status}`) }}
    </UBadge>

    <!-- Actions -->
    <div class="flex items-center gap-1 shrink-0 ms-auto">
      <template v-if="confirmingCancel">
        <span class="text-xs text-red-600 font-medium me-1">
          {{ $t('admin.confirmCancelBooking') }}
        </span>
        <UButton
          size="xs" color="error" variant="solid"
          @click="emit('cancel', booking.id); confirmingCancel = false"
        >
          {{ $t('common.confirm') }}
        </UButton>
        <UButton
          size="xs" color="neutral" variant="ghost"
          @click="confirmingCancel = false"
        >
          {{ $t('common.cancel') }}
        </UButton>
      </template>

      <template v-else>
        <UButton
          v-if="canConfirm"
          size="xs" color="primary" variant="soft"
          @click="emit('confirm', booking.id)"
        >
          {{ $t('common.confirm') }}
        </UButton>
        <UButton
          v-if="canComplete"
          size="xs" color="success" variant="soft"
          @click="emit('complete', booking.id)"
        >
          {{ $t('admin.completeBooking') }}
        </UButton>
        <UButton
          v-if="canCancel"
          size="xs" color="neutral" variant="ghost"
          icon="i-heroicons-x-mark"
          :aria-label="$t('common.cancel')"
          @click="confirmingCancel = true"
        />
      </template>
    </div>
  </div>
</template>
