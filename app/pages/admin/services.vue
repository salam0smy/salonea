<!-- app/pages/admin/services.vue -->
<script setup lang="ts">
import type { Service, ServiceCategory } from '~/types'
import type { NewCategoryData } from '~/composables/admin/useServices'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const toast = useToast()
const { t } = useI18n()

const {
  categories,
  servicesByCategory,
  addService,
  updateService,
  removeService,
  addCategory,
  updateCategory,
  removeCategory,
} = useServices()

// ── Panel state ──────────────────────────────────────────────────────────────
const activePanel = ref<'service' | 'category' | null>(null)
const editingService = ref<Service | null>(null)
const editingCategory = ref<ServiceCategory | null>(null)

function openAddService() {
  editingService.value = null
  activePanel.value = 'service'
}

function openEditService(service: Service) {
  editingService.value = service
  activePanel.value = 'service'
}

function openAddCategory() {
  editingCategory.value = null
  activePanel.value = 'category'
}

function openEditCategory(category: ServiceCategory) {
  editingCategory.value = category
  activePanel.value = 'category'
}

function closePanel() {
  activePanel.value = null
}

// ── Service handlers ─────────────────────────────────────────────────────────
function handleServiceSave(data: Parameters<typeof addService>[0]) {
  if (editingService.value) {
    updateService(editingService.value.id, data)
  }
  else {
    addService(data)
  }
}

// ── Category handlers ────────────────────────────────────────────────────────
function handleCategorySave(data: NewCategoryData) {
  if (editingCategory.value) {
    updateCategory(editingCategory.value.id, data)
  }
  else {
    addCategory(data)
  }
}

const confirmingCategoryDeleteId = ref<string | null>(null)

function setConfirmingCategoryDelete(id: string) {
  confirmingCategoryDeleteId.value = id
}

function clearConfirmingCategoryDelete() {
  confirmingCategoryDeleteId.value = null
}

async function handleCategoryDelete(id: string) {
  try {
    await removeCategory(id)
  }
  catch {
    toast.add({
      title: t('admin.categoryHasServices'),
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  }
  confirmingCategoryDeleteId.value = null
}
</script>

<template>
  <!-- Main content panel -->
  <UDashboardPanel id="services">
    <template #header>
      <UDashboardNavbar :title="$t('admin.services')">
        <template #right>
          <UButton
            icon="i-heroicons-tag"
            color="neutral"
            variant="outline"
            @click="openAddCategory"
          >
            {{ $t('admin.addCategory') }}
          </UButton>
          <UButton
            icon="i-heroicons-plus"
            color="neutral"
            variant="solid"
            @click="openAddService"
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
          <!-- Category header row with actions -->
          <div class="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-(--color-border)">
            <h2 class="text-base font-semibold text-(--color-text)">
              {{ group.category.name }}
            </h2>

            <div class="flex items-center gap-1 shrink-0">
              <template v-if="confirmingCategoryDeleteId === group.category.id">
                <span class="text-xs text-red-600 font-medium me-1">
                  {{ $t('admin.confirmDelete') }}
                </span>
                <UButton
                  size="xs"
                  color="error"
                  variant="solid"
                  @click="handleCategoryDelete(group.category.id)"
                >
                  {{ $t('common.confirm') }}
                </UButton>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  @click="clearConfirmingCategoryDelete"
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
                  :aria-label="$t('admin.editCategory')"
                  @click="openEditCategory(group.category)"
                />
                <UButton
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="i-heroicons-trash"
                  :aria-label="$t('admin.deleteCategory')"
                  @click="setConfirmingCategoryDelete(group.category.id)"
                />
              </template>
            </div>
          </div>

          <div class="space-y-3">
            <AdminServiceCard
              v-for="service in group.services"
              :key="service.id"
              :service="service"
              @edit="openEditService"
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

  <!-- Service form panel -->
  <AdminServiceFormPanel
    v-if="activePanel === 'service'"
    :service="editingService"
    :categories="categories ?? []"
    @save="handleServiceSave"
    @close="closePanel"
  />

  <!-- Category form panel -->
  <AdminCategoryFormPanel
    v-if="activePanel === 'category'"
    :category="editingCategory"
    @save="handleCategorySave"
    @close="closePanel"
  />
</template>
