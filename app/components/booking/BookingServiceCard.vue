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
    class="w-full text-start p-4 rounded-2xl border transition-all duration-150"
    :class="selected
      ? 'border-gray-800 bg-white shadow-sm'
      : 'border-gray-100 bg-white hover:border-gray-200'"
    @click="emit('select', service)"
  >
    <div class="flex items-center justify-between gap-3">
      <div class="flex-1 min-w-0">
        <p class="font-medium text-gray-900 text-base">{{ service.name }}</p>
        <p class="text-sm text-gray-400 mt-0.5">{{ formatDuration(service.durationMinutes) }}</p>
      </div>
      <div class="shrink-0 text-end">
        <span class="font-semibold text-gray-900">{{ service.price }}</span>
        <span class="text-xs text-gray-400 me-0.5"> ر.س</span>
      </div>
    </div>
  </button>
</template>
