<!-- app/components/booking/BookingServiceCard.vue -->
<script setup lang="ts">
import type { Service } from '~/types'

const { t } = useI18n()

defineProps<{
  service: Service
  selected: boolean
}>()

const emit = defineEmits<{
  select: [service: Service]
}>()

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} ${t('booking.minuteLabel')}`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return h === 1 ? t('booking.hourLabel') : `${h} ${t('booking.hoursLabel')}`
  return t('booking.hourAndMinutes', { hours: h, minutes: m })
}
</script>

<template>
  <button
    class="w-full text-start p-5 rounded-[16px] border transition-all duration-300"
    :class="selected
      ? 'border-salona-300 bg-salona-50/50 shadow-sm dark:bg-salona-950/40 dark:border-salona-400'
      : 'border-(--color-border) bg-(--color-surface) hover:border-gray-300 dark:hover:border-gray-600'"
    @click="emit('select', service)"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="flex-1 min-w-0">
        <p class="font-medium text-lg" :class="selected ? 'text-salona-900 dark:text-salona-100' : 'text-(--color-text)'">{{ service.name }}</p>
        <p class="text-sm mt-1" :class="selected ? 'text-salona-700 dark:text-salona-300' : 'text-(--color-text-muted)'">{{ formatDuration(service.durationMinutes) }}</p>
      </div>
      <div class="shrink-0 text-end">
        <span class="font-semibold text-lg" :class="selected ? 'text-salona-900 dark:text-salona-100' : 'text-(--color-text)'">{{ service.price }}</span>
        <span class="text-sm ms-0.5" :class="selected ? 'text-salona-700 dark:text-salona-300' : 'text-(--color-text-muted)'"> {{ t('common.sar') }}</span>
      </div>
    </div>
  </button>
</template>
