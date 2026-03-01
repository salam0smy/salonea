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
    class="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
  >
    <!-- Photo placeholder -->
    <div
      class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-500 font-semibold text-sm select-none"
    >
      {{ initial }}
    </div>

    <!-- Staff info -->
    <div class="flex-1 min-w-0">
      <p class="font-medium text-gray-900 text-sm truncate">{{ staff.name }}</p>
      <p v-if="staff.nameEn" class="text-xs text-gray-400 mt-0.5 truncate">{{ staff.nameEn }}</p>
    </div>

    <!-- Service count badge -->
    <div class="shrink-0">
      <span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
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
