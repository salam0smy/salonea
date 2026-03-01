<!-- app/components/admin/AdminNavLinks.vue -->
<script setup lang="ts">
import type { Tenant } from '~/types'

const props = defineProps<{
  tenant: Tenant
  onClose?: () => void
}>()

const route = useRoute()

const navItems = [
  { to: '/admin',          label: 'admin.calendar', icon: 'i-heroicons-calendar-days' },
  { to: '/admin/bookings', label: 'admin.bookings', icon: 'i-heroicons-clipboard-document-list' },
  { to: '/admin/services', label: 'admin.services', icon: 'i-heroicons-sparkles' },
  { to: '/admin/staff',    label: 'admin.staff',    icon: 'i-heroicons-users' },
  { to: '/admin/settings', label: 'admin.settings', icon: 'i-heroicons-cog-6-tooth' },
]

// /admin only matches exactly; all others match by prefix
function isActive(to: string): boolean {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Salon branding -->
    <div class="p-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
      <div
        v-if="tenant.logoUrl"
        class="w-9 h-9 rounded-xl overflow-hidden shrink-0"
      >
        <img :src="tenant.logoUrl" :alt="tenant.name" class="w-full h-full object-cover" />
      </div>
      <div
        v-else
        class="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
        :style="{ backgroundColor: tenant.brandColor }"
      >
        {{ tenant.name.charAt(0) }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-gray-900 text-sm leading-tight truncate">{{ tenant.name }}</p>
        <p class="text-xs text-gray-400 mt-0.5">{{ $t('admin.dashboard') }}</p>
      </div>
    </div>

    <!-- Nav items -->
    <nav class="flex-1 p-2 space-y-0.5 overflow-y-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors w-full"
        :class="isActive(item.to)
          ? 'bg-gray-100 text-gray-900 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        @click="props.onClose?.()"
      >
        <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
        <span>{{ $t(item.label) }}</span>
      </NuxtLink>
    </nav>

    <!-- Logout (stub — no action yet) -->
    <div class="p-2 border-t border-gray-100 shrink-0">
      <button
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
      >
        <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5 shrink-0" />
        <span>{{ $t('admin.logout') }}</span>
      </button>
    </div>
  </div>
</template>
