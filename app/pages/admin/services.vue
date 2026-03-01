<!-- app/pages/admin/services.vue -->
<script setup lang="ts">
import type { Service } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { categories, servicesByCategory, addService, updateService, removeService } =
  useServices()

const modalOpen = ref(false)
const editingService = ref<Service | null>(null)

function openAdd() {
  editingService.value = null
  modalOpen.value = true
}

function openEdit(service: Service) {
  editingService.value = service
  modalOpen.value = true
}

function handleSave(data: Parameters<typeof addService>[0]) {
  if (editingService.value) {
    updateService(editingService.value.id, data)
  } else {
    addService(data)
  }
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-(--color-text)">
        {{ $t('admin.services') }}
      </h1>
      <UButton
        icon="i-heroicons-plus"
        color="neutral"
        variant="solid"
        @click="openAdd"
      >
        {{ $t('admin.addService') }}
      </UButton>
    </div>

    <!-- Category groups -->
    <div v-if="servicesByCategory.length > 0" class="space-y-6">
      <section
        v-for="group in servicesByCategory"
        :key="group.category.id"
      >
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {{ group.category.name }}
        </h2>
        <div class="space-y-2">
          <AdminServiceCard
            v-for="service in group.services"
            :key="service.id"
            :service="service"
            @edit="openEdit"
            @delete="removeService"
          />
        </div>
      </section>
    </div>

    <!-- Empty state -->
    <p v-else class="text-center text-gray-400 py-16">
      {{ $t('admin.noServices') }}
    </p>

    <!-- Add / Edit modal -->
    <AdminServiceFormModal
      v-model:open="modalOpen"
      :service="editingService"
      :categories="categories"
      @save="handleSave"
    />
  </div>
</template>
