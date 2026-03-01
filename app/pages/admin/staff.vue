<!-- app/pages/admin/staff.vue -->
<script setup lang="ts">
import type { StaffMember } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { staff, services, addStaff, updateStaff, removeStaff } = useStaff()

// useStaff doesn't expose categories — pull from useServices for the modal grouping
const { categories } = useServices()

const modalOpen = ref(false)
const editingStaff = ref<StaffMember | null>(null)

function openAdd() {
  editingStaff.value = null
  modalOpen.value = true
}

function openEdit(member: StaffMember) {
  editingStaff.value = member
  modalOpen.value = true
}

function handleSave(data: Parameters<typeof addStaff>[0]) {
  if (editingStaff.value) {
    updateStaff(editingStaff.value.id, data)
  } else {
    addStaff(data)
  }
}
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <!-- Page header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">
        {{ $t('admin.staff') }}
      </h1>
      <UButton
        icon="i-heroicons-plus"
        color="neutral"
        variant="solid"
        @click="openAdd"
      >
        {{ $t('admin.addStaff') }}
      </UButton>
    </div>

    <!-- Staff list -->
    <div v-if="staff.length > 0" class="space-y-2">
      <AdminStaffCard
        v-for="member in staff"
        :key="member.id"
        :staff="member"
        @edit="openEdit"
        @delete="removeStaff"
      />
    </div>

    <!-- Empty state -->
    <p v-else class="text-center text-gray-400 py-16">
      {{ $t('admin.noStaff') }}
    </p>

    <!-- Add / Edit modal -->
    <AdminStaffFormModal
      v-model:open="modalOpen"
      :staff="editingStaff"
      :services="services"
      :categories="categories"
      @save="handleSave"
    />
  </div>
</template>
