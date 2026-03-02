<!-- app/components/booking/BookingHeader.vue -->
<script setup lang="ts">
import type { Tenant } from '~/types'
defineProps<{ tenant: Tenant }>()
</script>

<template>
  <header class="bg-(--color-surface) border-b border-(--color-border) px-4 py-4 sticky top-0 z-10">
    <div class="max-w-lg mx-auto flex items-center gap-3">
      <!-- Logo: image if available, falls back to colored initial via UAvatar -->
      <UAvatar
        :src="tenant.logoUrl ?? undefined"
        :alt="tenant.name"
        :text="tenant.name.charAt(0)"
        size="md"
        class="shrink-0 rounded-xl"
        :style="!tenant.logoUrl ? { backgroundColor: tenant.brandColor, color: '#fff' } : {}"
      />

      <div class="flex-1 min-w-0">
        <h1 class="font-semibold text-(--color-text) text-base leading-tight">{{ tenant.name }}</h1>
        <p v-if="tenant.description" class="text-xs text-(--color-text-muted) truncate mt-0.5">
          {{ tenant.description }}
        </p>
      </div>
    </div>
  </header>
</template>
