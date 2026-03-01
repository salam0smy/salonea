# Salona — Tooling Setup Design

**Date:** 2026-03-01
**Status:** Approved
**Scope:** Project scaffolding, module selection, directory structure, and conventions

---

## 1. Context

Fresh Nuxt 4.3.1 scaffold. No modules installed yet. The project is an Arabic-first, mobile-first salon booking and payments SaaS (see `docs/salon-booking-prd.md` for full requirements).

Key drivers for tooling decisions:
- Arabic-first (RTL) is the default experience, not an afterthought
- Mobile-first customer booking page
- Admin dashboard (desktop-first)
- Multi-tenancy from day one (one codebase, multiple salons)
- Supabase now, Drizzle ORM migration path later
- Feature-first code organization within Nuxt's conventional directories

---

## 2. Module Stack

| Concern | Package | Version | Reason |
|---|---|---|---|
| UI + Styling | `@nuxt/ui` | v3 | Nuxt 4 native, Tailwind v4 built-in, RTL support, 50+ accessible components |
| Database + Auth | `@nuxtjs/supabase` | latest | SSR-safe Supabase client, auth composables, fast to launch |
| i18n | `@nuxtjs/i18n` | latest | Arabic default locale, auto `dir="rtl"` on `<html>`, English ready |
| State | `@pinia/nuxt` | latest | De-facto Vue state management, composable stores, auto-imported |
| Code quality | `@nuxt/eslint` | latest | Official Nuxt ESLint flat config with TypeScript rules |
| Testing | `vitest` + `@nuxt/test-utils` | latest | Unit tests for composables and Nitro API routes |

---

## 3. Directory Structure

### Frontend (`app/`)

```
app/
  pages/
    [salon].vue              # Public customer booking page
    admin/
      index.vue              # Calendar view — default admin landing
      services.vue           # Service management
      staff.vue              # Staff management
      settings.vue           # Salon settings

  components/
    booking/                 # Auto-imported as <BookingXxx>
      ServiceCard.vue
      TimePicker.vue
      BookingSteps.vue
    admin/                   # Auto-imported as <AdminXxx>
      CalendarView.vue
      BookingRow.vue
      StatsCard.vue
    shared/                  # Auto-imported as <SharedXxx>
      LoadingSpinner.vue
      PageHeader.vue

  composables/
    booking/
      useBookingFlow.ts      # Multi-step booking state machine
      useAvailability.ts     # Fetches available time slots
    admin/
      useAdminCalendar.ts    # Calendar data + interactions
      useServices.ts         # Service CRUD

  layouts/
    default.vue              # Customer layout: RTL, mobile-first, minimal
    admin.vue                # Admin layout: sidebar nav, desktop-first

  middleware/
    auth.ts                  # Redirects unauthenticated users from /admin/*

  i18n/
    ar.json                  # Arabic strings (default locale)
    en.json                  # English strings (secondary)
```

### Backend (`server/`)

```
server/
  api/
    bookings/
      index.post.ts          # POST  /api/bookings       — create booking
      [id].get.ts            # GET   /api/bookings/:id   — get booking
      [id].patch.ts          # PATCH /api/bookings/:id   — update/cancel
    services/
      index.get.ts           # GET   /api/services
      index.post.ts          # POST  /api/services
      [id].patch.ts          # PATCH /api/services/:id
      [id].delete.ts         # DELETE /api/services/:id
    staff/
      index.get.ts
      index.post.ts
      [id].patch.ts
      [id].delete.ts
    availability/
      index.get.ts           # GET  /api/availability?date=&serviceId=&staffId=
    payments/
      initiate.post.ts       # POST /api/payments/initiate — start Moyasar payment
      webhook.post.ts        # POST /api/payments/webhook  — Moyasar callback

  utils/
    supabase.ts              # Server-side Supabase client singleton
    repositories/            # Data access layer — Supabase today, Drizzle later
      bookings.ts
      services.ts
      staff.ts
      tenants.ts

  middleware/
    tenant.ts                # Resolves [salon] slug → tenantId → event.context.tenantId
```

---

## 4. Key Conventions

### Component Naming
Nuxt 4 auto-imports components from subdirectories with path-prefix naming:
- `components/booking/ServiceCard.vue` → `<BookingServiceCard>` in templates
- `components/admin/CalendarView.vue` → `<AdminCalendarView>` in templates
- `components/shared/LoadingSpinner.vue` → `<SharedLoadingSpinner>` in templates

No `nuxt.config.ts` changes needed — this is the default Nuxt 4 behavior.

### Composable Naming
All composables in `app/composables/**` are auto-imported globally:
- `composables/booking/useBookingFlow.ts` → `useBookingFlow()` available everywhere
- `composables/admin/useAdminCalendar.ts` → `useAdminCalendar()` available everywhere

### Multi-Tenancy Pattern
Tenant isolation is enforced at the server middleware level:
1. `server/middleware/tenant.ts` runs on every request
2. Resolves the salon slug from the URL or auth JWT to a `tenantId` UUID
3. Attaches it to `event.context.tenantId`
4. All repository calls receive `tenantId` as the first argument
5. API routes never trust a client-sent `tenantId`

```ts
// Every repository function signature follows this pattern:
async function getBookings(tenantId: string, options: GetBookingsOptions) { ... }
```

### Repository Pattern (Migration Seam)
API routes never call Supabase directly — they call repository functions:

```ts
// server/api/bookings/index.get.ts
export default defineEventHandler(async (event) => {
  const { tenantId } = event.context
  return getBookings(tenantId, { upcoming: true })
})

// server/utils/repositories/bookings.ts
export async function getBookings(tenantId: string, options) {
  const client = useSupabaseServerClient()
  return client.from('bookings').select('*').eq('tenant_id', tenantId)
}
```

When migrating to Drizzle: only `server/utils/repositories/*.ts` files change. The API layer stays identical.

### Auth Guard
`app/middleware/auth.ts` runs on all `/admin/*` routes. Uses `useSupabaseUser()` — redirects to `/login` if null.

### i18n
- Default locale: `ar` (Arabic, RTL)
- Secondary locale: `en` (English, LTR)
- `@nuxtjs/i18n` automatically sets `<html dir="rtl" lang="ar">` for the default locale
- Nuxt UI v3 respects the `dir` attribute for all component layouts
- Translation files in `app/i18n/ar.json` and `app/i18n/en.json`

---

## 5. nuxt.config.ts Shape

```ts
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

  i18n: {
    locales: [
      { code: 'ar', language: 'ar-SA', dir: 'rtl', name: 'العربية' },
      { code: 'en', language: 'en-US', dir: 'ltr', name: 'English' },
    ],
    defaultLocale: 'ar',
    strategy: 'no_prefix',         // Arabic at /, English at /en/
  },

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/[salon]'],   // Public booking pages don't need auth
    },
  },
})
```

---

## 6. What is NOT in this setup

Per PRD scope and YAGNI:
- No Drizzle ORM yet (Supabase first, migrate when needed)
- No Playwright E2E tests (Phase 2)
- No SMS/WhatsApp API integration (Phase 2)
- No Moyasar SDK wrapper (thin fetch calls in payment API routes is sufficient for MVP)
- No Nuxt Layers (overkill for 2 features at MVP scale)
- No Docker / containerization setup

---

## 7. Open Questions Before Implementation

1. Supabase project URL and anon key — need `.env` values from the client's or dev Supabase project
2. Moyasar test API key — needed to scaffold the payments API routes with real field names
3. Confirm: `strategy: 'no_prefix'` for i18n (Arabic at `/`, English at `/en/`) or prefix both (`/ar/`, `/en/`)?
