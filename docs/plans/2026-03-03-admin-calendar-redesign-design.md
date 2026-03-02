# Admin Calendar Redesign — Design Document

**Date:** 2026-03-03
**Branch:** design-updtes
**Goal:** Redesign and polish the admin calendar with three views (Day, Staff Grid, Agenda), staff avatars with colored rings, a slide-over for booking actions, click-to-create booking from any slot, and a date-picker for navigation. No extra libraries — built entirely on Nuxt UI v3 + `@internationalized/date` (already installed).

---

## Problem Statement

The current calendar has a single day-timeline view that works but feels unpolished:

1. **No view switching** — only the 30-min day timeline. Admins can't see all staff at once or browse upcoming bookings as a list.
2. **Staff colors are weak** — CSS class strings with no avatar representation. Hard to distinguish at a glance.
3. **Actions are buried inline** — tiny confirm/cancel buttons on each card, no space for details.
4. **Date navigation is primitive** — only prev/next day chevrons. Jumping to a future date requires many clicks.
5. **No way to create bookings from the admin** — only the customer-facing flow can create bookings.
6. **Missing polish** — no hover states, no transitions, empty cells look dead.

---

## Design Decisions

### Views: Day | Staff Grid | Agenda

Three views accessible from a `UButtonGroup` switcher in the toolbar:

- **Day** — current timeline improved (smoother, better hover states, avatar on cards)
- **Staff Grid** — columns = staff members, rows = time slots, for the selected day. Best for seeing availability at a glance.
- **Agenda** — upcoming bookings as a chronological flat list, grouped by date. Best for a quick operational overview.

Month view is explicitly deferred to a later plan.

### Date Navigation

- **Prev/Next**: `UButtonGroup` with icon-only chevron buttons
- **Date heading**: clickable text → `UPopover` containing a `UCalendar` (jump to any date)
- **Today pill**: only shown when not on today — `UButton size="xs" variant="soft"` that snaps back to today
- Week strip updates to the week containing the newly selected date after picker selection

### Staff Colors + Avatars

`StaffColorScheme` gains a `ring` Tailwind class for `UAvatar` borders:

```ts
interface StaffColorScheme {
  bg: string      // card background (e.g. 'bg-teal-50 dark:bg-teal-950/50')
  border: string  // card left border (e.g. 'border-teal-300 dark:border-teal-800')
  text: string    // secondary text (e.g. 'text-teal-700 dark:text-teal-300')
  dot: string     // small dot (e.g. 'bg-teal-400')
  ring: string    // avatar ring (e.g. 'ring-teal-400 dark:ring-teal-500')
}
```

Color palette — 6 distinct colors to support up to 6 staff members before cycling:
- teal, rose, violet, amber, sky, emerald

Staff with `photoUrl` show the photo. Without → `UAvatar` with initials, background uses the palette's muted tone.

### Slide-Over: View + Create Modes

Single `AdminBookingSlideOver` component with `mode: 'view' | 'create'` prop.

**View mode** — triggered by clicking any existing booking card (in any view):
- Customer name + phone (phone is tappable on mobile)
- Service name + staff name + duration + date + time
- Status badge
- Context-sensitive actions: Confirm (pending only), Complete (confirmed only), Cancel (not completed/cancelled) with inline "are you sure?" confirmation

**Create mode** — triggered by clicking any empty time slot:
- Service: `USelect` (required)
- Staff: pre-filled from clicked column (editable); `USelect`
- Date: pre-filled from selected date (editable via `UCalendar` in `UPopover`)
- Time: pre-filled from clicked slot (editable); `USelect` of available slots
- Customer name: `UInput`
- Customer phone: `UInput` (numeric keyboard on mobile)
- Submit → `POST /api/admin/bookings` → refresh → close

### API: Date Range Support

`getBookingsByTenant` currently supports `date` (exact). Add `from`/`to` range filter:

```ts
// server/utils/repositories/bookings.ts
interface Options {
  date?: string
  from?: string   // ← new
  to?: string     // ← new
  status?: BookingStatus
}
// Implementation: if from/to → .gte('date', from).lte('date', to)
```

The API route (`/api/admin/bookings`) passes `from`/`to` from query params.

`useCalendar` uses date range fetches for:
- Agenda mode: `from=today&to=today+30days`
- Week strip dot indicators: already covered by day view fetches (dots per day known)

---

## UI Polish Principles

Every interactive element should feel responsive and deliberate. Key hover patterns:

### Booking Cards (Day view + Agenda)
```
Default:   bg-teal-50  border-s-4 border-teal-300  shadow-none
Hover:     bg-teal-100/80  shadow-sm  cursor-pointer  translate-x-0.5 (subtle)
Active:    scale-[0.99]  shadow-none
Transition: all 150ms ease
```

### Staff Grid Cells
```
Empty slot:
  Default:   bg-transparent
  Hover:     bg-(--color-surface-muted)/60  cursor-pointer
             + subtle "+" icon appears (text-(--color-text-muted))
  Transition: background 100ms ease

Booked slot (mini-card):
  Default:   rounded-lg  bg-teal-50  border-s-2  border-teal-300  px-2 py-1
  Hover:     shadow-md  ring-1 ring-teal-200  cursor-pointer
  Transition: shadow 150ms, ring 150ms
```

### Week Strip Buttons
```
Default (normal day):  ghost  text-(--color-text-muted)
Default (today):       soft   text-(--color-text)
Selected:              solid  color=neutral
Hover (unselected):    bg-(--color-surface-muted)  text-(--color-text)
Transition: 100ms
```

### Day Header Nav Controls
```
Prev/Next icons:
  Default:   ghost  neutral
  Hover:     soft   neutral  (subtle fill appears)

Date heading text:
  Default:   font-semibold  cursor-pointer  no underline
  Hover:     text-(--color-primary)  underline-offset-2  underline dotted
  (signals it's clickable to open the date picker)
```

### Agenda Rows
```
Default:   py-3  border-b border-(--color-border)  bg-transparent
Hover:     bg-(--color-surface-muted)/50  rounded-lg  cursor-pointer
Transition: background 120ms
```

### Slide-Over Actions
```
Confirm button:  color=primary  variant=solid  → hover: shadow-sm  scale: none
Complete button: color=success  variant=solid  → hover: shadow-sm
Cancel trigger:  color=neutral  variant=ghost  → hover: bg-red-50 text-red-600 (signals destructive)
Cancel confirm:  color=error    variant=solid  (appears inline, shake animation optional)
```

---

## Component Architecture

### Modified: `useCalendar.ts`
- Add `selectedView: Ref<'day' | 'staff' | 'agenda'>`
- Add `selectedBooking: Ref<Booking | null>` + `openBooking()` / `closeBooking()`
- Add `createMode: Ref<{ date: string; time: string; staffId: string | null } | null>` for new booking pre-fill
- Add `openCreateBooking(date, time, staffId)` / `closeCreateBooking()`
- Extend API fetch to support `from`/`to` range
- Add `agendaBookings` computed (next 30 days, non-cancelled, grouped by date)
- Add `ring` to `StaffColorScheme`, expand palette to 6 colors

### New: `AdminCalendarViewSwitcher.vue`
- `UButtonGroup` with Day / Staff / Agenda icons + labels
- Emits `update:modelValue`
- Active view gets `variant="solid" color="neutral"`

### New: `AdminCalendarDatePicker.vue`
- The clickable date heading + `UPopover` + `UCalendar`
- Emits `select(date: string)`
- The heading text has a subtle caret icon (`i-heroicons-chevron-down` size xs) indicating it's clickable
- Closes popover on date selection

### New: `AdminCalendarStaffGrid.vue`
- Props: `timeSlots`, `staffList`, `bookingsBySlotAndStaff`, `colorSchemes`
- Sticky first column (time labels), sticky header row (staff avatars)
- `overflow-auto` wrapper, `min-w-0` on parent
- Each cell: `@click` on empty → `emit('create', { time, staffId })`; on booking → `emit('open', booking)`
- Booking mini-card: truncated customer name + service name

### New: `AdminCalendarAgenda.vue`
- Props: `agendaBookings` (grouped `Array<{ date: string; bookings: Booking[] }>`)
- Date group headings: sticky, formatted as "اليوم", "غداً", or full Arabic date
- Each row: clickable booking line with avatar dot, name, service, time, status badge
- Empty state: `UEmpty`

### New: `AdminBookingSlideOver.vue`
- Props: `mode: 'view' | 'create'`, `booking?: Booking`, `createDefaults?: { date, time, staffId }`
- Uses `USlideover`
- View mode: read-only display + action buttons
- Create mode: `UForm` with `USelect` (service, staff, time), `UInput` (name, phone), `UCalendar` popover for date
- Emits: `confirm`, `cancel`, `complete`, `create(payload)`, `close`

### Updated: `AdminCalendarEntry.vue`
- Add optional `showAvatar?: boolean` prop
- When `showAvatar`: show `UAvatar` (size="xs") with staff photo or initials + ring class from color scheme
- Remove inline action buttons — clicking the card emits `click` instead
- Hover: `cursor-pointer` + card lift (shadow-sm + subtle translate)
- Transition class on root element

### Updated: `AdminCalendarWeekStrip.vue`
- Migrate raw `<button>` to `UButton` (already planned in design-update.md)
- Add `transition-colors` explicitly

### Updated: `admin/index.vue`
- Add view switcher below week strip
- Add `AdminCalendarDatePicker` replacing the static heading
- Wire up all new components
- `UButtonGroup` for prev/next/today navigation

---

## New API Route

```ts
// server/api/admin/bookings/index.get.ts (updated)
const query = getQuery(event)
return getBookingsByTenant(event, tenantId, {
  date:   query.date   as string | undefined,
  from:   query.from   as string | undefined,  // ← new
  to:     query.to     as string | undefined,  // ← new
  status: query.status as BookingStatus | undefined,
})
```

---

## i18n Keys Needed

```json
// ar.json additions under "admin.calendar":
{
  "calendar": {
    "label": "already exists",
    "noBookings": "already exists",
    "viewDay": "يوم",
    "viewStaff": "موظفون",
    "viewAgenda": "قائمة",
    "newBooking": "حجز جديد",
    "selectService": "اختر الخدمة",
    "selectStaff": "اختر الموظف",
    "selectTime": "اختر الوقت",
    "addBooking": "إضافة حجز",
    "emptySlot": "إضافة حجز",
    "upcomingEmpty": "لا توجد حجوزات قادمة"
  }
}
```

---

## Files to Create

| File | Type |
|---|---|
| `app/components/admin/AdminCalendarViewSwitcher.vue` | New |
| `app/components/admin/AdminCalendarDatePicker.vue` | New |
| `app/components/admin/AdminCalendarStaffGrid.vue` | New |
| `app/components/admin/AdminCalendarAgenda.vue` | New |
| `app/components/admin/AdminBookingSlideOver.vue` | New |

## Files to Modify

| File | Changes |
|---|---|
| `app/composables/admin/useCalendar.ts` | selectedView, slide-over state, create state, range fetch, agendaBookings, ring color, 6-color palette |
| `app/components/admin/AdminCalendarEntry.vue` | Avatar support, click-to-open, hover states |
| `app/components/admin/AdminCalendarWeekStrip.vue` | UButton migration, transitions |
| `app/pages/admin/index.vue` | Wire all new components |
| `server/api/admin/bookings/index.get.ts` | from/to query params |
| `server/utils/repositories/bookings.ts` | from/to date range filter |
| `i18n/locales/ar.json` | New calendar keys |
| `i18n/locales/en.json` | New calendar keys |

---

## Success Criteria

- [ ] View switcher switches between Day / Staff Grid / Agenda instantly
- [ ] Staff Grid shows all staff as columns with UAvatar headers and colored rings
- [ ] Clicking date heading opens UCalendar picker — selecting a date navigates there
- [ ] Clicking any booking (in any view) opens slide-over with full details + actions
- [ ] Clicking any empty slot opens slide-over in create mode with pre-filled date/time/staff
- [ ] New booking created from admin appears immediately on the calendar after save
- [ ] All booking cards show hover states (lift, shadow, cursor-pointer)
- [ ] Empty slots in Staff Grid show "+" on hover
- [ ] Agenda rows show hover background
- [ ] Week strip buttons have smooth transitions
- [ ] Everything works in RTL and both light/dark modes
