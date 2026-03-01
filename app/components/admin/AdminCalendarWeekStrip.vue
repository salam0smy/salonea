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
    <button
      v-for="day in weekDays"
      :key="day.date"
      class="flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl min-w-[48px] transition-colors shrink-0 cursor-pointer"
      :class="day.date === selectedDate
        ? 'bg-(--color-text) text-(--color-bg)'
        : day.date === today
          ? 'bg-(--color-surface-muted) text-(--color-text)'
          : 'text-(--color-text-muted) hover:bg-(--color-surface-muted)'"
      @click="$emit('select', day.date)"
    >
      <!-- Abbreviated day name (e.g. "أحد") -->
      <span class="text-[10px] leading-none opacity-70">
        {{ new Date(day.date + 'T12:00:00').toLocaleDateString('ar-SA', { weekday: 'short' }) }}
      </span>
      <!-- Day number -->
      <span class="text-sm font-semibold tabular-nums leading-tight" dir="ltr">
        {{ day.dayNumber }}
      </span>
      <!-- Booking indicator dot -->
      <div
        class="w-1.5 h-1.5 rounded-full mt-0.5 transition-opacity"
        :class="day.hasActiveBookings
          ? (day.date === selectedDate ? 'bg-(--color-bg) opacity-60' : 'bg-(--color-text-muted)')
          : 'opacity-0 bg-transparent'"
      />
    </button>
  </div>
</template>
