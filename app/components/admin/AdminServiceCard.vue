<!-- app/components/admin/AdminServiceCard.vue -->
<script setup lang="ts">
import type { Service } from '~/types'

defineProps<{
  service: Service
}>()

const emit = defineEmits<{
  edit: [service: Service]
  delete: [id: string]
}>()

const confirmingDelete = ref(false)

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} د`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} س` : `${h} س ${m} د`
}
</script>

<template>
  <div
    class="flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
    :class="{ 'opacity-50': !service.isActive }"
  >
    <!-- Service info -->
    <div class="flex-1 min-w-0">
      <p class="font-medium text-gray-900 text-sm truncate">{{ service.name }}</p>
      <p class="text-xs text-gray-400 mt-0.5">
        {{ formatDuration(service.durationMinutes) }}
      </p>
    </div>

    <!-- Price -->
    <div class="shrink-0 text-end">
      <span class="font-semibold text-gray-900 text-sm">{{ service.price }}</span>
      <span class="text-xs text-gray-400 me-0.5"> {{ $t('common.sar') }}</span>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 shrink-0">
      <template v-if="confirmingDelete">
        <span class="text-xs text-red-600 font-medium me-1">
          {{ $t('admin.confirmDelete') }}
        </span>
        <UButton
          size="xs"
          color="error"
          variant="solid"
          @click="emit('delete', service.id); confirmingDelete = false"
        >
          {{ $t('common.confirm') }}
        </UButton>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          @click="confirmingDelete = false"
        >
          {{ $t('common.cancel') }}
        </UButton>
      </template>
      <template v-else>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-pencil-square"
          :aria-label="$t('admin.editService')"
          @click="emit('edit', service)"
        />
        <UButton
          size="xs"
          color="error"
          variant="ghost"
          icon="i-heroicons-trash"
          :aria-label="$t('admin.deleteService')"
          @click="confirmingDelete = true"
        />
      </template>
    </div>
  </div>
</template>
