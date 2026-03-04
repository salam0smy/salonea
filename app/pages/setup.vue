<!-- app/pages/setup.vue -->
<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' })

const { t } = useI18n()
useHead({ title: () => t('setup.title') })

const name = ref('')
const nameEn = ref('')
const phone = ref('')
const slug = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

function slugFromName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || ''
}

watch(name, (v) => {
  if (!slug.value || slug.value === slugFromName(name.value)) {
    slug.value = slugFromName(v)
  }
})

async function onSubmit() {
  error.value = null
  isLoading.value = true
  try {
    await $fetch('/api/setup', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        nameEn: nameEn.value.trim() || undefined,
        phone: phone.value.trim(),
        slug: slug.value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      },
    })
    await navigateTo('/admin')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; statusCode?: number }
    if (err?.statusCode === 409 || err?.data?.message === 'slug_taken') {
      error.value = t('setup.slugTaken')
    } else {
      error.value = t('setup.error')
    }
  } finally {
    isLoading.value = false
  }
}

const slugNormalized = computed(() =>
  slug.value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
)
const canSubmit = computed(() => {
  return (
    name.value.trim().length > 0 &&
    phone.value.trim().length > 0 &&
    slugNormalized.value.length > 0
  )
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-(--color-bg)">
    <UCard
      class="w-full max-w-md bg-(--color-surface)! border border-(--color-border)"
    >
      <template #header>
        <h1 class="text-lg font-semibold text-(--color-text)">
          {{ t('setup.title') }}
        </h1>
        <p class="text-sm text-(--color-text-muted) mt-1">
          {{ t('setup.subtitle') }}
        </p>
      </template>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <UFormField :label="t('setup.salonNameAr')" required>
          <UInput
            v-model="name"
            type="text"
            :placeholder="t('setup.salonNameAr')"
            size="lg"
            autocomplete="organization"
            :disabled="isLoading"
          />
        </UFormField>
        <UFormField :label="t('setup.salonNameEn')">
          <UInput
            v-model="nameEn"
            type="text"
            :placeholder="t('setup.salonNameEn')"
            size="lg"
            :disabled="isLoading"
          />
        </UFormField>
        <UFormField :label="t('setup.phone')" required>
          <UInput
            v-model="phone"
            type="tel"
            :placeholder="t('auth.phonePlaceholder')"
            size="lg"
            autocomplete="tel"
            :disabled="isLoading"
          />
        </UFormField>
        <UFormField :label="t('setup.slug')" :hint="t('setup.slugHint', { slug: slugNormalized || '…' })" required>
          <UInput
            v-model="slug"
            type="text"
            :placeholder="t('setup.slugPlaceholder')"
            size="lg"
            autocomplete="off"
            :disabled="isLoading"
          />
        </UFormField>
        <UAlert
          v-if="error"
          color="error"
          :title="error"
          class="text-sm"
        />
        <UButton
          type="submit"
          block
          size="lg"
          :loading="isLoading"
          :disabled="!canSubmit"
          :label="t('setup.submit')"
        />
      </form>
    </UCard>
  </div>
</template>
