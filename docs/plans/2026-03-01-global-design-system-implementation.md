# Global Design System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply IBM Plex Arabic font, a dusty-rose `salona` color palette, system dark mode, and full-width admin desktop layout globally — without touching individual components.

**Architecture:** Three-layer approach: (1) `main.css` owns all design tokens via Tailwind v4 `@theme`, (2) `app.config.ts` wires the `salona` color as Nuxt UI's primary, (3) `nuxt.config.ts` enables system-preference dark mode. Layout files and 5 admin page wrappers are updated to use the new tokens and remove width constraints.

**Tech Stack:** Nuxt 4, @nuxt/ui v4.5 (Tailwind v4), @nuxtjs/color-mode (bundled with @nuxt/ui), Google Fonts CDN

---

### Task 1: Add font + color design tokens to `main.css`

This is the core file. It replaces the two-line CSS with the full design system.

**Files:**
- Modify: `app/assets/css/main.css`

**Step 1: Replace `main.css` entirely with the full theme**

```css
/* app/assets/css/main.css */

/* 1. Tailwind + Nuxt UI base — must come first */
@import "tailwindcss";
@import "@nuxt/ui";

/* 2. IBM Plex Arabic — 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold) */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Arabic:wght@300;400;500;600;700&display=swap');

/* 3. Design tokens — extends Tailwind's theme, generates utility classes automatically.
      --color-salona-* creates: bg-salona-500, text-salona-300, border-salona-200, etc.
      --font-sans overrides the global sans-serif stack everywhere. */
@theme {
  --font-sans: 'IBM Plex Arabic', ui-sans-serif, system-ui, -apple-system, sans-serif;

  --color-salona-50:  oklch(97% 0.010 350);
  --color-salona-100: oklch(93% 0.020 350);
  --color-salona-200: oklch(86% 0.050 350);
  --color-salona-300: oklch(78% 0.075 350);
  --color-salona-400: oklch(70% 0.090 350);
  --color-salona-500: oklch(60% 0.090 350);  /* ~#C9748A — main accent */
  --color-salona-600: oklch(52% 0.080 350);
  --color-salona-700: oklch(44% 0.070 350);
  --color-salona-800: oklch(36% 0.060 350);
  --color-salona-900: oklch(28% 0.050 350);
  --color-salona-950: oklch(20% 0.030 350);
}

/* 4. Semantic surface/background tokens — light mode defaults.
      These are used directly in layouts via Tailwind's CSS variable shorthand:
      bg-(--color-bg), bg-(--color-surface), border-(--color-border), etc. */
:root {
  --color-bg:            #FAFAF7;   /* warm off-white — replaces bg-gray-50 everywhere */
  --color-surface:       #FFFFFF;   /* cards, sidebar, modals */
  --color-surface-muted: #F4F2EF;   /* subtle section background */
  --color-border:        #E8E4DE;   /* replaces border-gray-100 */
  --color-text:          #1E1B1A;   /* near-black with warmth */
  --color-text-muted:    #8C8580;   /* secondary text, labels */
}

/* 5. Dark mode overrides — Nuxt UI's color-mode adds .dark to <html>; these take effect. */
.dark {
  --color-bg:            #16141A;   /* warm dark, slight purple undertone */
  --color-surface:       #1E1C24;
  --color-surface-muted: #252230;
  --color-border:        #2E2A38;
  --color-text:          #F5F3F0;
  --color-text-muted:    #A09AA4;
}

/* 6. Global base — antialiasing + Arabic line height per design doc (1.5-1.7 recommended) */
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  line-height: 1.6;
  color: var(--color-text);
  background-color: var(--color-bg);
}
```

**Step 2: Run dev server to check for CSS errors**

```bash
npm run dev
```

Expected: server starts, no CSS parse errors in terminal. Open `http://localhost:3000` — font should already change to IBM Plex Arabic.

**Step 3: Commit**

```bash
git add app/assets/css/main.css
git commit -m "style: add IBM Plex Arabic font, salona color palette, and dark mode tokens"
```

---

### Task 2: Create `app.config.ts` — wire `salona` as Nuxt UI primary

This makes every `<UButton>`, `<UBadge>`, `<UInput>` focus ring, and any component that uses `color="primary"` automatically use the salona rose.

**Files:**
- Create: `app/app.config.ts`

**Step 1: Create the file**

```ts
// app/app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'salona',
    },
  },
})
```

**Step 2: Run dev and verify**

```bash
npm run dev
```

Navigate to any admin page. Any `<UButton>` with `color="primary"` (or no `color` prop if it defaults to primary) should now show the dusty rose color instead of the default.

If you see an error like `color 'salona' not found`, confirm that `--color-salona-500` is defined in the `@theme` block in `main.css` from Task 1.

**Step 3: Commit**

```bash
git add app/app.config.ts
git commit -m "style: configure Nuxt UI to use salona as primary color"
```

---

### Task 3: Configure color mode in `nuxt.config.ts`

Tells `@nuxtjs/color-mode` (bundled with @nuxt/ui) to follow the OS setting and apply `.dark` / `.light` class to `<html>`.

**Files:**
- Modify: `nuxt.config.ts`

**Step 1: Add `colorMode` to the config**

Add this block inside `defineNuxtConfig({})` — at the same level as `modules`, `css`, etc.:

```ts
colorMode: {
  preference: 'system',   // follow OS — no toggle needed
  fallback: 'light',      // when OS preference is unknown
  classSuffix: '',        // apply class="dark" not class="dark-mode"
},
```

Full result:
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/eslint',
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
  },

  imports: {
    dirs: ['composables/**'],
  },

  i18n: {
    locales: [
      { code: 'ar', language: 'ar-SA', dir: 'rtl', name: 'العربية', file: 'ar.json' },
      { code: 'en', language: 'en-US', dir: 'ltr', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'ar',
    strategy: 'no_prefix',
  },

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/*', '/*/**'],
    },
  },
})
```

**Step 2: Test dark mode**

```bash
npm run dev
```

In your OS settings, switch to dark mode. The browser should update immediately: background goes dark (`#16141A`), text goes light. Nuxt UI components (buttons, inputs) also switch. Switch back to light mode — it reverts.

If dark mode isn't applying, open DevTools → Elements → check `<html class="...">`. Should contain `dark` or `light`. If `classSuffix: ''` is not respected, try `classSuffix: '-mode'` and check for `dark-mode` class instead (then update `.dark` selector in CSS to `.dark-mode`).

**Step 3: Commit**

```bash
git add nuxt.config.ts
git commit -m "style: configure color mode to follow system preference"
```

---

### Task 4: Update `admin.vue` layout — semantic colors + padding

The layout handles page padding from here on. Individual admin pages will have their outer padding wrapper stripped in the next tasks.

**Files:**
- Modify: `app/layouts/admin.vue`

**Step 1: Apply semantic color tokens**

Replace the current template section. Key changes:
- `bg-gray-50` → `bg-(--color-bg)`
- `bg-white` → `bg-(--color-surface)`
- `border-gray-100` → `border-(--color-border)`
- Add `p-6 lg:p-8` to `<main>`

```vue
<!-- app/layouts/admin.vue -->
<script setup lang="ts">
import { mockTenant } from '~/data/mock'

const drawerOpen = ref(false)
</script>

<template>
  <UApp>
    <div class="min-h-screen flex bg-(--color-bg)">
      <!-- Desktop sidebar — first in DOM so RTL flex places it on the right -->
      <aside class="hidden lg:flex lg:flex-col w-64 shrink-0 bg-(--color-surface) border-e border-(--color-border) h-screen sticky top-0">
        <AdminNavLinks :tenant="mockTenant" />
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-auto min-w-0 p-6 lg:p-8">
        <!-- Mobile header (hidden on lg+) -->
        <header class="lg:hidden sticky top-0 z-10 bg-(--color-surface) border-b border-(--color-border) px-4 h-14 flex items-center justify-between -mx-6 -mt-6 mb-6">
          <button
            class="p-2 -ms-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            :aria-label="$t('common.menu')"
            @click="drawerOpen = true"
          >
            <UIcon name="i-heroicons-bars-3" class="w-5 h-5" />
          </button>
          <p class="font-semibold text-sm">{{ mockTenant.name }}</p>
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
```

**Step 2: Verify visually**

```bash
npm run dev
```

Navigate to `/admin`. The sidebar and background should use warm colors. On a wide screen, content should now fill the full width of the area beside the sidebar.

**Note:** Admin pages still have their old `p-6 max-w-2xl mx-auto` wrapper — you'll see double padding temporarily until Task 5–9 strip them. That's expected.

**Step 3: Commit**

```bash
git add app/layouts/admin.vue
git commit -m "style: use semantic color tokens and add layout-level padding to admin"
```

---

### Task 5: Update `default.vue` layout

**Files:**
- Modify: `app/layouts/default.vue`

**Step 1: Replace `bg-gray-50` with CSS variable**

```vue
<!-- app/layouts/default.vue -->
<template>
  <UApp>
    <div class="min-h-screen bg-(--color-bg)">
      <slot />
    </div>
  </UApp>
</template>
```

**Step 2: Commit**

```bash
git add app/layouts/default.vue
git commit -m "style: use semantic bg token in default layout"
```

---

### Task 6: Strip outer wrapper from `admin/index.vue` (calendar)

The layout now provides padding. The `max-w-2xl` cap is removed so the calendar fills available desktop width.

**Files:**
- Modify: `app/pages/admin/index.vue`

**Step 1: Remove the outer div**

In `app/pages/admin/index.vue`, find:
```html
<template>
  <div class="p-6 max-w-2xl mx-auto">
```
Replace with:
```html
<template>
  <div>
```

**Step 2: Verify**

```bash
npm run dev
```

Navigate to `/admin` on a wide window. The calendar week strip and timeline should now use the full content width beside the sidebar.

**Step 3: Commit**

```bash
git add app/pages/admin/index.vue
git commit -m "style: remove max-w-2xl cap from calendar page — layout handles padding"
```

---

### Task 7: Strip outer wrapper from `admin/bookings.vue`

**Files:**
- Modify: `app/pages/admin/bookings.vue`

**Step 1: Remove the outer div**

Find:
```html
<template>
  <div class="p-6 max-w-2xl mx-auto">
```
Replace with:
```html
<template>
  <div>
```

**Step 2: Commit**

```bash
git add app/pages/admin/bookings.vue
git commit -m "style: remove max-w-2xl cap from bookings page"
```

---

### Task 8: Strip outer wrapper from `admin/services.vue`

**Files:**
- Modify: `app/pages/admin/services.vue`

**Step 1: Remove the outer div**

Find:
```html
<template>
  <div class="p-6 max-w-2xl mx-auto">
```
Replace with:
```html
<template>
  <div>
```

**Step 2: Commit**

```bash
git add app/pages/admin/services.vue
git commit -m "style: remove max-w-2xl cap from services page"
```

---

### Task 9: Strip outer wrapper from `admin/staff.vue`

**Files:**
- Modify: `app/pages/admin/staff.vue`

**Step 1: Remove the outer div**

Find:
```html
<template>
  <div class="p-6 max-w-2xl mx-auto">
```
Replace with:
```html
<template>
  <div>
```

**Step 2: Commit**

```bash
git add app/pages/admin/staff.vue
git commit -m "style: remove max-w-2xl cap from staff page"
```

---

### Task 10: Update `admin/settings.vue` — keep form constrained

Settings is a form, not a data view. Full-width for a form reads poorly. The fix: remove the page-level padding but keep the form itself constrained at `max-w-2xl`.

**Files:**
- Modify: `app/pages/admin/settings.vue`

**Step 1: Remove padding from outer div, move constraint to inner form**

Find:
```html
<template>
  <div class="p-6 max-w-lg mx-auto">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">
        {{ $t('admin.settings.title') }}
      </h1>
    </div>

    <form class="space-y-8" @submit.prevent="handleSave">
```

Replace with:
```html
<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">
        {{ $t('admin.settings.title') }}
      </h1>
    </div>

    <form class="space-y-8 max-w-2xl" @submit.prevent="handleSave">
```

**Step 2: Verify**

```bash
npm run dev
```

Navigate to `/admin/settings`. The page header should be flush with the layout padding. The form fields should be constrained to a readable width, not stretching across the full desktop.

**Step 3: Commit**

```bash
git add app/pages/admin/settings.vue
git commit -m "style: remove padding wrapper from settings page, constrain form width only"
```

---

### Task 11: Final visual verification

**Step 1: Run dev and check all screens**

```bash
npm run dev
```

Work through this checklist in the browser:

- [ ] **Font:** Text on all pages uses IBM Plex Arabic (check with DevTools → Computed → font-family)
- [ ] **Light mode background:** Warm `#FAFAF7` (not stark white) — visible on admin and booking pages
- [ ] **Dark mode:** Switch OS to dark mode → admin background goes dark (`#16141A`), sidebar dark, text light
- [ ] **Admin desktop (≥1024px):** Calendar, bookings, services, staff all fill the width beside the sidebar — no narrow column in center
- [ ] **Settings desktop:** Form is constrained to readable width, not full-width
- [ ] **Buttons:** Primary buttons show dusty rose color (not default blue/gray)
- [ ] **Booking page:** Still centered narrow column — unchanged
- [ ] **Mobile admin:** Hamburger menu, drawer, header all look correct

**Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors. If Tailwind's `bg-(--color-bg)` syntax triggers an unknown utility warning from eslint-plugin-tailwindcss, this is a false positive — the `(--var)` shorthand is valid Tailwind v4 syntax.

**Step 3: Commit if any cleanup was needed**

```bash
git add -A
git commit -m "style: final cleanup after global design system implementation"
```

---

## Post-Implementation Notes

### AdminNavLinks hardcoded grays

`AdminNavLinks.vue` uses `bg-gray-100`, `text-gray-600`, `hover:bg-gray-50` for nav item states. These still work but don't respond to dark mode. This is acceptable for now since it's a single component — can be addressed as a follow-up when building the login UI.

### Component-level `text-gray-*` classes

Existing components use hardcoded Tailwind gray utilities (`text-gray-900`, `text-gray-400`, etc.). In light mode these look fine. In dark mode they may be hard to read since gray-900 is near-black. This is a gradual improvement — the global `body { color: var(--color-text) }` handles base text; component-level colors will be incrementally updated as those components are touched.

### Nuxt UI auto dark mode

Nuxt UI components (`UButton`, `UInput`, `UCard`, `UBadge`, etc.) have full built-in dark mode support. Once `.dark` is on `<html>`, they switch automatically with no changes needed.
