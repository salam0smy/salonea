<!-- app/layouts/admin.vue -->
<script setup lang="ts">
import { mockTenant } from '~/data/mock'

const drawerOpen = ref(false)
</script>

<template>
  <UApp>
    <div class="min-h-screen flex bg-gray-50">
      <!-- Desktop sidebar — first in DOM so RTL flex places it on the right -->
      <aside class="hidden lg:flex lg:flex-col w-64 shrink-0 bg-white border-e border-gray-100 h-screen sticky top-0">
        <AdminNavLinks :tenant="mockTenant" />
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-auto min-w-0">
        <!-- Mobile header (hidden on lg+) -->
        <header class="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
          <button
            class="p-2 -ms-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            :aria-label="$t('common.menu')"
            @click="drawerOpen = true"
          >
            <UIcon name="i-heroicons-bars-3" class="w-5 h-5" />
          </button>
          <p class="font-semibold text-gray-900 text-sm">{{ mockTenant.name }}</p>
          <!-- Spacer keeps the name visually centred -->
          <div class="w-9" aria-hidden="true" />
        </header>

        <slot />
      </main>

      <!-- Mobile drawer -->
      <USlideover v-model:open="drawerOpen">
        <template #content>
          <AdminNavLinks
            :tenant="mockTenant"
            :on-close="() => (drawerOpen = false)"
          />
        </template>
      </USlideover>
    </div>
  </UApp>
</template>
