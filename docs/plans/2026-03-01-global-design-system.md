# Global Design System — Salona

**Date:** 2026-03-01
**Status:** Approved, ready for implementation

---

## Goal

Apply a cohesive visual identity to the entire app globally without rewriting individual components or pages. The app currently has no design tokens, no custom font, no dark mode, and admin pages are capped at `max-w-2xl` making desktop look neglected.

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Arabic font | IBM Plex Arabic | Clean, modern, polished — full weight range, excellent UI legibility |
| Dark mode trigger | System preference only | Zero UI needed; OS handles it via `prefers-color-scheme` |
| Primary accent | Custom `salona` color (dusty rose) | Avoids colliding with Tailwind's built-in `rose`; reads clearly in code |
| Desktop admin layout | Full-width with padding in layout | Calendar, bookings, cards should use available space |

---

## Architecture — 3 Layers

### Layer 1 — CSS Design Tokens (`main.css`)

Everything global lives here: font import, color palette, semantic CSS variables, dark mode overrides.

### Layer 2 — Nuxt UI Component Defaults (`app.config.ts`)

Maps the `salona` color as `primary` so all `UButton`, `UBadge`, `UInput` etc. inherit it without explicit `color` props on every usage.

### Layer 3 — Color Mode (`nuxt.config.ts`)

Configures `@nuxtjs/color-mode` (bundled with `@nuxt/ui`) to follow system preference and add `.dark` to `<html>` automatically.

---

## Files Changed

| File | Change | Lines |
|---|---|---|
| `app/assets/css/main.css` | Full theme: font + tokens + dark mode | ~80 lines |
| `app/app.config.ts` | NEW — Nuxt UI primary color + component defaults | ~15 lines |
| `nuxt.config.ts` | Add `colorMode` config | +4 lines |
| `app/layouts/admin.vue` | Add `p-6 lg:p-8` to main, update bg from `bg-gray-50` to CSS var | ~5 lines |
| `app/layouts/default.vue` | Update bg from `bg-gray-50` to CSS var | 1 line |
| `app/pages/admin/index.vue` | Remove outer `<div class="p-6 max-w-2xl mx-auto">` | 2 lines |
| `app/pages/admin/bookings.vue` | Remove outer `<div class="p-6 max-w-2xl mx-auto">` | 2 lines |
| `app/pages/admin/services.vue` | Remove outer `<div class="p-6 max-w-2xl mx-auto">` | 2 lines |
| `app/pages/admin/staff.vue` | Remove outer `<div class="p-6 max-w-2xl mx-auto">` | 2 lines |
| `app/pages/admin/settings.vue` | Remove outer `<div class="p-6 max-w-lg mx-auto">` | 2 lines |

**Not touched:** `[salon].vue` — `max-w-lg centered` is intentional per design doc (customer booking flow stays narrow on desktop).

---

## Color Palette

### `salona` — Primary accent (dusty rose / mauve)

Defined in `@theme` as `--color-salona-*`, Tailwind exposes as `text-salona-500`, `bg-salona-100`, etc.

| Scale | Approx hex | Use |
|---|---|---|
| 50 | `#FDF2F5` | Very light tint backgrounds |
| 100 | `#FAE0E8` | Hover states, selected background |
| 200 | `#F3B8CB` | — |
| 300 | `#E88EAB` | — |
| 400 | `#D97A97` | — |
| **500** | `#C9748A` | **Primary CTA, active nav, focus rings** |
| 600 | `#B55A72` | Hover on primary |
| 700 | `#93405A` | — |
| 800 | `#7A3349` | — |
| 900 | `#61273A` | — |
| 950 | `#3D1524` | — |

### Semantic CSS variables

| Variable | Light | Dark |
|---|---|---|
| `--color-bg` | `#FAFAF7` | `#16141A` |
| `--color-surface` | `#FFFFFF` | `#1E1C24` |
| `--color-surface-muted` | `#F4F2EF` | `#252230` |
| `--color-border` | `#E8E4DE` | `#2E2A38` |
| `--color-text` | `#1E1B1A` | `#F5F3F0` |
| `--color-text-muted` | `#8C8580` | `#A09AA4` |

These are used directly in layouts: `bg-(--color-bg)` / `bg-(--color-surface)` using Tailwind v4's arbitrary CSS variable syntax.

---

## Typography

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Arabic:wght@300;400;500;600;700&display=swap');

@theme {
  --font-sans: 'IBM Plex Arabic', ui-sans-serif, system-ui, -apple-system, sans-serif;
}

html {
  -webkit-font-smoothing: antialiased;
}

body {
  line-height: 1.6; /* Arabic needs generous line-height per design doc */
}
```

---

## Dark Mode Mechanism

1. `nuxt.config.ts` adds:
   ```ts
   colorMode: {
     preference: 'system',
     fallback: 'light',
     classSuffix: '',   // produces class="dark" not class="dark-mode"
   }
   ```

2. `@nuxtjs/color-mode` reads `prefers-color-scheme` from the OS and applies `.dark` or `.light` to `<html>`.

3. Tailwind v4's `dark:` variant activates — Nuxt UI components switch automatically.

4. Custom semantic CSS variables switch via:
   ```css
   :root { --color-bg: #FAFAF7; ... }
   .dark { --color-bg: #16141A; ... }
   ```

No JavaScript, no toggle, no stored preference.

---

## Desktop Layout Fix

### `admin.vue` layout

The `<main>` element gets padding directly so pages don't need to set it themselves:

```html
<main class="flex-1 overflow-auto min-w-0 p-6 lg:p-8 bg-(--color-bg)">
  <slot />
</main>
```

### Admin page files (×5)

Each page currently wraps its entire template in:
```html
<div class="p-6 max-w-2xl mx-auto">
  ...content...
</div>
```

This outer div is removed. Content flows full-width inside the padded layout main.

Settings page note: the settings form can keep an inner `max-w-2xl` on the form element itself (not the page wrapper) if it reads better for a single-column form. This is a judgement call at implementation time.

---

## `app.config.ts` — Nuxt UI Defaults

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'salona',
    },
    button: {
      defaultVariants: {
        color: 'primary',
      },
    },
  },
})
```

This makes `<UButton>` default to `color="primary"` (the salona rose) without needing the prop on every usage.

---

## Out of Scope

- Per-component style overrides (handled by the token system automatically)
- Login page UI (separate ticket)
- Customer booking page color adjustments (follows tenant brand color anyway)
- Typography scale changes on individual components
- Motion / animation changes

---

## Success Criteria

After implementation:
- [ ] IBM Plex Arabic renders on all pages
- [ ] Dark mode activates on OS dark preference, light on light
- [ ] Admin dashboard uses full available width on 1280px+ screens
- [ ] Nuxt UI buttons and interactive elements show dusty rose as primary
- [ ] Warm off-white background visible in light mode (not stark `gray-50`)
- [ ] No individual component files were modified
