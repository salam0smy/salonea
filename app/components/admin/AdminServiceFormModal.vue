<!-- app/components/admin/AdminServiceFormModal.vue -->
<script setup lang="ts">
import type { Service, ServiceCategory } from '~/types'
import type { NewServiceData } from '~/composables/admin/useServices'

const props = defineProps<{
  service: Service | null
  categories: ServiceCategory[]
}>()

const emit = defineEmits<{
  save: [data: NewServiceData]
}>()

const open = defineModel<boolean>('open', { default: false })

// Local form state — reset whenever the modal opens or service prop changes
const form = reactive({
  categoryId: '',
  name: '',
  nameEn: '',
  description: '',
  price: 0,
  durationMinutes: 30,
  isActive: true,
})

watch(
  () => props.service,
  (service) => {
    if (service) {
      form.categoryId = service.categoryId
      form.name = service.name
      form.nameEn = service.nameEn ?? ''
      form.description = service.description ?? ''
      form.price = service.price
      form.durationMinutes = service.durationMinutes
      form.isActive = service.isActive
    } else {
      form.categoryId = props.categories[0]?.id ?? ''
      form.name = ''
      form.nameEn = ''
      form.description = ''
      form.price = 0
      form.durationMinutes = 30
      form.isActive = true
    }
  },
  { immediate: true },
)

// Also reset when modal opens to add mode
watch(open, (val) => {
  if (val && !props.service) {
    form.categoryId = props.categories[0]?.id ?? ''
    form.name = ''
    form.nameEn = ''
    form.description = ''
    form.price = 0
    form.durationMinutes = 30
    form.isActive = true
  }
})

function handleSubmit() {
  if (!form.name.trim() || !form.categoryId) return
  emit('save', {
    categoryId: form.categoryId,
    name: form.name.trim(),
    nameEn: form.nameEn.trim() || null,
    description: form.description.trim() || null,
    price: Number(form.price),
    durationMinutes: Number(form.durationMinutes),
    isActive: form.isActive,
  })
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-4">
        <!-- Header -->
        <h3 class="text-lg font-semibold text-(--color-text)">
          {{ service ? $t('admin.editService') : $t('admin.addService') }}
        </h3>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <!-- Category -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-(--color-text)">
              {{ $t('admin.serviceCategory') }}
            </label>
            <select
              v-model="form.categoryId"
              class="w-full rounded-lg border border-(--color-border) px-3 py-2 text-sm text-(--color-text) bg-(--color-surface) focus:outline-none focus:ring-2 focus:ring-salona-500"
              required
            >
              <option
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Name (Arabic) -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-(--color-text)">
              {{ $t('admin.serviceName') }}
            </label>
            <UInput v-model="form.name" required dir="rtl" />
          </div>

          <!-- Name (English) -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-(--color-text)">
              {{ $t('admin.serviceNameEn') }}
            </label>
            <UInput v-model="form.nameEn" dir="ltr" />
          </div>

          <!-- Price + Duration (side by side) -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-(--color-text)">
                {{ $t('admin.servicePrice') }}
              </label>
              <UInput v-model="form.price" type="number" min="0" required />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-(--color-text)">
                {{ $t('admin.serviceDuration') }}
              </label>
              <UInput v-model="form.durationMinutes" type="number" min="5" step="5" required />
            </div>
          </div>

          <!-- Active toggle -->
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.isActive"
              type="checkbox"
              class="w-4 h-4 rounded border-(--color-border) accent-salona-500"
            />
            <span class="text-sm text-(--color-text)">{{ $t('admin.serviceActive') }}</span>
          </label>

          <!-- Footer buttons -->
          <div class="flex justify-end gap-2 pt-2">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              @click="open = false"
            >
              {{ $t('common.cancel') }}
            </UButton>
            <UButton type="submit" color="neutral" variant="solid">
              {{ $t('common.save') }}
            </UButton>
          </div>
        </form>
      </div>
    </template>
  </UModal>
</template>
