<!-- app/components/admin/WorkingHoursEditor.vue -->
<script setup lang="ts">
import type { WorkingHoursDay } from '~/types'

const DAY_KEYS = ['daySun', 'dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri', 'daySat'] as const

const props = withDefaults(
  defineProps<{
    modelValue: WorkingHoursDay[]
    /** Show day labels only (e.g. in a compact staff panel). */
    compact?: boolean
  }>(),
  { compact: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: WorkingHoursDay[]]
}>()

const { t } = useI18n()

const days = computed({
  get: () => props.modelValue,
  set: (value: WorkingHoursDay[]) => emit('update:modelValue', value),
})

function dayLabel(dayOfWeek: number) {
  return t(`admin.settings.${DAY_KEYS[dayOfWeek]}`)
}

function setWorking(dayOfWeek: number, isWorking: boolean) {
  const next = days.value.map((d) =>
    d.dayOfWeek === dayOfWeek ? { ...d, isWorking } : d,
  )
  emit('update:modelValue', next)
}

function setStartTime(dayOfWeek: number, startTime: string) {
  const next = days.value.map((d) =>
    d.dayOfWeek === dayOfWeek ? { ...d, startTime } : d,
  )
  emit('update:modelValue', next)
}

function setEndTime(dayOfWeek: number, endTime: string) {
  const next = days.value.map((d) =>
    d.dayOfWeek === dayOfWeek ? { ...d, endTime } : d,
  )
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="day in days"
      :key="day.dayOfWeek"
      class="flex flex-wrap items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-4"
    >
      <span
        class="min-w-20 text-(--color-text) font-medium"
        :class="{ 'text-(--color-text-muted)': !day.isWorking }"
      >
        {{ dayLabel(day.dayOfWeek) }}
      </span>
      <USwitch
        :model-value="day.isWorking"
        :aria-label="dayLabel(day.dayOfWeek)"
        @update:model-value="setWorking(day.dayOfWeek, $event)"
      />
      <span v-if="day.isWorking" class="text-sm text-(--color-text-muted)">
        {{ t('admin.settings.open') }}
      </span>
      <span v-else class="text-sm text-(--color-text-muted)">
        {{ t('admin.settings.closed') }}
      </span>
      <template v-if="day.isWorking && !compact">
        <UInput
          :model-value="day.startTime"
          type="time"
          class="w-32"
          @update:model-value="setStartTime(day.dayOfWeek, $event)"
        />
        <span class="text-(--color-text-muted)">–</span>
        <UInput
          :model-value="day.endTime"
          type="time"
          class="w-32"
          @update:model-value="setEndTime(day.dayOfWeek, $event)"
        />
      </template>
    </div>
  </div>
</template>
