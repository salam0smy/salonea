<!-- app/components/admin/AdminCalendarDatePicker.vue -->
<script setup lang="ts">
import { parseDate } from '@internationalized/date'
import type { CalendarDate } from '@internationalized/date'

const props = defineProps<{
  selectedDate: string
  today: string
}>()

const emit = defineEmits<{ select: [date: string] }>()

const { t, locale } = useI18n()
const isOpen = ref(false)

const calendarValue = computed(() => parseDate(props.selectedDate))

function onDateSelect(val: CalendarDate | CalendarDate[] | undefined) {
  if (!val || Array.isArray(val)) return
  emit('select', val.toString())
  isOpen.value = false
}

const dateLabel = computed(() => {
  const yesterday = new Date(props.today + 'T12:00:00')
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0] ?? ''
  const tomorrow = new Date(props.today + 'T12:00:00')
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0] ?? ''

  if (props.selectedDate === props.today) return t('admin.today')
  if (props.selectedDate === yesterdayStr) return t('admin.yesterday')
  if (props.selectedDate === tomorrowStr) return t('admin.tomorrow')

  return new Date(props.selectedDate + 'T12:00:00').toLocaleDateString(
    locale.value === 'ar' ? 'ar-SA' : 'en-GB',
    { weekday: 'long', month: 'long', day: 'numeric' },
  )
})
</script>

<template>
  <UPopover v-model:open="isOpen">
    <button
      type="button"
      class="flex items-center gap-1.5 font-semibold text-(--color-text)
             hover:text-(--color-primary) transition-colors duration-150
             cursor-pointer group"
    >
      <span>{{ dateLabel }}</span>
      <UIcon
        name="i-heroicons-chevron-down"
        class="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150"
      />
    </button>

    <template #content>
      <UCalendar
        :model-value="calendarValue"
        class="p-2"
        @update:model-value="onDateSelect"
      />
    </template>
  </UPopover>
</template>
