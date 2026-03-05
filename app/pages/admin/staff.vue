<!-- app/pages/admin/staff.vue -->
<script setup lang="ts">
import type { StaffMember } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { staff, services, addStaff, updateStaff, removeStaff } = useStaff()

// useStaff doesn't expose categories — pull from useServices for the modal grouping
const { categories } = useServices()

const panelOpen = ref(false)
const editingStaff = ref<StaffMember | null>(null)

function openAdd() {
  editingStaff.value = null
  panelOpen.value = true
}

function openEdit(member: StaffMember) {
  editingStaff.value = member
  panelOpen.value = true
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
  <UDashboardPanel id="staff" resizable :default-size="38" :min-size="30" :max-size="55">
    <template #header>
      <UDashboardNavbar :title="$t('admin.staff')">
        <template #right>
          <UButton
            icon="i-heroicons-plus"
            color="neutral"
            variant="solid"
            @click="openAdd"
          >
            {{ $t('admin.addStaff') }}
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Staff list -->
      <div v-if="staff.length > 0" class="space-y-3 p-4">
        <AdminStaffCard
          v-for="member in staff"
          :key="member.id"
          :staff="member"
          @edit="openEdit"
          @delete="removeStaff"
        />
      </div>

      <!-- Empty state -->
      <UEmpty
        v-else
        icon="i-heroicons-user-group"
        :description="$t('admin.noStaff')"
        class="py-20"
      />
    </template>
  </UDashboardPanel>

  <AdminStaffFormPanel
    v-if="panelOpen"
    :staff="editingStaff"
    :services="services"
    :categories="categories"
    @save="handleSave"
    @close="panelOpen = false"
  />
</template>
