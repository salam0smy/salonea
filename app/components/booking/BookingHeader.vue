<!-- app/components/booking/BookingHeader.vue -->
<script setup lang="ts">
import type { Tenant } from '~/types'
defineProps<{ tenant: Tenant }>()
</script>

<template>
  <header class="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
    <div class="max-w-lg mx-auto flex items-center gap-3">
      <!-- Logo: shows image if available, falls back to colored initial -->
      <div
        v-if="tenant.logoUrl"
        class="w-10 h-10 rounded-xl overflow-hidden shrink-0"
      >
        <img :src="tenant.logoUrl" :alt="tenant.name" class="w-full h-full object-cover" />
      </div>
      <div
        v-else
        class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
        :style="{ backgroundColor: tenant.brandColor }"
      >
        {{ tenant.name.charAt(0) }}
      </div>

      <div class="flex-1 min-w-0">
        <h1 class="font-semibold text-gray-900 text-base leading-tight">{{ tenant.name }}</h1>
        <p v-if="tenant.description" class="text-xs text-gray-400 truncate mt-0.5">
          {{ tenant.description }}
        </p>
      </div>
    </div>
  </header>
</template>
