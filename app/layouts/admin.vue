<!-- app/layouts/admin.vue -->
<script setup lang="ts">
const { tenant } = useSettings()
const drawerOpen = ref(false)
</script>

<template>
  <UApp>
    <div class="min-h-screen flex bg-(--color-bg)">
      <!-- Desktop sidebar — first in DOM so RTL flex places it on the right -->
      <aside class="hidden lg:flex lg:flex-col w-64 shrink-0 bg-(--color-surface) border-e border-(--color-border) h-screen sticky top-0">
        <AdminNavLinks v-if="tenant" :tenant="tenant" />
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-auto min-w-0 p-6 pt-0 lg:pt-9 lg:p-8">
        <!-- Mobile header (hidden on lg+) -->
        <header class="lg:hidden sticky top-0 z-10 bg-(--color-surface) border-b border-(--color-border) px-4 h-14 flex items-center justify-between -mx-6 -mt-6 mb-9">
          <button
            class="p-2 -ms-2 rounded-lg text-(--color-text-muted) hover:bg-(--color-surface-muted) transition-colors"
            :aria-label="$t('common.menu')"
            @click="drawerOpen = true"
          >
            <UIcon name="i-heroicons-bars-3" class="w-5 h-5" />
          </button>
          <p class="font-semibold text-sm">{{ tenant?.name }}</p>
          <!-- Spacer keeps the name visually centred -->
          <div class="w-9" aria-hidden="true" />
        </header>

        <slot />
      </main>

      <!-- Mobile drawer -->
      <USlideover v-model:open="drawerOpen">
        <template #content>
          <AdminNavLinks
            v-if="tenant"
            :tenant="tenant"
            :on-close="() => (drawerOpen = false)"
          />
        </template>
      </USlideover>
    </div>
  </UApp>
</template>
