# Admin Layout & Navigation Shell Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the admin layout shell — desktop sidebar, mobile hamburger+drawer navigation, and stub pages for all five admin sections — so every future admin feature page has a solid, consistent foundation to build on.

**Architecture:** `AdminNavLinks.vue` is a single component shared by both the desktop sidebar and the mobile `USlideover` drawer, eliminating duplication. `admin.vue` layout orchestrates the two-column desktop structure and the mobile header + drawer. All pages use `mockTenant` from `app/data/mock.ts` for branding — no real API calls yet.

**Tech Stack:** Nuxt 4, Nuxt UI v3 (`USlideover`, `UIcon`, `UApp`), @nuxtjs/i18n, TypeScript, `NuxtLink`, `useRoute()`

---

## Task 1: Add `bookings` i18n key

**Files:**
- Modify: `i18n/locales/ar.json`
- Modify: `i18n/locales/en.json`

No test for i18n changes — browser check is sufficient.

**Step 1: Add to `ar.json`**

Open `i18n/locales/ar.json`. In the `"admin"` object, add after `"calendar"`:

```json
"bookings": "الحجوزات",
```

The `admin` block should now read:

```json
"admin": {
  "dashboard": "لوحة التحكم",
  "calendar": "التقويم",
  "bookings": "الحجوزات",
  "services": "الخدمات",
  "staff": "الموظفات",
  "settings": "الإعدادات",
  "addService": "إضافة خدمة",
  "addStaff": "إضافة موظفة",
  "newBooking": "حجز جديد",
  "logout": "تسجيل الخروج"
}
```

**Step 2: Add to `en.json`**

Same location in `i18n/locales/en.json`:

```json
"bookings": "Bookings",
```

**Step 3: Commit**

```bash
git add i18n/locales/ar.json i18n/locales/en.json
git commit -m "feat: add bookings i18n key to admin translations"
```

---

## Task 2: AdminNavLinks component

**Files:**
- Create: `app/components/admin/AdminNavLinks.vue`

This is the shared nav list. The exact same component renders inside the desktop sidebar and inside the mobile drawer — no duplication.

**Step 1: Create the component**

```vue
<!-- app/components/admin/AdminNavLinks.vue -->
<script setup lang="ts">
import type { Tenant } from '~/app/types'

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
```

**Step 2: Commit**

```bash
git add app/components/admin/AdminNavLinks.vue
git commit -m "feat: add AdminNavLinks shared nav component"
```

---

## Task 3: Rewrite admin layout

**Files:**
- Modify: `app/layouts/admin.vue`

The existing file is fully replaced — it was just a skeletal placeholder.

**Step 1: Replace the file**

```vue
<!-- app/layouts/admin.vue -->
<script setup lang="ts">
import { mockTenant } from '~/app/data/mock'

const drawerOpen = ref(false)
</script>

<template>
  <UApp>
    <div class="min-h-screen flex bg-gray-50">
      <!-- Main content — flex-1, rendered first in DOM -->
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

      <!-- Desktop sidebar (RTL: start = right side) -->
      <aside class="hidden lg:flex lg:flex-col w-64 shrink-0 bg-white border-s border-gray-100 h-screen sticky top-0">
        <AdminNavLinks :tenant="mockTenant" />
      </aside>

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
```

**Step 2: Add `menu` key to i18n** (needed for the hamburger `aria-label`)

In `i18n/locales/ar.json`, add to the `"common"` object:

```json
"menu": "القائمة",
```

In `i18n/locales/en.json`, add to `"common"`:

```json
"menu": "Menu",
```

**Step 3: Verify in browser**

```bash
npm run dev
```

Navigate to `http://localhost:3000/admin`.

Desktop (≥1024px wide):
- Right sidebar visible with "صالون نور للتجميل" branding
- 5 nav items with icons
- "التقويم" is active (highlighted) on the index page
- Logout button at bottom (no action on click — expected)

Mobile (<1024px, or DevTools responsive mode):
- Only sticky header visible, no sidebar
- Hamburger icon on the left
- Tapping hamburger opens drawer from the right with identical nav
- Tapping any nav item closes the drawer

**Step 4: Commit**

```bash
git add app/layouts/admin.vue i18n/locales/ar.json i18n/locales/en.json
git commit -m "feat: rewrite admin layout with desktop sidebar and mobile drawer navigation"
```

---

## Task 4: Stub pages

**Files:**
- Create: `app/pages/admin/bookings.vue`
- Create: `app/pages/admin/services.vue`
- Create: `app/pages/admin/staff.vue`
- Create: `app/pages/admin/settings.vue`

These are heading-only placeholders so the nav links resolve to real pages and the active state can be tested end-to-end.

**Step 1: Create `bookings.vue`**

```vue
<!-- app/pages/admin/bookings.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold text-gray-900">{{ $t('admin.bookings') }}</h1>
  </div>
</template>
```

**Step 2: Create `services.vue`**

```vue
<!-- app/pages/admin/services.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold text-gray-900">{{ $t('admin.services') }}</h1>
  </div>
</template>
```

**Step 3: Create `staff.vue`**

```vue
<!-- app/pages/admin/staff.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold text-gray-900">{{ $t('admin.staff') }}</h1>
  </div>
</template>
```

**Step 4: Create `settings.vue`**

```vue
<!-- app/pages/admin/settings.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold text-gray-900">{{ $t('admin.settings') }}</h1>
  </div>
</template>
```

**Step 5: Verify active states in browser**

Navigate to each route and confirm the correct nav item becomes active:
- `/admin` → التقويم is highlighted, others are not
- `/admin/bookings` → الحجوزات is highlighted, التقويم is NOT
- `/admin/services` → الخدمات is highlighted
- `/admin/staff` → الموظفات is highlighted
- `/admin/settings` → الإعدادات is highlighted

**Step 6: Commit**

```bash
git add app/pages/admin/bookings.vue app/pages/admin/services.vue app/pages/admin/staff.vue app/pages/admin/settings.vue
git commit -m "feat: add stub pages for admin bookings, services, staff, and settings"
```

---

## What's next

The admin shell is done. All future admin pages use `layout: 'admin'` and appear with correct navigation automatically. Next in order:

1. **Admin: service management** — CRUD for services and categories at `/admin/services`
2. **Admin: staff management** — CRUD for staff at `/admin/staff`
3. **Supabase schema** — turn the TypeScript types into real DB tables
