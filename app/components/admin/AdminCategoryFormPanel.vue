<!-- app/components/admin/AdminCategoryFormPanel.vue -->
<script setup lang="ts">
import type { ServiceCategory } from '~/types'
import type { NewCategoryData } from '~/composables/admin/useServices'

const props = defineProps<{
  category: ServiceCategory | null
}>()

const emit = defineEmits<{
  save: [data: NewCategoryData]
  close: []
}>()

const form = reactive({
  name: '',
  nameEn: '',
  sortOrder: 0,
})

watch(
  () => props.category,
  (category) => {
    if (category) {
      form.name = category.name
      form.nameEn = category.nameEn ?? ''
      form.sortOrder = category.sortOrder
    }
    else {
      form.name = ''
      form.nameEn = ''
      form.sortOrder = 0
    }
  },
  { immediate: true },
)

function handleSubmit() {
  if (!form.name.trim()) return
  emit('save', {
    name: form.name.trim(),
    nameEn: form.nameEn.trim() || null,
    sortOrder: Number(form.sortOrder),
  })
  emit('close')
}
</script>

<template>
  <UDashboardPanel id="category-form" :default-size="35" :min-size="28" :max-size="50">
    <template #header>
      <UDashboardNavbar
        :title="category ? $t('admin.editCategory') : $t('admin.addCategory')"
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
      <form id="category-form-el" class="space-y-4 p-4" @submit.prevent="handleSubmit">
        <UFormField :label="$t('admin.categoryName')">
          <div class="input-with-trailing flex items-center gap-0 rounded-md border-2 border-(--color-border) bg-(--color-background) focus-within:border-primary transition-colors">
            <input
              v-model="form.name"
              type="text"
              dir="rtl"
              required
              class="min-w-0 flex-1 rounded-md border-0 bg-transparent py-2.5 ps-3 pe-11 text-base text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none focus:ring-0 disabled:opacity-75"
            >
            <span class="shrink-0 pe-2 text-xs font-mono text-(--color-text-muted)">AR</span>
          </div>
        </UFormField>

        <UFormField :label="$t('admin.categoryNameEn')">
          <div class="input-with-trailing flex items-center gap-0 rounded-md border-2 border-(--color-border) bg-(--color-background) focus-within:border-primary transition-colors">
            <input
              v-model="form.nameEn"
              type="text"
              dir="ltr"
              class="min-w-0 flex-1 rounded-md border-0 bg-transparent py-2.5 ps-3 pe-11 text-base text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none focus:ring-0 disabled:opacity-75"
            >
            <span class="shrink-0 pe-2 text-xs font-mono text-(--color-text-muted)">EN</span>
          </div>
        </UFormField>

        <UFormField :label="$t('admin.categorySortOrder')">
          <UInput v-model="form.sortOrder" type="number" min="0" step="1" class="w-full" :ui="{ base: 'px-3 py-2.5' }" />
        </UFormField>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 p-4 border-t border-(--color-border)">
        <UButton color="neutral" variant="ghost" @click="emit('close')">
          {{ $t('common.cancel') }}
        </UButton>
        <UButton type="submit" form="category-form-el" color="neutral" variant="solid">
          {{ $t('common.save') }}
        </UButton>
      </div>
    </template>
  </UDashboardPanel>
</template>
