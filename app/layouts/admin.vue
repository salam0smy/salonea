<!-- app/layouts/admin.vue -->
<script setup lang="ts">
const { tenant } = useSettings()
const route = useRoute()
const { locale, setLocale } = useI18n()
const { signOut } = useAuth()

const localeLabel = computed(() => locale.value === 'ar' ? 'EN' : 'عر')

function toggleLocale() {
  setLocale(locale.value === 'ar' ? 'en' : 'ar')
}

const navItems = [
  { to: '/admin',          label: 'admin.calendar.label', icon: 'i-heroicons-calendar-days' },
  { to: '/admin/bookings', label: 'admin.bookings',       icon: 'i-heroicons-clipboard-document-list' },
  { to: '/admin/services', label: 'admin.services',       icon: 'i-heroicons-sparkles' },
  { to: '/admin/staff',    label: 'admin.staff',          icon: 'i-heroicons-users' },
  { to: '/admin/settings', label: 'admin.settings.title', icon: 'i-heroicons-cog-6-tooth' },
]

const bookingPageUrl = computed(() =>
  tenant.value?.slug ? `/${tenant.value.slug}` : null
)

function isActive(to: string): boolean {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}
</script>

<template>
  <UApp>
    <UDashboardGroup>
      <UDashboardSidebar
        collapsible
        resizable
        :default-size="18"
        :min-size="14"
        :max-size="25"
      >
        <!-- Salon branding -->
        <template #header>
          <div class="flex items-center gap-3 px-3 py-3 min-w-0">
            <div
              v-if="tenant?.logoUrl"
              class="w-9 h-9 rounded-xl overflow-hidden shrink-0"
            >
              <img :src="tenant.logoUrl" :alt="tenant?.name" class="w-full h-full object-cover">
            </div>
            <div
              v-else
              class="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              :style="{ backgroundColor: tenant?.brandColor ?? '#888' }"
            >
              {{ tenant?.name?.charAt(0) ?? '?' }}
            </div>
            <div class="flex-1 min-w-0 overflow-hidden">
              <p class="font-semibold text-(--color-text) text-sm leading-tight truncate">
                {{ tenant?.name }}
              </p>
              <p class="text-xs text-(--color-text-muted) mt-0.5">
                {{ $t('admin.dashboard') }}
              </p>
            </div>
          </div>
        </template>

        <!-- Nav items -->
        <nav class="p-2 space-y-0.5">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 py-2.5 rounded-xl text-sm transition-colors w-full"
            :class="isActive(item.to)
              ? 'bg-(--color-surface-muted) text-(--color-text) font-medium border-s-2 border-salona-500 ps-[10px] pe-3'
              : 'text-(--color-text-muted) hover:bg-(--color-surface-muted) hover:text-(--color-text) px-3'"
          >
            <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
            <span>{{ $t(item.label) }}</span>
          </NuxtLink>
          <a
            v-if="bookingPageUrl"
            :href="bookingPageUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 py-2.5 rounded-xl text-sm transition-colors w-full text-(--color-text-muted) hover:bg-(--color-surface-muted) hover:text-(--color-text) px-3"
          >
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-5 h-5 shrink-0" />
            <span>{{ $t('admin.nav.viewBookingPage') }}</span>
          </a>
        </nav>

        <!-- Bottom controls -->
        <template #footer>
          <div class="p-2 space-y-0.5">
            <div class="flex items-center justify-between px-3 py-2">
              <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                leading-icon="i-heroicons-language"
                :aria-label="$t('admin.nav.switchLanguage')"
                @click="toggleLocale"
              >
                {{ localeLabel }}
              </UButton>
              <UColorModeButton variant="ghost" color="neutral" size="sm" />
            </div>
            <UButton
              variant="ghost"
              color="neutral"
              class="w-full justify-start px-3"
              leading-icon="i-heroicons-arrow-right-on-rectangle"
              @click="signOut()"
            >
              {{ $t('admin.logout') }}
            </UButton>
          </div>
        </template>
      </UDashboardSidebar>

      <!-- Pages render their UDashboardPanel(s) as siblings here -->
      <slot />
    </UDashboardGroup>
  </UApp>
</template>
