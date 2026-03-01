<!-- app/pages/admin/services.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold text-gray-900">{{ $t('admin.services') }}</h1>
  </div>
</template>
