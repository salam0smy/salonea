<!-- app/components/admin/AdminStaffFormModal.vue -->
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
}>()

const open = defineModel<boolean>('open', { default: false })

const form = reactive({
  name: '',
  nameEn: '',
  photoUrl: '',
  serviceIds: [] as string[],
})

// Reset form whenever the staff prop changes (edit vs add)
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

// Also reset when modal opens in add mode
watch(open, (val) => {
  if (val && !props.staff) {
    form.name = ''
    form.nameEn = ''
    form.photoUrl = ''
    form.serviceIds = []
  }
})

// Services grouped by category (for the checklist)
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
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-4">
        <!-- Header -->
        <h3 class="text-lg font-semibold text-(--color-text)">
          {{ staff ? $t('admin.editStaff') : $t('admin.addStaff') }}
        </h3>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <!-- Name (Arabic) -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-(--color-text)">
              {{ $t('admin.staffName') }}
            </label>
            <UInput v-model="form.name" required dir="rtl" />
          </div>

          <!-- Name (English) -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-(--color-text)">
              {{ $t('admin.staffNameEn') }}
            </label>
            <UInput v-model="form.nameEn" dir="ltr" />
          </div>

          <!-- Photo URL -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-(--color-text)">
              {{ $t('admin.staffPhoto') }}
            </label>
            <UInput v-model="form.photoUrl" dir="ltr" />
          </div>

          <!-- Services checklist -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-(--color-text)">
              {{ $t('admin.staffServices') }}
            </label>
            <div class="space-y-3 max-h-52 overflow-y-auto rounded-lg border border-(--color-border) p-3">
              <section
                v-for="group in servicesByCategory"
                :key="group.category.id"
              >
                <p class="text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide mb-1">
                  {{ group.category.name }}
                </p>
                <label
                  v-for="service in group.services"
                  :key="service.id"
                  class="flex items-center gap-2 cursor-pointer py-0.5"
                >
                  <input
                    type="checkbox"
                    :checked="form.serviceIds.includes(service.id)"
                    class="w-4 h-4 rounded border-(--color-border) accent-salona-500"
                    @change="toggleService(service.id)"
                  >
                  <span class="text-sm text-(--color-text)">{{ service.name }}</span>
                </label>
              </section>
            </div>
          </div>

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
