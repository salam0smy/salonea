<!-- app/components/admin/AdminBookingCard.vue -->
<script setup lang="ts">
import type { Booking } from '~/types'

const props = defineProps<{
  booking: Booking
  serviceName: string
  staffName: string | null
}>()

const emit = defineEmits<{
  confirm: [id: string]
  cancel: [id: string]
  complete: [id: string]
}>()

const confirmingCancel = ref(false)

// Map status → Nuxt UI badge color
const statusColor = computed((): 'warning' | 'primary' | 'success' | 'neutral' => {
  const map = {
    pending: 'warning',
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'neutral',
  } as const
  return map[props.booking.status]
})

// Action visibility rules
const canConfirm = computed(() => props.booking.status === 'pending')
const canCancel = computed(
  () => props.booking.status !== 'completed' && props.booking.status !== 'cancelled',
)
const canComplete = computed(() => props.booking.status === 'confirmed')
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 bg-(--color-surface) rounded-xl border border-(--color-border) transition-colors"
  >
    <!-- Customer info -->
    <div class="flex-1 min-w-0">
      <p class="font-medium text-(--color-text) text-sm truncate">
        {{ booking.contact.name }}
      </p>
      <p class="text-xs text-(--color-text-muted) mt-0.5 font-mono" dir="ltr">
        {{ booking.contact.phone }}
      </p>
    </div>

    <!-- Appointment details -->
    <div class="shrink-0 text-sm text-(--color-text-muted) text-end">
      <p class="truncate max-w-36">{{ serviceName }}</p>
      <p class="text-xs text-(--color-text-muted) mt-0.5">
        {{ booking.time }}
        <span v-if="staffName"> · {{ staffName }}</span>
      </p>
    </div>

    <!-- Status badge -->
    <div class="shrink-0">
      <UBadge :color="statusColor" variant="subtle" size="sm">
        {{ $t(`admin.bookingStatus.${booking.status}`) }}
      </UBadge>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 shrink-0 ms-auto">
      <!-- Inline cancel confirmation -->
      <template v-if="confirmingCancel">
        <span class="text-xs text-red-600 font-medium me-1">
          {{ $t('admin.confirmCancelBooking') }}
        </span>
        <UButton
          size="xs"
          color="error"
          variant="solid"
          @click="emit('cancel', booking.id); confirmingCancel = false"
        >
          {{ $t('common.confirm') }}
        </UButton>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          @click="confirmingCancel = false"
        >
          {{ $t('common.cancel') }}
        </UButton>
      </template>

      <template v-else>
        <!-- Confirm button (pending only) -->
        <UButton
          v-if="canConfirm"
          size="xs"
          color="primary"
          variant="soft"
          @click="emit('confirm', booking.id)"
        >
          {{ $t('common.confirm') }}
        </UButton>

        <!-- Complete button (confirmed only) -->
        <UButton
          v-if="canComplete"
          size="xs"
          color="success"
          variant="soft"
          @click="emit('complete', booking.id)"
        >
          {{ $t('admin.completeBooking') }}
        </UButton>

        <!-- Cancel button (pending or confirmed) -->
        <UButton
          v-if="canCancel"
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-x-mark"
          :aria-label="$t('common.cancel')"
          @click="confirmingCancel = true"
        />
      </template>
    </div>
  </div>
</template>
