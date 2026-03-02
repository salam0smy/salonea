<!-- app/components/admin/AdminServiceFormPanel.vue -->
<script setup lang="ts">
import type { Service, ServiceCategory } from '~/types'
import type { NewServiceData } from '~/composables/admin/useServices'

const props = defineProps<{
  service: Service | null
  categories: ServiceCategory[]
}>()

const emit = defineEmits<{
  save: [data: NewServiceData]
  close: []
}>()

const form = reactive({
  categoryId: '',
  name: '',
  nameEn: '',
  description: '',
  price: 0,
  durationMinutes: 30,
  isActive: true,
})

const categoryOptions = computed(() =>
  props.categories.map(c => ({ label: c.name, value: c.id })),
)

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
    }
    else {
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
  emit('close')
}
</script>

<template>
  <UDashboardPanel id="service-form" :default-size="38" :min-size="30" :max-size="55">
    <template #header>
      <UDashboardNavbar
        :title="service ? $t('admin.editService') : $t('admin.addService')"
      >
        <template #right>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            :aria-label="$t('common.close')"
            @click="emit('close')"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <form id="service-form-el" class="space-y-4 p-4" @submit.prevent="handleSubmit">
        <UFormField :label="$t('admin.serviceCategory')">
          <USelect v-model="form.categoryId" :items="categoryOptions" class="w-full" />
        </UFormField>

        <UFormField :label="$t('admin.serviceName')">
          <UInput v-model="form.name" dir="rtl" class="w-full" required>
            <template #trailing>
              <span class="text-xs font-mono text-(--color-text-muted)">AR</span>
            </template>
          </UInput>
        </UFormField>

        <UFormField :label="$t('admin.serviceNameEn')">
          <UInput v-model="form.nameEn" dir="ltr" class="w-full">
            <template #trailing>
              <span class="text-xs font-mono text-(--color-text-muted)">EN</span>
            </template>
          </UInput>
        </UFormField>

        <div class="grid grid-cols-2 gap-3">
          <UFormField :label="$t('admin.servicePrice')">
            <UInput v-model="form.price" type="number" min="0" class="w-full" required />
          </UFormField>
          <UFormField :label="$t('admin.serviceDuration')">
            <UInput v-model="form.durationMinutes" type="number" min="5" step="5" class="w-full" required />
          </UFormField>
        </div>

        <UFormField :label="$t('admin.serviceActive')">
          <USwitch v-model="form.isActive" />
        </UFormField>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 p-4 border-t border-(--color-border)">
        <UButton color="neutral" variant="ghost" @click="emit('close')">
          {{ $t('common.cancel') }}
        </UButton>
        <UButton type="submit" form="service-form-el" color="neutral" variant="solid">
          {{ $t('common.save') }}
        </UButton>
      </div>
    </template>
  </UDashboardPanel>
</template>
