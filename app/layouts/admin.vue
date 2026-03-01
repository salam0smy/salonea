<!-- app/layouts/admin.vue -->
<template>
  <UApp>
    <div class="min-h-screen flex bg-gray-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-e border-gray-200 hidden lg:block">
        <div class="p-4 border-b border-gray-200">
          <p class="font-semibold text-gray-900">{{ $t('admin.dashboard') }}</p>
        </div>
        <nav class="p-2 space-y-1">
          <UButton
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            variant="ghost"
            color="neutral"
            class="w-full justify-start"
          >
            {{ $t(item.label) }}
          </UButton>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const navItems = [
  { to: '/admin', label: 'admin.calendar' },
  { to: '/admin/services', label: 'admin.services' },
  { to: '/admin/staff', label: 'admin.staff' },
  { to: '/admin/settings', label: 'admin.settings' },
]
</script>
