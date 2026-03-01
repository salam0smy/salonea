<!-- app/components/admin/AdminNavLinks.vue -->
<script setup lang="ts">
import type { Tenant } from '~/types'
import { useAuth } from '~/composables/useAuth'

const props = defineProps<{
  tenant: Tenant
  onClose?: () => void
}>()

const route = useRoute()
const colorMode = useColorMode()
const { locale, setLocale } = useI18n()
const { signOut } = useAuth()

// Theme icon: fixed until mounted to avoid hydration mismatch (SSR has no colorMode)
const themeIcon = ref<'i-heroicons-sun' | 'i-heroicons-moon'>('i-heroicons-moon')
onMounted(() => {
  themeIcon.value = colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'
})
watch(() => colorMode.value, (mode) => {
  themeIcon.value = mode === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'
})

const localeDisplay = computed(() => locale.value === 'ar' ? 'العربية' : 'English')

function toggleLocale() {
  setLocale(locale.value === 'ar' ? 'en' : 'ar')
}

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const navItems = [
  { to: '/admin',          label: 'admin.calendar.label', icon: 'i-heroicons-calendar-days' },
  { to: '/admin/bookings', label: 'admin.bookings', icon: 'i-heroicons-clipboard-document-list' },
  { to: '/admin/services', label: 'admin.services', icon: 'i-heroicons-sparkles' },
  { to: '/admin/staff',    label: 'admin.staff',    icon: 'i-heroicons-users' },
  { to: '/admin/settings', label: 'admin.settings.title', icon: 'i-heroicons-cog-6-tooth' },
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
    <div class="p-4 border-b border-(--color-border) flex items-center gap-3 shrink-0">
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
        <p class="font-semibold text-(--color-text) text-sm leading-tight truncate">{{ tenant.name }}</p>
        <p class="text-xs text-(--color-text-muted) mt-0.5">{{ $t('admin.dashboard') }}</p>
      </div>
    </div>

    <!-- Nav items -->
    <nav class="flex-1 p-2 space-y-0.5 overflow-y-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 py-2.5 rounded-xl text-sm transition-colors w-full"
        :class="isActive(item.to)
          ? 'bg-(--color-surface-muted) text-(--color-text) font-medium border-s-2 border-salona-500 ps-[10px] pe-3'
          : 'text-(--color-text-muted) hover:bg-(--color-surface-muted) hover:text-(--color-text) px-3'"
        @click="props.onClose?.()"
      >
        <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
        <span>{{ $t(item.label) }}</span>
      </NuxtLink>
    </nav>

    <!-- Bottom controls -->
    <div class="p-2 border-t border-(--color-border) shrink-0 space-y-0.5">
      <!-- Utility row: language + theme -->
      <div class="flex items-center justify-between px-3 py-2">
        <!-- Language switcher -->
        <button
          class="flex items-center gap-2 text-sm text-(--color-text-muted) hover:text-(--color-text) transition-colors"
          :aria-label="$t('admin.nav.switchLanguage')"
          @click="toggleLocale"
        >
          <UIcon name="i-heroicons-language" class="w-4 h-4 shrink-0" />
          <span>{{ localeDisplay }}</span>
        </button>

        <!-- Theme toggle (icon from ref to avoid SSR/client colorMode hydration mismatch) -->
        <button
          class="p-1.5 rounded-lg text-(--color-text-muted) hover:bg-(--color-surface-muted) hover:text-(--color-text) transition-colors"
          :aria-label="themeIcon === 'i-heroicons-sun' ? $t('admin.nav.toggleLight') : $t('admin.nav.toggleDark')"
          @click="toggleTheme"
        >
          <UIcon :name="themeIcon" class="w-4 h-4" />
        </button>
      </div>

      <!-- Logout -->
      <button
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-(--color-text-muted) hover:bg-(--color-surface-muted) hover:text-(--color-text) w-full transition-colors"
        @click="signOut()"
      >
        <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5 shrink-0" />
        <span>{{ $t('admin.logout') }}</span>
      </button>
    </div>
  </div>
</template>
