<!-- app/app.vue -->
<script setup lang="ts">
const i18nHead = useLocaleHead({ dir: true })
useHead(i18nHead)
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
