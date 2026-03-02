<!-- app/components/booking/BookingDatePicker.vue -->
<script setup lang="ts">
import type { Service, StaffMember } from '~/types'

const { t, locale } = useI18n()

defineProps<{
  service: Service
  staff: StaffMember | null
  availableSlots: string[]
  selectedDate: string | null
  selectedTime: string | null
}>()

const emit = defineEmits<{
  'update:selectedDate': [v: string]
  'update:selectedTime': [v: string]
  'next': []
  'back': []
}>()

const dateLocale = computed(() => (locale.value === 'ar' ? 'ar-SA' : 'en-US'))

// Next 14 days starting today
const days = computed(() => {
  const result: { value: string; dayName: string; dayNum: number; isToday: boolean }[] = []
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const value = d.toISOString().split('T')[0] ?? ''
    result.push({
      value,
      dayName: d.toLocaleDateString(dateLocale.value, { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: i === 0,
    })
  }
  return result
})

function formatTime(time: string): string {
  const [h = 0, m = 0] = time.split(':').map(Number)
  const period = h < 12 ? t('booking.am') : t('booking.pm')
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

function selectDate(date: string) {
  emit('update:selectedDate', date)
  emit('update:selectedTime', '') // reset time when date changes
}
</script>

<template>
  <div class="pt-5 space-y-8">
    <!-- Back -->
    <button
      class="flex items-center gap-1 text-sm text-(--color-text-muted) hover:text-(--color-text) transition-colors"
      @click="emit('back')"
    >
      <span class="inline-block rtl:rotate-180">←</span>
      {{ t('common.back') }}
    </button>

    <h2 class="text-2xl font-semibold text-(--color-text)">{{ t('booking.selectDate') }}</h2>

    <!-- Date strip -->
    <div class="space-y-4">
      <p class="text-base text-(--color-text-muted) font-medium">{{ t('booking.date') }}</p>
      <div class="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <button
          v-for="day in days"
          :key="day.value"
          class="shrink-0 flex flex-col items-center gap-1 w-[64px] py-4 rounded-[16px] border text-center transition-all duration-300"
          :class="selectedDate === day.value
            ? 'bg-(--color-text) text-(--color-bg) border-(--color-text) shadow-sm'
            : 'bg-(--color-surface) border-(--color-border) text-(--color-text) hover:border-gray-300 dark:hover:border-gray-600'"
          @click="selectDate(day.value)"
        >
          <span class="text-xs opacity-80">{{ day.dayName }}</span>
          <span class="text-xl font-semibold leading-none">{{ day.dayNum }}</span>
          <span v-if="day.isToday" class="text-[10px] mt-1 opacity-60">{{ t('booking.today') }}</span>
        </button>
      </div>
    </div>

    <!-- Time slots grid -->
    <template v-if="selectedDate">
      <div class="space-y-4">
        <p class="text-base text-(--color-text-muted) font-medium">{{ t('booking.time') }}</p>
        <div v-if="availableSlots.length" class="grid grid-cols-3 gap-3">
          <button
            v-for="slot in availableSlots"
            :key="slot"
            class="py-3.5 rounded-[12px] border text-base text-center transition-all duration-300"
            :class="selectedTime === slot
              ? 'bg-(--color-text) text-(--color-bg) border-(--color-text) font-medium shadow-sm'
              : 'bg-(--color-surface) border-(--color-border) text-(--color-text) hover:border-gray-300 dark:hover:border-gray-600'"
            @click="emit('update:selectedTime', slot)"
          >
            {{ formatTime(slot) }}
          </button>
        </div>
        <p v-else class="text-base text-(--color-text-muted) text-center py-8">
          {{ t('booking.noSlotsAvailable') }}
        </p>
      </div>
    </template>
    <template v-else>
      <p class="text-base text-(--color-text-muted) py-4">{{ t('booking.selectDateForTimes') }}</p>
    </template>
  </div>

  <!-- Sticky CTA -->
  <div class="fixed bottom-0 inset-x-0 bg-(--color-surface)/95 backdrop-blur-md border-t border-(--color-border) p-5">
    <div class="max-w-lg mx-auto">
      <UButton
        block
        size="xl"
        :disabled="!selectedDate || !selectedTime"
        color="neutral"
        @click="emit('next')"
      >
        <span class="text-lg">{{ t('common.next') }}</span>
      </UButton>
    </div>
  </div>
</template>
