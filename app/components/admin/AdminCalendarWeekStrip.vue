<!-- app/components/admin/AdminCalendarWeekStrip.vue -->
<script setup lang="ts">
defineProps<{
  weekDays: Array<{ date: string; dayNumber: number; hasActiveBookings: boolean }>
  selectedDate: string
  today: string
}>()

defineEmits<{
  select: [date: string]
}>()
</script>

<template>
  <div class="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
    <UButton
      v-for="day in weekDays"
      :key="day.date"
      :variant="day.date === selectedDate ? 'solid' : (day.date === today ? 'soft' : 'ghost')"
      color="neutral"
      class="flex-col gap-0.5 min-w-12 h-auto py-2 px-2.5 shrink-0 transition-colors duration-100"
      @click="$emit('select', day.date)"
    >
      <span class="text-[10px] leading-none opacity-70">
        {{ new Date(day.date + 'T12:00:00').toLocaleDateString('ar-SA', { weekday: 'short' }) }}
      </span>
      <span class="text-sm font-semibold tabular-nums leading-tight" dir="ltr">
        {{ day.dayNumber }}
      </span>
      <div
        class="w-1.5 h-1.5 rounded-full mt-0.5 transition-opacity duration-100"
        :class="day.hasActiveBookings ? 'bg-current opacity-60' : 'opacity-0'"
      />
    </UButton>
  </div>
</template>
