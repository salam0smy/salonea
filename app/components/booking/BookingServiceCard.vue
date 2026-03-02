<!-- app/components/booking/BookingServiceCard.vue -->
<script setup lang="ts">
import type { Service } from '~/types'

defineProps<{
  service: Service
  selected: boolean
}>()

const emit = defineEmits<{
  select: [service: Service]
}>()

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} دقيقة`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return h === 1 ? 'ساعة' : `${h} ساعات`
  return `${h} ساعة و${m} دقيقة`
}
</script>

<template>
  <button
    class="w-full text-start p-5 rounded-[16px] border transition-all duration-300"
    :class="selected
      ? 'border-salona-300 bg-salona-50/50 shadow-sm'
      : 'border-(--color-border) bg-(--color-surface) hover:border-gray-300'"
    @click="emit('select', service)"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="flex-1 min-w-0">
        <p class="font-medium text-lg" :class="selected ? 'text-salona-900' : 'text-(--color-text)'">{{ service.name }}</p>
        <p class="text-sm mt-1" :class="selected ? 'text-salona-700' : 'text-(--color-text-muted)'">{{ formatDuration(service.durationMinutes) }}</p>
      </div>
      <div class="shrink-0 text-end">
        <span class="font-semibold text-lg" :class="selected ? 'text-salona-900' : 'text-(--color-text)'">{{ service.price }}</span>
        <span class="text-sm ms-0.5" :class="selected ? 'text-salona-700' : 'text-(--color-text-muted)'"> ر.س</span>
      </div>
    </div>
  </button>
</template>
