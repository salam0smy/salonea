<!-- app/components/admin/AdminStaffFormPanel.vue -->
<script setup lang="ts">
import type { StaffMember, Service, ServiceCategory } from '~/types'
import type { NewStaffData } from '~/composables/admin/useStaff'

const props = defineProps<{
  staff: StaffMember | null
  services: Service[]
  categories: ServiceCategory[]
}>()

const emit = defineEmits<{
  save: [data: NewStaffData]
  close: []
}>()

const form = reactive({
  name: '',
  nameEn: '',
  photoUrl: '',
  serviceIds: [] as string[],
})

watch(
  () => props.staff,
  (staff) => {
    if (staff) {
      form.name = staff.name
      form.nameEn = staff.nameEn ?? ''
      form.photoUrl = staff.photoUrl ?? ''
      form.serviceIds = [...staff.serviceIds]
    } else {
      form.name = ''
      form.nameEn = ''
      form.photoUrl = ''
      form.serviceIds = []
    }
  },
  { immediate: true },
)

const servicesByCategory = computed(() =>
  [...props.categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(category => ({
      category,
      services: props.services.filter(s => s.categoryId === category.id),
    }))
    .filter(group => group.services.length > 0),
)

function toggleService(id: string) {
  if (form.serviceIds.includes(id)) {
    form.serviceIds = form.serviceIds.filter(s => s !== id)
  } else {
    form.serviceIds = [...form.serviceIds, id]
  }
}

function handleSubmit() {
  if (!form.name.trim()) return
  emit('save', {
    name: form.name.trim(),
    nameEn: form.nameEn.trim() || null,
    photoUrl: form.photoUrl.trim() || null,
    serviceIds: [...form.serviceIds],
  })
  emit('close')
}
</script>

<template>
  <UDashboardPanel id="staff-form" :default-size="38" :min-size="30" :max-size="55">
    <template #header>
      <UDashboardNavbar
        :title="staff ? $t('admin.editStaff') : $t('admin.addStaff')"
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
      <form id="staff-form-el" class="space-y-4 p-4" @submit.prevent="handleSubmit">

        <UFormField :label="$t('admin.staffName')">
          <UInput v-model="form.name" dir="rtl" class="w-full" required>
            <template #trailing>
              <span class="text-xs font-mono text-(--color-text-muted)">AR</span>
            </template>
          </UInput>
        </UFormField>

        <UFormField :label="$t('admin.staffNameEn')">
          <UInput v-model="form.nameEn" dir="ltr" class="w-full">
            <template #trailing>
              <span class="text-xs font-mono text-(--color-text-muted)">EN</span>
            </template>
          </UInput>
        </UFormField>

        <UFormField :label="$t('admin.staffPhoto')">
          <UInput v-model="form.photoUrl" dir="ltr" class="w-full" />
        </UFormField>

        <UFormField :label="$t('admin.staffServices')">
          <div class="space-y-3 rounded-lg border border-(--color-border) p-3 max-h-64 overflow-y-auto">
            <section
              v-for="group in servicesByCategory"
              :key="group.category.id"
              class="space-y-1"
            >
              <p class="text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide pb-0.5">
                {{ group.category.name }}
              </p>
              <UCheckbox
                v-for="service in group.services"
                :key="service.id"
                :model-value="form.serviceIds.includes(service.id)"
                :label="service.name"
                @update:model-value="toggleService(service.id)"
              />
            </section>
          </div>
        </UFormField>

      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 p-4 border-t border-(--color-border)">
        <UButton color="neutral" variant="ghost" @click="emit('close')">
          {{ $t('common.cancel') }}
        </UButton>
        <UButton type="submit" form="staff-form-el" color="neutral" variant="solid">
          {{ $t('common.save') }}
        </UButton>
      </div>
    </template>
  </UDashboardPanel>
</template>
