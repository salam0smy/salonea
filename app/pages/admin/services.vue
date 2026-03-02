<!-- app/pages/admin/services.vue -->
<script setup lang="ts">
import type { Service } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { categories, servicesByCategory, addService, updateService, removeService } =
  useServices()

const panelOpen = ref(false)
const editingService = ref<Service | null>(null)

function openAdd() {
  editingService.value = null
  panelOpen.value = true
}

function openEdit(service: Service) {
  editingService.value = service
  panelOpen.value = true
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
  <!-- Main content panel -->
  <UDashboardPanel id="services">
    <template #header>
      <UDashboardNavbar :title="$t('admin.services')">
        <template #right>
          <UButton
            icon="i-heroicons-plus"
            color="neutral"
            variant="solid"
            @click="openAdd"
          >
            {{ $t('admin.addService') }}
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Category groups -->
      <div v-if="servicesByCategory.length > 0" class="space-y-8 p-4">
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
      <UEmpty
        v-else
        icon="i-heroicons-sparkles"
        :description="$t('admin.noServices')"
        class="py-20"
      />
    </template>
  </UDashboardPanel>

  <!-- Form panel — sibling to the content panel, both inside UDashboardGroup via <slot /> -->
  <AdminServiceFormPanel
    v-if="panelOpen"
    :service="editingService"
    :categories="categories"
    @save="handleSave"
    @close="panelOpen = false"
  />
</template>
