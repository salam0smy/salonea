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
    <UButton
      variant="ghost"
      color="neutral"
      size="sm"
      :leading-icon="$i18n.locale === 'ar' ? 'i-heroicons-arrow-right' : 'i-heroicons-arrow-left'"
      @click="emit('back')"
    >
      {{ t('common.back') }}
    </UButton>

    <h2 class="text-2xl font-semibold text-(--color-text)">{{ t('booking.selectDate') }}</h2>

    <!-- Date strip -->
    <div class="space-y-4">
      <p class="text-base text-(--color-text-muted) font-medium">{{ t('booking.date') }}</p>
      <div class="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <UButton
          v-for="day in days"
          :key="day.value"
          :variant="selectedDate === day.value ? 'solid' : 'outline'"
          color="neutral"
          class="shrink-0 flex-col gap-1 w-16 h-auto py-4 rounded-2xl"
          @click="selectDate(day.value)"
        >
          <span class="text-xs opacity-80">{{ day.dayName }}</span>
          <span class="text-xl font-semibold leading-none">{{ day.dayNum }}</span>
          <span v-if="day.isToday" class="text-[10px] mt-1 opacity-60">{{ t('booking.today') }}</span>
        </UButton>
      </div>
    </div>

    <!-- Time slots grid -->
    <template v-if="selectedDate">
      <div class="space-y-4">
        <p class="text-base text-(--color-text-muted) font-medium">{{ t('booking.time') }}</p>
        <div v-if="availableSlots.length" class="grid grid-cols-3 gap-3">
          <UButton
            v-for="slot in availableSlots"
            :key="slot"
            :variant="selectedTime === slot ? 'solid' : 'outline'"
            :color="selectedTime === slot ? 'primary' : 'neutral'"
            block
            @click="emit('update:selectedTime', slot)"
          >
            {{ formatTime(slot) }}
          </UButton>
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
