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

const isPaid = computed(() => props.booking.paymentStatus === 'paid')
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

    <!-- Status + payment -->
    <div class="flex items-center gap-1 shrink-0">
      <UBadge :color="statusColor" variant="subtle" size="xs">
        {{ $t(`admin.bookingStatus.${booking.status}`) }}
      </UBadge>
      <span
        v-if="isPaid"
        class="inline-flex items-center justify-center rounded-full border border-green-500/40 bg-green-500/10 px-1.5 py-0.5"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-green-500 me-1" />
        <span class="text-[10px] font-medium text-green-600">
          {{ $t('admin.paymentStatus.paid') }}
        </span>
      </span>
    </div>

    <!-- Chevron hint -->
    <UIcon
      name="i-heroicons-chevron-left"
      class="size-3.5 shrink-0 text-(--color-text-muted) opacity-40"
    />
  </div>
</template>
