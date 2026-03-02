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
    <div v-if="servicesByCategory.length > 0" class="space-y-8">
      <section
        v-for="group in servicesByCategory"
        :key="group.category.id"
      >
        <h2 class="text-base font-semibold text-(--color-text) mb-4 pb-2 border-b border-(--color-border)">
          {{ group.category.name }}
        </h2>
        <div class="space-y-3">
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
    <div v-else class="flex flex-col items-center justify-center py-20 gap-3">
      <div class="w-12 h-12 rounded-2xl bg-(--color-surface-muted) flex items-center justify-center">
        <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-(--color-text-muted)" />
      </div>
      <p class="text-(--color-text-muted) text-sm">{{ $t('admin.noServices') }}</p>
    </div>

    <!-- Add / Edit modal -->
    <AdminServiceFormModal
      v-model:open="modalOpen"
      :service="editingService"
      :categories="categories"
      @save="handleSave"
    />
  </div>
</template>
