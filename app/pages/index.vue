<!-- app/pages/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: false })

const { t } = useI18n()
useHead({ title: 'Salona' })
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-(--color-bg)">
    <img
      src="~/assets/salonea-logo-updt.webp"
      alt="Salona"
      class="w-32 h-auto object-contain"
    />
    <p class="text-(--color-text-muted) text-center text-lg max-w-sm">
      {{ t('landing.tagline') }}
    </p>
  </div>
</template>
