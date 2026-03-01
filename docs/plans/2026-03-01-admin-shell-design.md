# Admin Layout & Navigation Shell — Design Document

**Date:** 2026-03-01
**Scope:** Admin layout shell only. No admin functionality (services CRUD, calendar, etc.) is built here.

---

## Problem

The existing `app/layouts/admin.vue` is skeletal: sidebar hidden on mobile with no fallback, no active nav states, no tenant branding, no logout, no mobile navigation. Before building any admin feature pages, the shell needs to be production-quality.

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Desktop nav | Right sidebar (RTL start side) | Matches design doc; standard Arabic admin pattern |
| Mobile nav | Hamburger → right-side USlideover drawer | Bottom tab bar rejected (feels native-app, not web); hamburger is standard |
| Nav data | UI-first with `mockTenant` | Same pattern as booking page; wired to real API later |
| Shared nav content | `AdminNavLinks.vue` component | Sidebar and drawer are identical — single source of truth |
| Active state | `useRoute()` exact-match for index, prefix-match for others | Prevents `/admin` highlighting when on `/admin/services` etc. |

---

## Navigation Items

5 items, in order:

| Arabic | English | Route | Icon (Heroicons) |
|---|---|---|---|
| التقويم | Calendar | `/admin` | `CalendarDaysIcon` |
| الحجوزات | Bookings | `/admin/bookings` | `ClipboardDocumentListIcon` |
| الخدمات | Services | `/admin/services` | `ScissorsIcon` (or SparklesIcon) |
| الموظفات | Staff | `/admin/staff` | `UsersIcon` |
| الإعدادات | Settings | `/admin/settings` | `Cog6ToothIcon` |

---

## File Plan

### Modified
- `app/layouts/admin.vue` — full rewrite
- `i18n/locales/ar.json` — add `admin.bookings`
- `i18n/locales/en.json` — add `admin.bookings`

### Created
- `app/components/admin/AdminNavLinks.vue` — shared nav list (sidebar + drawer)
- `app/pages/admin/bookings.vue` — stub (heading only)
- `app/pages/admin/services.vue` — stub (heading only)
- `app/pages/admin/staff.vue` — stub (heading only)
- `app/pages/admin/settings.vue` — stub (heading only)

---

## Layout Structure

### Desktop (`lg` and up)

```
┌─────────────────────────────────┬───────────┐
│         Main content            │  Sidebar  │  ← RTL: sidebar on right (start side)
│                                 │           │
│         <slot />                │  [Logo]   │
│                                 │  [Name]   │
│                                 │           │
│                                 │  [Nav]    │
│                                 │           │
│                                 │  [Logout] │
└─────────────────────────────────┴───────────┘
```

- Sidebar width: `w-64` (256px)
- Sidebar background: `bg-white`, `border-s border-gray-100` (logical property, RTL = right border)
- Content area: `flex-1 overflow-auto bg-gray-50`

### Mobile (below `lg`)

```
┌──────────────────────────────────┐
│ ☰  |  صالون نور للتجميل         │  ← sticky header
├──────────────────────────────────┤
│                                  │
│         Main content             │
│          <slot />                │
│                                  │
└──────────────────────────────────┘
```

When hamburger tapped → USlideover slides in from right (start side in RTL):
```
┌──────────────────────┬──────────────────────────┐
│  backdrop (click     │   [Logo]                 │
│  to close)           │   [Name]                 │
│                      │   [Nav items]            │
│                      │   [Logout]               │
└──────────────────────┴──────────────────────────┘
```

---

## AdminNavLinks Component

Props:
- `tenant: Tenant` — for branding in the drawer header
- `onClose?: () => void` — called when a nav item is tapped (closes drawer on mobile; no-op on desktop)

Renders:
1. Salon avatar (brand-color initial or logo image) + name
2. Nav items list — each item: icon + Arabic label, active state = `bg-gray-100 text-gray-900`, inactive = `text-gray-600 hover:bg-gray-50`
3. Logout button at bottom

---

## Active State Logic

```ts
function isActive(to: string): boolean {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}
```

Active class: `bg-gray-100 font-medium text-gray-900`
Inactive class: `text-gray-600 hover:bg-gray-50`

---

## Stub Pages

Each stub has `layout: 'admin'` and `middleware: 'auth'`, and renders a page title using `$t('admin.<section>')`. No functionality.

---

## i18n Additions

```json
// ar.json — add to admin object:
"bookings": "الحجوزات"

// en.json — add to admin object:
"bookings": "Bookings"
```

---

## Out of Scope

- Logout functionality (Supabase auth wiring)
- Admin index page content (today's calendar — separate feature)
- Any CRUD functionality on stub pages
- Real tenant data (using mockTenant throughout)
