<!-- app/components/admin/AdminStaffCard.vue -->
<script setup lang="ts">
import type { StaffMember } from '~/types'

const props = defineProps<{
  staff: StaffMember
}>()

const emit = defineEmits<{
  edit: [staff: StaffMember]
  delete: [id: string]
}>()

const confirmingDelete = ref(false)

const initial = computed(() => props.staff.name.charAt(0))
</script>

<template>
  <div
    class="flex items-center gap-4 p-5 bg-(--color-surface) rounded-[16px] border border-(--color-border) transition-all hover:shadow-sm"
  >
    <!-- Photo placeholder -->
    <div
      class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-semibold text-base select-none bg-salona-50 text-salona-600 dark:bg-salona-950 dark:text-salona-300"
    >
      {{ initial }}
    </div>

    <!-- Staff info -->
    <div class="flex-1 min-w-0">
      <p class="font-medium text-(--color-text) text-base truncate">{{ staff.name }}</p>
      <p v-if="staff.nameEn" class="text-sm text-(--color-text-muted) mt-1 truncate">{{ staff.nameEn }}</p>
    </div>

    <!-- Service count badge -->
    <div class="shrink-0">
      <span class="inline-flex items-center rounded-full bg-(--color-surface-muted) px-3 py-1 text-sm text-(--color-text-muted)">
        {{ staff.serviceIds.length }}
      </span>
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
          @click="emit('delete', staff.id); confirmingDelete = false"
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
          :aria-label="$t('admin.editStaff')"
          @click="emit('edit', staff)"
        />
        <UButton
          size="xs"
          color="error"
          variant="ghost"
          icon="i-heroicons-trash"
          :aria-label="$t('admin.deleteStaff')"
          @click="confirmingDelete = true"
        />
      </template>
    </div>
  </div>
</template>
