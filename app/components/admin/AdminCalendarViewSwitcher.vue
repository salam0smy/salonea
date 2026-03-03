<!-- app/components/admin/AdminCalendarViewSwitcher.vue -->
<script setup lang="ts">
import type { CalendarView } from '~/composables/admin/useCalendar'

defineProps<{ modelValue: CalendarView }>()
const emit = defineEmits<{ 'update:modelValue': [view: CalendarView] }>()

const views: Array<{ value: CalendarView; labelKey: string; icon: string }> = [
  { value: 'day',    labelKey: 'admin.calendar.viewDay',    icon: 'i-heroicons-calendar-days' },
  { value: 'staff',  labelKey: 'admin.calendar.viewStaff',  icon: 'i-heroicons-users' },
  { value: 'agenda', labelKey: 'admin.calendar.viewAgenda', icon: 'i-heroicons-list-bullet' },
]
</script>

<template>
  <UFieldGroup size="xs">
    <UButton
      v-for="v in views"
      :key="v.value"
      color="neutral"
      :variant="modelValue === v.value ? 'solid' : 'ghost'"
      :icon="v.icon"
      :label="$t(v.labelKey)"
      class="transition-colors duration-100"
      @click="emit('update:modelValue', v.value)"
    />
  </UFieldGroup>
</template>
