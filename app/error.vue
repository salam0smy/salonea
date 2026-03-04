<!-- app/error.vue -->
<script setup lang="ts">
const error = useError()
const { t } = useI18n()

const message = computed(() => {
  const current = error.value
  if (!current) return t('errorPage.title')

  const status = current.status
  const data = (current as any).data

  if (status === 404 && data?.kind === 'salon_not_found') return t('errorPage.salonNotFound')
  if (status === 404) return t('errorPage.notFound')
  return t('errorPage.title')
})

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-(--color-bg)">
    <img
      src="~/assets/salonea-logo-updt.webp"
      alt="Salona"
      class="w-32 h-auto object-contain"
    />
    <p class="text-(--color-text) text-center text-lg font-medium">
      {{ message }}
    </p>
    <UButton
      color="primary"
      variant="solid"
      @click="goHome"
    >
      {{ t('errorPage.goHome') }}
    </UButton>
  </div>
</template>
